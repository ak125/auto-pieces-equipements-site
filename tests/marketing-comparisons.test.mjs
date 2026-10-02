import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { compareSources, experimentReport } from '../scripts/marketing/insights.mjs';
import { PROJECT } from '../scripts/marketing/common.mjs';

const now=new Date('2026-10-02T10:00:00Z');
const plan=()=>({minimumPerArm:1,primary:'qualified-request',until:'2026-10-01T10:00:00Z'});
const participants=()=>[{id:'syn-a',variant:'control',converted:true},{id:'syn-b',variant:'variant',converted:false}];
const source=()=>({ref:'fixture-a',subject:'battery',value:40,checkedAt:'2026-09-29T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z'});

test('experiment conflicting conversions cannot be overwritten by input order',()=>{
  const rows=participants(), conflict={...rows[0],converted:false};
  for(const input of [[...rows,conflict],[conflict,...rows]]) {
    const out=experimentReport(input,plan(),now);
    assert.equal(out.contamination,true);
    assert.equal(out.status,'blocked');
    assert.equal(out.decision,'blocked');
    assert.equal(out.arms,null);
    assert.equal(out.winner,null);
  }
});

test('experiment unknown conversions are not counted as failures or declared ready',()=>{
  for(const converted of [undefined,null]) {
    const out=experimentReport([{...participants()[0],converted},participants()[1]],plan(),now);
    assert.equal(out.decision,'inconclusive');
    assert.equal(out.arms[0].converted,null);
    assert.equal(out.arms[0].unknown,1);
    assert.equal(out.arms[1].converted,0);
    assert.equal(out.causalityEstablished,false);
  }
  assert.equal(experimentReport([{...participants()[0],converted:'true'}],plan(),now).status,'blocked');
});

test('experiment validates collections, variants, integer plan and clock',()=>{
  for(const input of [undefined,{},[null],[{...participants()[0],variant:' control '}],Array(1001).fill(participants()[0])])
    assert.equal(experimentReport(input,plan(),now).status,'blocked');
  for(const override of [{minimumPerArm:0.5},{minimumPerArm:0},{primary:''},{until:'unknown'}])
    assert.equal(experimentReport(participants(),{...plan(),...override},now).status,'blocked');
  assert.equal(experimentReport(participants(),plan(),new Date(NaN)).status,'blocked');
});

test('experiment deduplicates canonical identities, keeps valid review and incomplete windows distinct',()=>{
  const rows=participants();
  const out=experimentReport([...rows,{converted:true,variant:'control',id:' syn-a ',note:'same participant'}],plan(),now);
  assert.equal(out.arms[0].n,1);
  assert.equal(out.arms[0].converted,1);
  assert.equal(out.decision,'ready-for-statistical-review');
  assert.deepEqual(out.errors,[]);
  assert.equal(out.winner,null);
  assert.equal(experimentReport(rows,{...plan(),until:'2026-10-03T10:00:00Z'},now).decision,'inconclusive');
  assert.equal(experimentReport([],plan(),now).decision,'inconclusive');
});

test('simultaneous contradictory source values cannot become an arbitrary comparison baseline',()=>{
  const a=source(), b={...a,ref:'fixture-b',value:50}, c={...a,ref:'fixture-c',value:60,checkedAt:'2026-09-30T00:00:00Z'};
  const forward=compareSources([a,b,c],now), reverse=compareSources([c,b,a],now);
  assert.equal(forward.status,'blocked');
  assert.ok(forward.errors.includes('SOURCE_CONFLICT'));
  assert.deepEqual(forward.changes,[]);
  assert.deepEqual(forward,reverse);
});

test('comparison validates collection, observation schema, future dates and numeric differences',()=>{
  for(const input of [undefined,{},[null],[{...source(),value:'40'}],
    [{...source(),checkedAt:'2026-10-03T00:00:00Z'}],
    [{...source(),expiresAt:'2026-09-28T00:00:00Z'}],Array(1001).fill(source()),
    [{...source(),value:-Number.MAX_VALUE},{...source(),ref:'fixture-b',value:Number.MAX_VALUE,checkedAt:'2026-09-30T00:00:00Z'}]]) {
    const out=compareSources(input,now);
    assert.equal(out.status,'blocked');
    assert.deepEqual(out.changes,[]);
    assert.ok(out.errors.length);
  }
  assert.equal(compareSources([source()],new Date(NaN)).status,'blocked');
});

test('comparison deduplicates equivalent instants and excludes explicitly stale sources',()=>{
  const a=source(), b={...a,ref:'fixture-b',value:42,checkedAt:'2026-09-30T00:00:00Z'};
  const duplicate={...a,checkedAt:'2026-09-29T02:00:00+02:00'};
  const out=compareSources([b,duplicate,a],now);
  assert.equal(out.status,'compared');
  assert.deepEqual(out.errors,[]);
  assert.equal(out.changes.length,1);
  assert.equal(out.changes[0].difference,2);
  assert.deepEqual(out,compareSources([a,b,duplicate],now));
  const stale=compareSources([{...a,expiresAt:'2026-09-30T00:00:00Z'}],now);
  assert.equal(stale.stale,1);
  assert.equal(stale.status,'insufficient-data');
  assert.equal(compareSources([],now).status,'insufficient-data');
});

test('CLI surfaces comparison and experiment blocks and keeps unknown conversions inconclusive',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-comparisons-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  const envelope={project:PROJECT,environment:'simulation',classification:'synthetic',schemaVersion:'2.0.0',runId:'syn-comparison'};
  for(const [command,payload,exit] of [
    ['compare',{sources:[source(),{...source(),ref:'fixture-b',value:50}]},1],
    ['experiment',{participants:[...participants(),{...participants()[0],converted:false}],plan:plan()},1],
    ['experiment',{participants:[{...participants()[0],converted:null},participants()[1]],plan:plan()},0]
  ]) {
    const file=path.join(dir,command+'.json');await writeFile(file,JSON.stringify({...envelope,...payload}));
    const out=spawnSync(process.execPath,[cli,command,file,'--now',now.toISOString()],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,exit,command+': '+out.stdout);
    const body=JSON.parse(out.stdout);
    assert.equal(body.status,exit?'blocked':'completed-simulation');
    if(!exit) assert.equal(body.result.decision,'inconclusive');
    assert.equal(body.externalCalls,0);assert.equal(body.canExecute,false);
  }
});
