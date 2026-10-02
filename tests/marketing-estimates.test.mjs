import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loyaltyProposal, forecast } from '../scripts/marketing/insights.mjs';
import { PROJECT } from '../scripts/marketing/common.mjs';

const policy=()=>({threshold:50,reward:5,referrer:'syn-a',referred:'syn-b'});
const sale=()=>({id:'syn-sale',amount:100,refunded:0});

test('loyalty cannot propose a reward with missing or malformed identities or policy',()=>{
  for(const override of [{referrer:undefined},{referred:''},{referrer:'unknown'},{threshold:0},{reward:-1}]) {
    const out=loyaltyProposal([sale()],{...policy(),...override});
    assert.equal(out.proposedReward,null);
    assert.equal(out.status,'blocked');
    assert.ok(out.errors.length);
    assert.equal(out.issued,false);
  }
});

test('loyalty compares thresholds and refunds in exact cents',()=>{
  const out=loyaltyProposal([{id:'syn-sale',amount:0.3,refunded:0.1}],{...policy(),threshold:0.2,reward:0.1});
  assert.equal(out.observedAmount,0.2);
  assert.equal(out.proposedReward,0.1);
  assert.equal(out.status,'proposal');
});

test('loyalty deduplication depends on economic fields, not JSON property order or metadata',()=>{
  const out=loyaltyProposal([sale(),{refunded:0,amount:100,id:'syn-sale',note:'same sale'}],policy());
  assert.equal(out.conflict,false);
  assert.equal(out.observedAmount,100);
  assert.equal(out.proposedReward,5);
  const self=loyaltyProposal([sale()],{...policy(),referrer:' syn-a ',referred:'syn-a'});
  assert.equal(self.proposedReward,0);
  assert.equal(self.status,'proposal');
});

test('loyalty distinguishes missing or conflicting history from an explicit empty ledger',()=>{
  for(const sales of [undefined,{},[null],[sale(),{...sale(),amount:200}],[sale(),{}],Array(1001).fill(sale())]) {
    const out=loyaltyProposal(sales,policy());
    assert.equal(out.observedAmount,null);
    assert.equal(out.proposedReward,null);
    assert.equal(out.status,'blocked');
  }
  const empty=loyaltyProposal([],policy());
  assert.equal(empty.observedAmount,0);
  assert.equal(empty.proposedReward,0);
  assert.equal(empty.status,'proposal');
});

test('loyalty rejects fractional cents, currency mixtures and unsafe sums',()=>{
  for(const sales of [
    [{...sale(),amount:1.005}], [{...sale(),refunded:101}], [{...sale(),currency:'USD'}],
    [{...sale(),amount:60000000000000},{...sale(),id:'syn-other',amount:60000000000000}]
  ]) {
    const out=loyaltyProposal(sales,policy());
    assert.equal(out.status,'blocked');
    assert.equal(out.proposedReward,null);
    assert.equal(out.observedAmount,null);
  }
});

test('forecast refuses partial filtering and distinguishes unknown from explicitly empty observations',()=>{
  for(const observations of [undefined,{},[10,'bad',30],[10,-1],[null],[Infinity],Array(1001).fill(1)]) {
    const out=forecast(observations,{capacity:20});
    assert.equal(out.status,'blocked');
    assert.equal(out.baseline,null);
    assert.equal(out.scenarioRange,null);
    assert.equal(out.capacityRisk,null);
    assert.ok(out.errors.length);
  }
  const empty=forecast([],{capacity:20});
  assert.equal(empty.status,'insufficient-data');
  assert.equal(empty.baseline,null);
  assert.equal(empty.capacityRisk,null);
  assert.equal(forecast([0],{}).baseline,0);
});

test('forecast computes a finite mean without overflowing a valid series',()=>{
  const out=forecast([Number.MAX_VALUE,Number.MAX_VALUE],{});
  assert.equal(out.baseline,Number.MAX_VALUE);
  assert.equal(out.status,'estimated');
  const ordinary=forecast([10,12,8],{capacity:11});
  assert.equal(ordinary.baseline,10);
  assert.deepEqual(ordinary.scenarioRange,[8,12]);
  assert.equal(ordinary.capacityRisk,true);
  assert.equal(ordinary.scheduling,false);
});

test('forecast rejects an invalid capacity but preserves an unknown capacity',()=>{
  for(const capacity of [-1,'20',Infinity]) {
    const out=forecast([10,20],{capacity});
    assert.equal(out.status,'blocked');
    assert.equal(out.baseline,null);
    assert.equal(out.capacityRisk,null);
  }
  assert.equal(forecast([10,20],{}).capacityRisk,null);
  assert.equal(forecast([10,20],{capacity:null}).baseline,15);
});

test('CLI blocks invalid loyalty and forecast inputs and preserves valid simulation outcomes',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-estimates-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  const loyaltyFixture=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/loyalty.json',import.meta.url),'utf8'));
  const forecastFixture=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/forecast.json',import.meta.url),'utf8'));
  const envelope={project:PROJECT,environment:'simulation',classification:'synthetic',schemaVersion:'2.0.0',runId:'syn-estimate'};
  for(const [command,payload,exit,status] of [
    ['loyalty',{sales:[sale()],policy:{...policy(),referrer:null}},1,'blocked'],
    ['forecast',{observations:[1,'bad',2],policy:{}},1,'blocked'],
    ['loyalty',loyaltyFixture,0,'proposal'],
    ['forecast',forecastFixture,0,'estimated'],
    ['forecast',{observations:[],policy:{}},0,'insufficient-data']
  ]) {
    const file=path.join(dir,command+'.json');
    await writeFile(file,JSON.stringify({...envelope,...payload}));
    const out=spawnSync(process.execPath,[cli,command,file],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,exit,command+': '+out.stdout);
    const body=JSON.parse(out.stdout);
    assert.equal(body.result.status,status);
    assert.equal(body.status,exit?'blocked':'completed-simulation');
    assert.equal(body.canExecute,false);
    assert.equal(body.externalCalls,0);
    if(status==='proposal') {
      assert.equal(body.result.observedAmount,80);
      assert.equal(body.result.proposedReward,5);
      assert.equal(body.result.issued,false);
    }
    if(status==='estimated') {
      assert.equal(body.result.baseline,10);
      assert.equal(body.result.capacityRisk,true);
      assert.equal(body.result.scheduling,false);
    }
  }
});
