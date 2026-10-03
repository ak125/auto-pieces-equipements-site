import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const cli=new URL('../scripts/marketing-workbench.mjs',import.meta.url);
const file=await import('node:url').then(m=>m.fileURLToPath(cli));
const run=(...args)=>spawnSync(process.execPath,[file,...args],{encoding:'utf8',timeout:15000});
test('CLI exposes useful help and anchored demo from another directory',()=>{
  const help=run('--help');assert.equal(help.status,0,help.stderr);assert.ok(help.stdout.includes('segment'));
  const demo=spawnSync(process.execPath,[file,'demo'],{cwd:process.env.TEMP,encoding:'utf8',timeout:15000});
  assert.equal(demo.status,0,demo.stderr);const out=JSON.parse(demo.stdout);
  assert.equal(out.result.length,18);assert.equal(out.externalCalls,0);assert.equal(out.canExecute,false);
});
test('T11 CLI unknown command and private-looking path never echo content or launch it',()=>{
  const result=run('send','private.env');
  assert.equal(result.status,1);assert.ok(!result.stderr.includes('private.env'));
  assert.equal(JSON.parse(result.stderr).error,'INVALID_REQUEST');
});

test('P16 CLI review recipe prioritizes current versions and existing replies over sensitive content',async t=>{
  const fixture=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/review.json',import.meta.url),'utf8'));
  const directory=await mkdtemp(join(tmpdir(),'ape-review-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  for(const scenario of [
    {name:'sensitive review requires a human',changes:{},decision:'human'},
    {name:'answered sensitive review does not prepare another reply',changes:{existingReply:'Réponse du magasin déjà publiée.'},decision:'skip'},
    {name:'changed answered review must be rechecked',changes:{existingReply:'Réponse du magasin déjà publiée.',currentVersion:'v2'},decision:'recheck'}
  ]) await t.test(scenario.name,async()=>{
    const input=join(directory,'review.json');
    await writeFile(input,JSON.stringify({...fixture,review:{...fixture.review,...scenario.changes}}));
    const result=run('review',input,'--now','2026-10-02T10:00:00Z');
    assert.equal(result.status,0,result.stderr);
    assert.equal(result.stderr,'');
    const output=JSON.parse(result.stdout);
    assert.equal(output.result.decision,scenario.decision);
    assert.equal(output.canExecute,false);
    assert.equal(output.externalCalls,0);
    if(scenario.decision==='human') {
      assert.ok(output.result.draft.includes('canal privé'));
      assert.ok(!output.result.draft.includes('.env'));
    } else assert.equal(output.result.draft,null);
  });
});
test('T20 bounded performance 1000 synthetic imports and nested rule evaluations',async()=>{
  const m=await import('../scripts/marketing/data.mjs');
  const fixtures=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/scenarios.json',import.meta.url)));
  const p=fixtures[0].person, now=new Date('2026-10-02T10:00:00Z');
  const start=performance.now();
  const out=m.importSimulation({project:p.project,environment:'simulation',classification:'synthetic',
    records:Array.from({length:1000},(_,i)=>({...p,id:'syn-'+i,email:'fixture'+i+'@example.invalid'}))});
  assert.equal(out.records.length,1000);
  const matches=out.records.map(p=>m.evaluateSegment(p,{all:[{field:'kind',equals:'professional'},{not:{field:'need',equals:'unknown'}}]},now));
  assert.equal(matches.length,1000);assert.ok(matches.every(m=>m.match===null));
  assert.ok(performance.now()-start<5000,'1000-record fixture exceeds 5s bounded budget');
});
