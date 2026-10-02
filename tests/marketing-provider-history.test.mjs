import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { simulateProvider } from '../scripts/marketing/operations.mjs';
import { PROJECT } from '../scripts/marketing/common.mjs';

const action={key:'syn-send',outcome:'accepted'};
const prior={key:'syn-send',status:'accepted'};

test('provider simulation cannot treat missing or malformed history as a first send',()=>{
  for(const history of [undefined,null,{},[null],Array(1),[{key:'syn-other'}],
    [{key:'syn-other',status:'unknown'}],[{...prior,providerId:123}],Array(1001).fill(prior)]) {
    const out=simulateProvider(action,history);
    assert.equal(out.status,'blocked'); assert.ok(out.errors.includes('PROVIDER_HISTORY_INVALID'));
    assert.equal(out.retryAllowed,false); assert.equal(out.externalCalls,0);
  }
});

test('provider simulation recognizes prior keys despite surrounding whitespace',()=>{
  for(const [status,expected] of [['accepted','duplicate'],['processed','duplicate'],['uncertain','reconcile-required'],['pending','reconcile-required']]) {
    const out=simulateProvider({...action,key:' syn-send '},[{key:'syn-send',status}]);
    assert.equal(out.status,expected); assert.equal(out.key,'syn-send');
    assert.equal(simulateProvider(action,[{key:' syn-send ',status:' '+status+' '}]).status,expected);
  }
});

test('conflicting prior states cannot make idempotency depend on row order',()=>{
  for(const other of ['uncertain','processed','rejected','cancelled','quota']) {
    const history=[prior,{...prior,status:other}];
    const first=simulateProvider(action,history), reversed=simulateProvider(action,[...history].reverse());
    assert.equal(first.status,'blocked'); assert.ok(first.errors.includes('PROVIDER_HISTORY_CONFLICT'));
    assert.deepEqual(first,reversed); assert.equal(first.retryAllowed,false);
  }
});

test('conflicting provider bindings cannot be hidden by matching statuses',()=>{
  const history=[{...prior,providerId:'syn-provider-a'},{...prior,providerId:'syn-provider-b'}];
  for(const rows of [history,[...history].reverse()]) {
    const out=simulateProvider(action,rows);
    assert.equal(out.status,'blocked'); assert.ok(out.errors.includes('PROVIDER_HISTORY_CONFLICT'));
  }
});

test('malformed actions are input errors rather than simulated provider rejections',()=>{
  for(const input of [null,{}, {...action,key:'invalid'}, {...action,outcome:'unknown'}, {...action,outcome:null}]) {
    for(const history of [[],[prior]]) {
      const out=simulateProvider(input,history);
      assert.equal(out.status,'blocked'); assert.ok(out.errors.includes('PROVIDER_ACTION_INVALID'));
    }
  }
});

test('explicit empty history and concordant bounded snapshots preserve simulated outcomes',()=>{
  for(const [outcome,expected] of [['accepted','accepted'],['rejected','rejected'],['uncertain','uncertain'],['quota','quota'],['timeout','uncertain']])
    assert.equal(simulateProvider({...action,outcome},[]).status,expected);
  const history=Object.freeze([
    Object.freeze({...prior,providerId:'syn-provider'}),Object.freeze({...prior,note:'same state'}),
    Object.freeze({...prior,providerId:' syn-provider ',note:'same binding'})
  ]);
  assert.equal(simulateProvider(Object.freeze({...action}),history).status,'duplicate');
  assert.equal(simulateProvider(action,[...history].reverse()).status,'duplicate');
  const bounded=Array.from({length:1000},(_,i)=>({key:'syn-other-'+i,status:'accepted'}));
  assert.equal(simulateProvider(action,bounded).status,'accepted');
  for(const status of ['accepted','processed','rejected','cancelled','quota'])
    assert.equal(simulateProvider(action,[{...prior,status}]).status,'duplicate');
});

test('CLI distinguishes invalid prior data from valid rejection timeout and duplicate simulations',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-provider-history-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  const envelope={project:PROJECT,environment:'simulation',classification:'synthetic',schemaVersion:'2.0.0',runId:'syn-provider-test'};
  const cases=[
    [{action},1,'blocked'],
    [{action,prior:[prior,{...prior,status:'uncertain'}]},1,'blocked'],
    [{action:{...action,outcome:'unknown'},prior:[]},1,'blocked'],
    [{action:{...action,outcome:'rejected'},prior:[]},0,'rejected'],
    [{action:{...action,outcome:'quota'},prior:[]},0,'quota'],
    [{action:{...action,outcome:'timeout'},prior:[]},0,'uncertain'],
    [{action,prior:[{...prior,status:'pending'}]},0,'reconcile-required'],
    [{action,prior:[prior]},0,'duplicate']
  ];
  for(const [payload,exit,status] of cases) {
    const file=path.join(dir,'input.json');await writeFile(file,JSON.stringify({...envelope,...payload}));
    const out=spawnSync(process.execPath,[cli,'provider-test',file],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,exit,out.stdout);
    const body=JSON.parse(out.stdout); assert.equal(body.status,exit?'blocked':'completed-simulation');
    assert.equal(body.result.status,status); assert.equal(body.canExecute,false); assert.equal(body.externalCalls,0);
  }
});
