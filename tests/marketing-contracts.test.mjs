import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as ops from '../scripts/marketing/operations.mjs';
import * as studio from '../scripts/marketing/studio.mjs';
import * as data from '../scripts/marketing/data.mjs';
import {instant} from '../scripts/marketing/common.mjs';
const P='ak125/auto-pieces-equipements-site',now=new Date('2026-10-02T10:00:00Z');
test('C17 positive delivery audit requires observed alignment and complaints stop sending',()=>{
  assert.equal(typeof ops.auditDelivery,'function','Delivery audit missing');
  const result=ops.auditDelivery({spf:'pass',dkim:'pass',dmarc:'pass',alignment:true,senderVerified:true,
    unsubscribeVerified:true,hardBounces:0,complaints:0,observedAt:'2026-10-02T09:00:00Z'},now);
  assert.equal(result.preconditionsMet,true);assert.equal(result.inboxGuaranteed,false);
  assert.equal(ops.auditDelivery({spf:'pass',hardBounces:1},now).stop,true);
});
test('T02 skill index catches homonym, missing context, old version and broken reference',()=>{
  assert.equal(typeof ops.inspectSkillIndex,'function','Skill index checks missing');
  const skill={name:'ape-campagnes-locales',version:'2.0.0',path:'/ape/.agents/skills/ape-campagnes-locales/SKILL.md',referencesValid:true};
  const context={project:P,root:'/ape'};
  assert.equal(ops.inspectSkillIndex([skill],context).valid,true);
  assert.equal(ops.inspectSkillIndex([skill,skill],context).valid,false);
  assert.equal(ops.inspectSkillIndex([skill],{}).valid,false);
  assert.equal(ops.inspectSkillIndex([{...skill,version:'1.0.0'}],context).valid,false);
  assert.equal(ops.inspectSkillIndex([{...skill,referencesValid:false}],context).valid,false);
});
test('P01/P14 official fact snapshot distinguishes contradiction from unknown, no public edit',()=>{
  assert.equal(typeof studio.compareBusinessFacts,'function');
  const result=studio.compareBusinessFacts({name:'Auto Pièces Équipements',phone:'official'},
    [{source:'fixture-gbp',facts:{name:'AutoMecanik',phone:'official'}}]);
  assert.equal(result.contradictions.length,1);assert.equal(result.changedPublic,false);
});
test('C05/C17 denial, pause, bounce, complaint and stale evidence block marketing',()=>{
  for(const state of ['denied','paused','hard-bounce','complaint','unknown']) {
    const person={project:P,id:'syn-person',preferences:[{channel:'email',purpose:'marketing',brand:'APE',
      state,at:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',country:'FR',evidence:'fixture'}]};
    assert.equal(data.eligibility(person,'email','marketing',now).eligible,false);
  }
});
test('T04 unknown cannot be inverted, excessive nesting rejected and impossible date invalid',()=>{
  const p={project:P,id:'syn-p',historyFrom:null};
  assert.equal(data.evaluateSegment(p,{not:{event:'sale',since:'2026-09-01T00:00:00Z',min:1}},now).match,null);
  let rule={field:'kind',equals:'pro'};for(let n=0;n<14;n++)rule={not:rule};
  assert.equal(data.evaluateSegment(p,rule,now).match,null);
  assert.ok(Number.isNaN(instant('2026-02-30T00:00:00Z')));
});
test('T07 malformed historical quota data must not turn into available quota',()=>{
  const person={id:'syn-p',project:P,preferences:[{brand:'APE',country:'FR',channel:'email',purpose:'marketing',
    state:'allowed',at:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',evidence:'fixture'}]};
  const out=ops.arbitrate([{id:'syn-a',person,account:'syn-account',channel:'email',cost:1,priority:1}],
    [{subject:'syn-p',account:'syn-account',channel:'email',cost:0,status:'accepted',at:'bad-date'}],
    {contactCap:1,accountCap:10,channelCap:10,costCap:4,window:'calendar-day',hours:[9,18]},now);
  assert.ok(out.errors.includes('HISTORY_UNKNOWN'));
});
test('T15 conflicting or excessive refund per order makes economic report unknown',async()=>{
  const {commercialReport}=await import('../scripts/marketing/insights.mjs');
  const out=commercialReport({salesCoverage:true,events:[
    {kind:'sale',object:'syn-a',amount:5,currency:'EUR'},
    {kind:'sale',object:'syn-b',amount:100,currency:'EUR'},
    {kind:'refund',object:'syn-r',order:'syn-a',amount:10,currency:'EUR'}]});
  assert.equal(out.netRevenue,null);
});
test('C22/C23 no conversion rate without comparable source period and cohort',async()=>{
  const {commercialReport}=await import('../scripts/marketing/insights.mjs');
  const events=[{kind:'quote',object:'syn-q'},{kind:'sale',object:'syn-o',quote:'syn-q',amount:42,currency:'EUR'}];
  assert.equal(commercialReport({events,salesCoverage:true,quoteCoverage:true}).quoteToSale,null);
});
