import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { arbitrate, channelCheck, reconcile } from '../scripts/marketing/operations.mjs';
import { PROJECT } from '../scripts/marketing/common.mjs';

const now=new Date('2026-10-02T10:00:00Z');
const item=()=>({id:'syn-action',account:'syn-account',channel:'email',cost:1,
  person:{id:'syn-person',project:PROJECT,preferences:[{brand:'APE',country:'FR',channel:'email',
    purpose:'marketing',state:'allowed',at:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',evidence:'fixture'}]}});
const policy=()=>({contactCap:10,accountCap:10,channelCap:10,costCap:10,window:'calendar-day',hours:[9,18]});
const history=()=>({subject:'syn-person',account:'syn-account',channel:'email',cost:1,status:'accepted',at:now.toISOString()});
const sms=()=>({channel:'sms',account:'syn-account',expectedAccount:'syn-account',eligible:true,
  stopVerified:true,senderVerified:true,costCap:1});
const receipt=()=>({key:'syn-send',providerId:'syn-provider',status:'accepted',proof:'fixture-receipt'});

test('quota accounting uses the same canonical identity accepted by validation',()=>{
  for(const [field,cap] of [['subject','contactCap'],['account','accountCap'],['channel','channelCap']]) {
    const row=history(); row[field]=' '+row[field]+' ';
    const out=arbitrate([item()],[row],{...policy(),[cap]:1},now);
    assert.equal(out.decisions[0].decision,'defer',field);
    assert.equal(out.decisions[0].reason,'SHARED_CAP');
  }
  const first=item(), second={...item(),id:'syn-second',account:' syn-account '};
  assert.equal(arbitrate([first,second],[],{...policy(),accountCap:1},now).decisions[1].decision,'defer');
  assert.equal(arbitrate([second],[history()],{...policy(),costCap:1},now).decisions[0].decision,'defer');
});

test('duplicate canonical candidate keys block the batch without arbitrary partial proposals',()=>{
  const a=item(), b={...item(),id:' syn-action ',cost:2};
  for(const items of [[a,a],[a,b],[b,a]]) {
    const out=arbitrate(items,[],policy(),now);
    assert.deepEqual(out.decisions,[]);
    assert.ok(out.errors.includes('DUPLICATE_CANDIDATE'));
  }
});

test('count caps are safe integers while explicit zero remains a valid stop',()=>{
  assert.ok(arbitrate([item()],[],{...policy(),window:' rolling '},now).errors.includes('POLICY_OR_LIMIT'));
  for(const cap of ['contactCap','accountCap','channelCap']) {
    for(const value of [1.5,Number.MAX_SAFE_INTEGER+1]) {
      const out=arbitrate([item()],[],{...policy(),[cap]:value},now);
      assert.deepEqual(out.decisions,[]);
      assert.ok(out.errors.includes('POLICY_OR_LIMIT'));
    }
    assert.equal(arbitrate([item()],[],{...policy(),[cap]:0},now).decisions[0].decision,'defer');
  }
});

test('Paris time windows honor fractional hours and their inclusive start and exclusive end',()=>{
  const p={...policy(),hours:[9.5,18.25]};
  for(const [at,decision] of [['2026-10-02T07:29:59.999Z','defer'],['2026-10-02T07:30:00Z','propose'],
    ['2026-10-02T16:14:59.999Z','propose'],['2026-10-02T16:15:00Z','defer']])
    assert.equal(arbitrate([item()],[],p,new Date(at)).decisions[0].decision,decision,at);
});

test('channel readiness rejects negative SMS budgets and invalid clocks',()=>{
  assert.equal(channelCheck({...sms(),costCap:-1},now).ready,false);
  assert.equal(channelCheck(sms(),new Date(NaN)).ready,false);
  for(const costCap of [0,1]) {
    const out=channelCheck({...sms(),costCap},now);
    assert.equal(out.ready,true); assert.equal(out.canExecute,false); assert.equal(out.connected,false);
  }
});

test('reconciliation requires an explicit known previous state and a well formed receipt',()=>{
  for(const status of [undefined,'unknown',null]) {
    const out=reconcile({key:'syn-send',status},receipt());
    assert.equal(out.status,'uncertain'); assert.ok(out.errors.length); assert.equal(out.retryAllowed,false);
  }
  for(const invalid of [{...receipt(),key:'syn-other'},{...receipt(),proof:''},
    {...receipt(),providerId:null},{...receipt(),status:'unknown'}]) {
    const out=reconcile({key:'syn-send',status:'uncertain'},invalid);
    assert.equal(out.status,'uncertain'); assert.ok(out.errors.length); assert.equal(out.retryAllowed,false);
  }
  assert.equal(reconcile({key:'syn-send',status:'accepted',providerId:null},receipt()).status,'uncertain');
  assert.equal(reconcile({key:'syn-send',status:'uncertain'},receipt()).status,'accepted');
});

test('reconciliation cannot replace an already bound provider identity',()=>{
  const out=reconcile({key:'syn-send',status:'accepted',providerId:'syn-other'},receipt());
  assert.equal(out.status,'conflict'); assert.ok(out.errors.includes('PROVIDER_CONFLICT'));
  assert.equal(out.retryAllowed,false);
});

test('reconciliation preserves terminal states and normalizes validated status and keys',()=>{
  for(const [previous,next] of [['processed','accepted'],['rejected','accepted'],['cancelled','processed'],['accepted','rejected'],['quota','accepted']]) {
    const out=reconcile({key:'syn-send',status:previous},{...receipt(),status:next});
    assert.equal(out.status,'conflict',previous+' -> '+next); assert.ok(out.errors.includes('STATE_CONFLICT'));
  }
  for(const [previous,next] of [['pending','accepted'],['uncertain','rejected'],['accepted','processed'],['processed','processed'],['cancelled','cancelled'],['rejected','rejected']]) {
    const out=reconcile({key:' syn-send ',status:' '+previous+' ',providerId:' syn-provider '},
      {...receipt(),status:' '+next+' '});
    assert.equal(out.status,next); assert.equal(out.key,'syn-send'); assert.equal(out.providerId,'syn-provider');
    assert.equal(out.simulation,true); assert.deepEqual(out.errors,[]);
  }
});

test('CLI propagates quota channel and receipt errors without external execution',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-actions-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  const envelope={project:PROJECT,environment:'simulation',classification:'synthetic',schemaVersion:'2.0.0',runId:'syn-actions'};
  for(const [command,payload] of [
    ['arbitrate',{items:[item(),item()],history:[],policy:policy()}],
    ['channel',{channel:{...sms(),costCap:-1}}],
    ['reconcile',{previous:{key:'syn-send',status:'accepted',providerId:'syn-other'},receipt:receipt()}]
  ]) {
    const file=path.join(dir,command+'.json'); await writeFile(file,JSON.stringify({...envelope,...payload}));
    const out=spawnSync(process.execPath,[cli,command,file,'--now',now.toISOString()],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,1,out.stdout);
    const body=JSON.parse(out.stdout); assert.equal(body.status,'blocked');
    assert.equal(body.externalCalls,0); assert.equal(body.canExecute,false);
  }
});
