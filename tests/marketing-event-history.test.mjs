import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { foldEvents } from '../scripts/marketing/operations.mjs';
import { simulateJourney } from '../scripts/marketing/journeys.mjs';
import { parseStoreHours } from '../scripts/store-hours.mjs';

const now=new Date('2026-10-02T10:00:00Z');
const fixtures=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/scenarios.json',import.meta.url),'utf8'));
const journey=fixtures.find(f=>f.journey==='J04');
const hours=parseStoreHours(JSON.parse(await readFile(new URL('../data/store-hours.json',import.meta.url),'utf8')));
const ctx={now,hours,allowed:new Set(['https://auto-pieces-equipements.fr/'])};
const event=()=>({id:'syn-event',object:journey.object,kind:'reply',version:'v1',
  occurredAt:'2026-10-01T10:00:00Z',receivedAt:'2026-10-02T09:00:00Z'});

test('a padded object identity cannot hide a reply and allow J04 to propose another reminder',()=>{
  const events=[{...event(),object:' '+journey.object+' '}];
  assert.equal(foldEvents(events,journey.object,now).stop,true);
  assert.equal(foldEvents([event()],' '+journey.object+' ',now).stop,true);
  assert.equal(simulateJourney({...journey,events},ctx).decision,'stop');
});

test('canonical event keys expose contradictory duplicates without partial trusted events',()=>{
  const a=event(),b={...event(),id:' syn-event ',kind:'quote'};
  for(const events of [[a,b],[b,a]]) {
    const out=foldEvents(events,journey.object,now);
    assert.ok(out.errors.includes('EVENT_CONFLICT'));
    assert.deepEqual(out.events,[]); assert.equal(out.stop,null);
    assert.equal(simulateJourney({...journey,events},ctx).decision,'blocked');
  }
});

test('equivalent instants deduplicate deterministically with the earliest valid receipt',()=>{
  const a=event(),b={...event(),id:' syn-event ',kind:' reply ',version:' v1 ',
    occurredAt:'2026-10-01T12:00:00+02:00',receivedAt:'2026-10-02T08:00:00Z',note:'repeat receipt'};
  const forward=foldEvents([a,b],journey.object,now),reverse=foldEvents([b,a],journey.object,now);
  assert.deepEqual(forward.errors,[]); assert.equal(forward.events.length,1); assert.equal(forward.stop,true);
  assert.deepEqual(forward,reverse);
  assert.deepEqual(forward.events[0],{id:'syn-event',object:journey.object,kind:'reply',version:'v1',
    occurredAt:'2026-10-01T10:00:00.000Z',receivedAt:'2026-10-02T08:00:00.000Z'});
});

test('unknown event kinds and malformed versions cannot establish permission to continue',()=>{
  for(const altered of [{kind:'unexpected'},{kind:'accepted'},{version:1},{version:null},{version:''},
    {occurredAt:'2026-10-02T09:01:00Z'},{receivedAt:'2026-10-03T00:00:00Z'}]) {
    const events=[{...event(),...altered}];
    const out=foldEvents(events,journey.object,now);
    assert.ok(out.errors.includes('EVENT_TIME_OR_SCHEMA'));
    assert.equal(out.stop,null); assert.deepEqual(out.events,[]);
    assert.equal(simulateJourney({...journey,events},ctx).decision,'blocked');
  }
});

test('conflicting event versions or occurrence dates block every aggregate regardless of order',()=>{
  for(const altered of [{version:'v2'},{occurredAt:'2026-10-01T11:00:00Z'},{kind:'sale'}]) {
    const events=[event(),{...event(),...altered}];
    const forward=foldEvents(events,journey.object,now),reverse=foldEvents([...events].reverse(),journey.object,now);
    assert.deepEqual(forward,reverse); assert.deepEqual(forward.events,[]);
    assert.equal(forward.stop,null); assert.deepEqual(forward.errors,['EVENT_CONFLICT']);
  }
});

test('unusable event collections remain unknown rather than yielding a false stop flag or throwing',()=>{
  for(const events of [undefined,{},[null],Array(1),Array(1001).fill(event())]) {
    const out=foldEvents(events,journey.object,now);
    assert.ok(out.errors.length); assert.equal(out.stop,null); assert.deepEqual(out.events,[]);
  }
  const out=foldEvents([event()],journey.object,new Date(NaN));
  assert.ok(out.errors.length); assert.equal(out.stop,null);
});

test('valid events use occurrence then receipt order and preserve the object boundary',()=>{
  const events=[{...event(),id:'syn-a',kind:'quote'},{...event(),id:'syn-z',receivedAt:'2026-10-02T08:00:00Z'}];
  const out=foldEvents(events,journey.object,now);
  assert.deepEqual(out.events.map(e=>e.id),['syn-z','syn-a']);
  assert.equal(out.stop,true);
  for(const kind of ['reply','refused','sale','closed','opt-out','withdrawn','collected','cancelled'])
    assert.equal(foldEvents([{...event(),kind}],journey.object,now).stop,true);
  assert.equal(foldEvents([{...event(),object:'syn-other'}],journey.object,now).stop,false);
  assert.equal(foldEvents([],journey.object,now).stop,false);
  const withoutVersion=event(); delete withoutVersion.version;
  assert.deepEqual(foldEvents([withoutVersion],journey.object,now).errors,[]);
});

test('journey CLI stops on canonical replies and blocks unknown or contradictory events',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-event-history-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  for(const [events,exit,decision] of [
    [[{...event(),object:' '+journey.object+' '}],0,'stop'],
    [[event(),{...event(),id:' syn-event ',kind:'quote'}],1,'blocked'],
    [[{...event(),kind:'unexpected'}],1,'blocked'],
    [[event(),{...event(),occurredAt:'2026-10-01T12:00:00+02:00'}],0,'stop'],
    [[],0,'propose-reminder']
  ]) {
    const file=path.join(dir,'journey.json'); await writeFile(file,JSON.stringify({...journey,events}));
    const out=spawnSync(process.execPath,[cli,'journey',file,'--now',now.toISOString()],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,exit,out.stdout);
    const body=JSON.parse(out.stdout); assert.equal(body.result.decision,decision);
    assert.equal(body.canExecute,false); assert.equal(body.externalCalls,0);
  }
});
