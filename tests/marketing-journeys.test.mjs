import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseStoreHours} from '../scripts/store-hours.mjs';
const m=await import('../scripts/marketing/journeys.mjs').catch(()=>({}));
const fixtures=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/scenarios.json',import.meta.url),'utf8'));
const hours=parseStoreHours(JSON.parse(await readFile(new URL('../data/store-hours.json',import.meta.url),'utf8')));
const now=new Date('2026-10-02T10:00:00Z');
const ctx={now,hours,allowed:new Set(['https://auto-pieces-equipements.fr/'])};
for(const f of fixtures) test(f.journey+' useful positive scenario: '+f.name,()=>{
  assert.equal(typeof m.simulateJourney,'function','V2 journey decisions missing');
  const out=m.simulateJourney(f,ctx);
  assert.equal(out.decision,f.expected,JSON.stringify(out));
  assert.ok(out.output);assert.equal(out.externalCalls,0);assert.equal(out.metric,f.metric);
  assert.equal(out.activated,false);
});
test('J04 stops for late reply, version change, stale quote and max attempts',()=>{
  const f=structuredClone(fixtures.find(f=>f.journey==='J04'));
  f.events=[{id:'syn-reply',object:f.object,kind:'reply',occurredAt:'2026-10-01T10:00:00Z',receivedAt:'2026-10-02T09:00:00Z'}];
  assert.equal(m.simulateJourney(f,ctx).decision,'stop');
  f.events=[];f.currentVersion='v2';assert.equal(m.simulateJourney(f,ctx).decision,'recheck');
  f.currentVersion='v1';f.quote.expiresAt='2026-10-01T09:00:00Z';assert.equal(m.simulateJourney(f,ctx).decision,'blocked');
  f.quote.expiresAt='2026-10-03T09:00:00Z';f.policy.attempts=1;assert.equal(m.simulateJourney(f,ctx).decision,'human');
});
test('J06/J09/P24 closing override and Tunis operator cannot create an opening',()=>{
  const closed={...hours,exceptions:{...hours.exceptions,'2026-10-02':[]}};
  assert.equal(m.simulateJourney(fixtures.find(f=>f.journey==='J06'),{...ctx,hours:closed}).decision,'defer');
  const future=m.simulateJourney(fixtures.find(f=>f.journey==='J15'),{...ctx,hours:closed});
  assert.equal(future.output.openNow,false);
});
test('J07 visible-only registration is blocked; J10 unknown purchase history is not inactivity',()=>{
  const sub=structuredClone(fixtures.find(f=>f.journey==='J07'));sub.subscription.confirmed=false;
  assert.equal(m.simulateJourney(sub,ctx).decision,'blocked');
  const react=structuredClone(fixtures.find(f=>f.journey==='J10'));react.person.historyFrom=null;
  assert.equal(m.simulateJourney(react,ctx).decision,'blocked');
});
test('J11/J13 no cross-channel opt-out bypass or satisfaction filtering',()=>{
  const pro=structuredClone(fixtures.find(f=>f.journey==='J11'));pro.person.preferences[0].state='denied';
  assert.equal(m.simulateJourney(pro,ctx).decision,'stop');
  const invite=structuredClone(fixtures.find(f=>f.journey==='J13'));
  const a=m.simulateJourney(invite,ctx);invite.experience.satisfaction=5;
  assert.equal(m.simulateJourney(invite,ctx).output,a.output);
});
