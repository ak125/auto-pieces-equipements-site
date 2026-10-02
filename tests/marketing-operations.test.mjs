import test from 'node:test';
import assert from 'node:assert/strict';
const m=await import('../scripts/marketing/operations.mjs').catch(()=>({}));
const P='ak125/auto-pieces-equipements-site',now=new Date('2026-10-02T10:00:00Z');
const action=()=>({project:P,environment:'simulation',account:'syn-account',operation:'send',family:'newsletter',
  template:'v2',revision:'r1',audienceRule:'declared-battery-v1',contacts:2,cost:1,currency:'EUR',
  channel:'email',frequency:1,exclusions:['suppressed'],actor:'syn-operator'});
const grant=()=>({...action(),id:'syn-grant',issuer:'fixture-authority',approver:'syn-owner',revoked:false,
  operations:['send','suspend'],families:['newsletter'],templates:['v2'],revisions:['r1'],
  maxContacts:10,maxCost:5,maxFrequency:1,timeZone:'Europe/Paris',startsAt:'2026-10-01T00:00:00Z',
  expiresAt:'2026-10-10T00:00:00Z',stopConditions:['complaint','budget'],validity:'fixture-only'});
test('T10 mandate contract recognizes bounded fixture but never authenticates JSON as permission',()=>{
  assert.equal(typeof m.checkMandate,'function','V2 mandate checker missing');
  assert.equal(m.checkMandate(action(),grant(),now).scopeMatches,true);
  assert.equal(m.checkMandate(action(),grant(),now).permissionVerified,false);
  for(const altered of [{...grant(),expiresAt:'2026-10-01T00:00:00Z'},{...grant(),revoked:true},{approved:true},
    {...grant(),account:'syn-other'}]) assert.equal(m.checkMandate(action(),altered,now).scopeMatches,false);
  assert.equal(m.checkMandate({...action(),contacts:11},grant(),now).scopeMatches,false);
  assert.equal(m.checkMandate({...action(),exclusions:[]},grant(),now).scopeMatches,false);
  assert.equal(m.checkMandate({...action(),contacts:1,exclusions:['suppressed','new-optout']},grant(),now).scopeMatches,true);
});
test('T07 common arbitration sees concurrent campaigns and calendar vs rolling windows',()=>{
  const p={id:'syn-p',project:P,preferences:[{brand:'APE',country:'FR',channel:'email',purpose:'marketing',
    state:'allowed',at:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',evidence:'fixture'}]};
  const items=[{id:'syn-a',person:p,account:'syn-account',channel:'email',cost:1,priority:2},
    {id:'syn-b',person:p,account:'syn-account',channel:'email',cost:1,priority:1}];
  const policy={contactCap:1,accountCap:10,channelCap:10,costCap:4,window:'calendar-day',hours:[9,18]};
  const result=m.arbitrate(items,[],policy,now);
  assert.equal(result.decisions[0].decision,'propose'); assert.equal(result.decisions[1].decision,'defer');
  const history=[{subject:'syn-p',account:'syn-account',channel:'email',cost:1,at:'2026-10-01T20:00:00Z',status:'accepted'}];
  assert.equal(m.arbitrate(items,history,policy,now).decisions[0].decision,'propose');
  assert.equal(m.arbitrate(items,history,{...policy,window:'rolling',hoursBack:24},now).decisions[0].decision,'defer');
});
test('T08 chronological event fold dedupes, flags conflicts, late reply and incomplete receipt',()=>{
  const events=[{id:'syn-2',object:'syn-q',kind:'reply',occurredAt:'2026-10-01T12:00:00Z',receivedAt:'2026-10-02T09:00:00Z'},
    {id:'syn-1',object:'syn-q',kind:'quote',occurredAt:'2026-10-01T10:00:00Z',receivedAt:'2026-10-01T10:01:00Z'}];
  const out=m.foldEvents([...events,events[0]],'syn-q',now);
  assert.equal(out.events.length,2); assert.equal(out.events[1].kind,'reply'); assert.equal(out.stop,true);
  assert.ok(m.foldEvents([...events,{...events[0],kind:'sale'}],'syn-q',now).errors.includes('EVENT_CONFLICT'));
});
test('T09/T12 real unavailable, simulated uncertain needs reconciliation, no failover or duplicate retry',()=>{
  const previous=globalThis.fetch; let calls=0;globalThis.fetch=async()=>{calls++;throw Error('NETWORK');};
  const oldKey=process.env.MARKETING_SEND_KEY;process.env.MARKETING_SEND_KEY='fixture-present';
  try{
    assert.equal(m.realAction(action()).status,'unavailable');
    const first=m.simulateProvider({key:'syn-send',outcome:'uncertain'},[]);
    assert.equal(first.status,'uncertain');
    const retry=m.simulateProvider({key:'syn-send',outcome:'accepted'},[first]);
    assert.equal(retry.status,'reconcile-required');
    assert.equal(m.reconcile(first,{key:'syn-send',status:'accepted',providerId:'syn-provider',proof:'fixture-receipt'}).status,'accepted');
    assert.equal(m.simulateProvider({key:'syn-send',outcome:'accepted'},[{...first,status:'accepted'}]).status,'duplicate');
    assert.equal(calls,0);
  } finally {globalThis.fetch=previous;if(oldKey===undefined)delete process.env.MARKETING_SEND_KEY;else process.env.MARKETING_SEND_KEY=oldKey;}
});
test('T17 suspension stops pending items, accepted ones require provider check',()=>{
  const out=m.suspendSimulation([{key:'syn-a',status:'pending'},{key:'syn-b',status:'accepted'}],{...action(),operation:'suspend'},grant(),now);
  assert.equal(out.items[0].status,'cancelled'); assert.equal(out.items[1].status,'accepted');
  assert.equal(out.recallGuaranteed,false); assert.equal(out.realEffects,0);
});
test('T19/T20 schedule contract rejects wrong workdir trust account and caps; no LLM needed',()=>{
  const context={project:P,workdir:'/approved/ape',account:'syn-account',trusted:true};
  const job={...context,timeZone:'Europe/Paris',maxItems:100,timeoutMs:5000,costCap:0,command:'report',llm:false};
  assert.equal(m.validateJob(job,context).valid,true);
  assert.equal(m.validateJob({...job,workdir:'/other'},context).valid,false);
  assert.equal(m.validateJob({...job,trusted:false},context).valid,false);
  assert.equal(m.validateJob({...job,account:'syn-other'},context).valid,false);
  assert.equal(m.validateJob({...job,maxItems:100000},context).valid,false);
});
test('C15/T13 channel contracts distinguish account, email readiness, WhatsApp window, SMS segments',()=>{
  assert.equal(m.channelCheck({channel:'whatsapp',account:'syn-wa',expectedAccount:'syn-wa',optIn:true,
    lastInboundAt:'2026-09-01T00:00:00Z',templateApproved:false},now).ready,false);
  assert.equal(m.channelCheck({channel:'whatsapp',account:'syn-wa',expectedAccount:'syn-wa',optIn:true,
    lastInboundAt:'2026-10-02T09:00:00Z'},now).ready,true);
  assert.equal(m.channelCheck({channel:'email',account:'syn-x',expectedAccount:'syn-y'},now).ready,false);
  assert.equal(m.smsUnits('a'.repeat(161)).segments,2); assert.equal(m.smsUnits('é').encoding,'GSM-7');
  assert.equal(m.smsUnits('🙂'.repeat(36)).segments,2);
});
