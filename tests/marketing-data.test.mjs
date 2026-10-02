import test from 'node:test';
import assert from 'node:assert/strict';
const m = await import('../scripts/marketing/data.mjs').catch(() => ({}));
const P = 'ak125/auto-pieces-equipements-site';
const now = new Date('2026-10-02T10:00:00Z');
const permission = (state='allowed', at='2026-10-01T10:00:00Z', channel='email', purpose='marketing') =>
  ({state, at, channel, purpose, evidence:'fixture-permission', expiresAt:'2026-11-01T00:00:00Z', brand:'APE', country:'FR'});
const person = (id='syn-a') => ({id, project:P, email:id+'@example.invalid', kind:'professional',
  historyFrom:'2026-09-01T00:00:00Z', preferences:[permission()], relations:[], events:[]});
const envelope = records => ({project:P, environment:'simulation', classification:'synthetic', records});
test('T01/T03 import: same identity replayed, foreign project and ambiguous address are not merged', () => {
  assert.equal(typeof m.importSimulation,'function','V2 import simulator missing');
  const a=person(); const first=m.importSimulation(envelope([a]));
  assert.equal(first.records.length,1);
  const replay=m.importSimulation(envelope([a]),first.records);
  assert.equal(replay.records.length,1); assert.equal(replay.created,0);
  assert.equal(m.importSimulation(envelope([{...a,project:'AutoMecanik'}])).errors[0].code,'PROJECT');
  const ambiguity=m.importSimulation(envelope([{...a,id:'syn-b'}]),[a]);
  assert.equal(ambiguity.errors[0].code,'AMBIGUOUS'); assert.equal(ambiguity.records.length,1);
});
test('T03/T05/T18 opposition survives stale import; service purpose remains separate',()=>{
  const a=person(); a.preferences.push(permission('denied'));
  const result=m.importSimulation(envelope([person()]),[a]);
  assert.equal(m.eligibility(result.records[0],'email','marketing',now).eligible,false);
  a.preferences.push(permission('allowed','2026-10-01T10:00:00Z','email','service'));
  assert.equal(m.eligibility(a,'email','service',now).eligible,true);
  const plan=m.privacyPlan(a,'erase',now,30);
  assert.equal(plan.deleteProfile,true); assert.equal(plan.suppressionRequired,true);
  assert.equal('email' in plan,false); assert.equal(plan.executed,false);
});
test('T03 import normalization preserves local-part dots and tags, only domain folded; invalid rows bounded',()=>{
  const a=person(); a.email=' A.B+tag@EXAMPLE.INVALID ';
  const result=m.importSimulation(envelope([a]));
  assert.equal(result.records[0].email,'A.B+tag@example.invalid');
  assert.equal(m.importSimulation(envelope([{...a,email:'real@example.com'}])).errors[0].code,'SYNTHETIC_ONLY');
  assert.equal(m.importSimulation(envelope(Array(1001).fill(a))).errors[0].code,'LIMIT');
});
test('T04 nested segment, sequence, absence and object relation have reproducible explanations',()=>{
  const a=person(); a.relations=[{id:'syn-car1',type:'vehicle',category:'battery'}];
  a.events=[{id:'syn-e1',kind:'request',at:'2026-09-20T10:00:00Z'},
    {id:'syn-e2',kind:'quote',at:'2026-09-21T10:00:00Z'}];
  const rule={all:[{field:'kind',equals:'professional'},{not:{field:'kind',equals:'individual'}},
    {sequence:['request','quote'],since:'2026-09-10T00:00:00Z'},
    {event:'sale',since:'2026-09-10T00:00:00Z',min:0,max:0},
    {relation:{id:'syn-car1',type:'vehicle',category:'battery'}}]};
  assert.equal(m.evaluateSegment(a,rule,now).match,true);
  assert.deepEqual(m.evaluateSegment(a,rule,now),m.evaluateSegment(a,rule,now));
  assert.equal(m.evaluateSegment(a,{relation:{id:'syn-car2',type:'vehicle'}},now).match,false);
  a.historyFrom=null;
  assert.equal(m.evaluateSegment(a,{not:{event:'sale',since:'2026-09-10T00:00:00Z',min:1}},now).match,null);
  assert.equal(m.evaluateSegment(a,{all:[]},now).match,null);
});
test('C08 score contributions and RFM are observed, never predictions on missing history',()=>{
  const a=person(); a.events=[{id:'syn-s1',kind:'sale',at:'2026-09-30T10:00:00Z',amount:40,currency:'EUR'}];
  const score=m.scoreProfile(a,now,{professional:10,engagement:5,halfLifeDays:30});
  assert.equal(score.frequency,1); assert.equal(score.amount,40); assert.equal(score.recencyDays,2);
  assert.equal(score.predictedLtv,null); assert.ok(score.contributions.length);
  assert.equal(m.scoreProfile({...a,historyFrom:null},now,{}).frequency,null);
});
