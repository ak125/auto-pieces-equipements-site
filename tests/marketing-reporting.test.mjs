import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { commercialReport } from '../scripts/marketing/insights.mjs';

const fixture=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/report.json',import.meta.url),'utf8'));
const report=()=>structuredClone(fixture.report);
const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));

test('report distinguishes unknown or malformed history from an explicitly empty history',()=>{
  for(const events of [undefined,null,{},[null],[{}],[{kind:'sale'}],
    [{kind:' sale ',object:'syn-order',amount:42,currency:'EUR'}],
    [{kind:' quote ',object:'syn-quote'}],Array(1001).fill({kind:'open'})]) {
    const out=commercialReport({...report(),events});
    assert.equal(out.status,'blocked');
    for(const key of ['requests','quotes','sales','netRevenue','quoteToSale','margin','humanClicks','routeClicks'])
      assert.equal(out[key],null,key);
    assert.ok(out.errors.length>0);
  }
  const empty=commercialReport({...report(),events:[]});
  assert.equal(empty.status,'report');
  assert.equal(empty.sales,0);
  assert.equal(empty.netRevenue,0);
  assert.equal(empty.quoteToSale,null);
});

test('report requires an identified cohort, source and valid period before publishing metrics',()=>{
  for(const override of [{source:''},{cohort:null},{period:{}},{period:{from:'2026-10-02T10:00:00Z',to:'2026-09-01T00:00:00Z'}}]) {
    const out=commercialReport({...report(),...override});
    assert.equal(out.status,'blocked');
    assert.ok(out.errors.includes('REPORT_SCOPE'));
    assert.equal(out.netRevenue,null);
  }
});

test('report conflicts block all aggregates and cannot depend on event order',()=>{
  const input=report();
  const conflict={...input.events.at(-1),amount:84};
  for(const events of [[...input.events,conflict],[conflict,...input.events]]) {
    const out=commercialReport({...input,events});
    assert.equal(out.status,'blocked');
    assert.equal(out.conflict,true);
    assert.ok(out.errors.includes('REPORT_CONFLICT'));
    assert.equal(out.netRevenue,null);
    assert.equal(out.requests,null);
  }
});

test('report preserves deduplication and legitimate partial coverage',()=>{
  const input=report();
  const out=commercialReport({...input,events:[...input.events,input.events.at(-1)]});
  assert.equal(out.status,'report');
  assert.deepEqual(out.errors,[]);
  assert.equal(out.sales,1);
  assert.equal(out.netRevenue,42);
  assert.equal(out.quoteToSale,1);
  const partial=commercialReport({...input,salesCoverage:false});
  assert.equal(partial.status,'report');
  assert.equal(partial.sales,null);
  assert.equal(partial.netRevenue,null);
  assert.equal(partial.quotes,1);
});

test('report rejects invalid coverage declarations and unrepresentable aggregates',()=>{
  for(const override of [
    {salesCoverage:'true'},
    {quoteCoverage:'true'},
    {costCoverage:'complete',costs:-1},
    {events:[{kind:'sale',object:'syn-a',amount:1e308,currency:'EUR'},{kind:'sale',object:'syn-b',amount:1e308,currency:'EUR'}]}
  ]) {
    const out=commercialReport({...report(),...override});
    assert.equal(out.status,'blocked');
    assert.equal(out.netRevenue,null);
    assert.ok(out.errors.length>0);
  }
});

test('CLI propagates an invalid commercial report through both report and J18',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-reporting-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const scenarios=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/scenarios.json',import.meta.url),'utf8'));
  const journey=scenarios.find(s=>s.journey==='J18');
  assert.ok(journey);
  for(const [command,input] of [['report',fixture],['journey',journey]]) {
    const file=path.join(dir,command+'.json');
    await writeFile(file,JSON.stringify({...input,report:{...report(),events:null}}));
    const out=spawnSync(process.execPath,[cli,command,file,'--now','2026-10-02T10:00:00Z'],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,1,command+': '+out.stdout);
    const body=JSON.parse(out.stdout);
    assert.equal(body.status,'blocked');
    assert.equal(body.canExecute,false);
    assert.equal(body.externalCalls,0);
    if(command==='journey') {
      assert.equal(body.result.decision,'blocked');
      assert.ok(body.result.reasons.includes('EVENT_HISTORY_UNKNOWN'));
    }
  }
});

test('CLI unavailable execution has a distinct nonzero exit without any real effect',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-unavailable-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const file=path.join(dir,'action.json');
  await writeFile(file,JSON.stringify({...fixture,action:{}}));
  const out=spawnSync(process.execPath,[cli,'execute',file],{encoding:'utf8',timeout:15000});
  assert.equal(out.status,2,out.stdout);
  const body=JSON.parse(out.stdout);
  assert.equal(body.status,'unavailable');
  assert.equal(body.externalCalls,0);
  assert.equal(body.canExecute,false);
});
