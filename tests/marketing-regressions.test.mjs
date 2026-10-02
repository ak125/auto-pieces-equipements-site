import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { PROJECT, instant, noPrivateText } from '../scripts/marketing/common.mjs';
import { eligibility, evaluateSegment, scoreProfile } from '../scripts/marketing/data.mjs';
import { arbitrate, foldEvents } from '../scripts/marketing/operations.mjs';
import { compareSources } from '../scripts/marketing/insights.mjs';

const now=new Date('2026-10-02T10:00:00Z');
const person=()=>({project:PROJECT,id:'syn-person',historyFrom:'2026-09-01T00:00:00Z',events:[],relations:[],
  preferences:[{channel:'email',purpose:'marketing',brand:'APE',country:'FR',state:'allowed',
    at:'2026-10-01T10:00:00Z',expiresAt:'2026-11-01T00:00:00Z',evidence:'fixture'}]});
const sale=()=>({id:'syn-sale',kind:'sale',at:'2026-09-20T10:00:00Z',amount:40,currency:'EUR'});
const absence={event:'sale',since:'2026-09-10T00:00:00Z',min:0,max:0};

test('inactivity remains unknown when events are absent, malformed or conflicting',()=>{
  for(const events of [undefined,{},[{}],[{...sale(),at:'unknown'}],[sale(),{...sale(),kind:'quote'}]]){
    const p={...person(),events};
    assert.equal(evaluateSegment(p,absence,now).match,null,JSON.stringify(events));
    assert.equal(evaluateSegment(p,{not:{...absence,min:1,max:2}},now).match,null);
  }
});

test('explicit empty history and exact duplicate events keep valid segment results',()=>{
  assert.equal(evaluateSegment(person(),absence,now).match,true);
  const p={...person(),events:[sale(),sale()]};
  assert.equal(evaluateSegment(p,{...absence,min:1,max:1},now).match,true);
  assert.equal(evaluateSegment(p,{sequence:['sale','sale'],since:absence.since},now).match,false);
});

test('missing relations cannot become a positive exclusion segment',()=>{
  const rule={not:{relation:{id:'syn-car',type:'vehicle'}}};
  assert.equal(evaluateSegment({...person(),relations:undefined},rule,now).match,null);
  assert.equal(evaluateSegment({...person(),relations:[{}]},rule,now).match,null);
  assert.equal(evaluateSegment(person(),rule,now).match,true);
});

test('RFM does not turn invalid or contradictory sales into a zero or partial total',()=>{
  for(const events of [undefined,[{...sale(),amount:'40'}],[sale(),{...sale(),amount:80}],[{...sale(),currency:'USD'}]]){
    const result=scoreProfile({...person(),events},now,{});
    assert.equal(result.frequency,null,JSON.stringify(events));
    assert.equal(result.amount,null);
    assert.equal(result.recencyDays,null);
  }
  assert.equal(scoreProfile({...person(),events:[sale(),sale()]},now,{}).amount,40);
  assert.equal(scoreProfile(person(),now,{}).frequency,0);
});

test('malformed preference cannot silently reveal an older permission',()=>{
  const p=person();
  p.preferences.push({...p.preferences[0],state:'denied',at:'unknown'});
  assert.equal(eligibility(p,'email','marketing',now).eligible,false);
  assert.equal(eligibility({...p,preferences:[...p.preferences,{}]},'email','marketing',now).eligible,false);
});

test('quota history requires an explicit complete array and counts pending reservations',()=>{
  const items=[{id:'syn-candidate',person:person(),account:'syn-account',channel:'email',cost:1}];
  const policy={contactCap:1,accountCap:10,channelCap:10,costCap:4,window:'calendar-day',hours:[9,18]};
  for(const history of [undefined,{},[{subject:'syn-person',account:'syn-account',channel:'email',
    cost:1,at:'2026-10-01T09:00:00Z',status:'unknown'}]]){
    assert.ok(arbitrate(items,history,policy,now).errors.includes('HISTORY_UNKNOWN'));
  }
  const history=[{subject:'syn-person',account:'syn-account',channel:'email',cost:1,
    at:'2026-10-02T09:00:00Z',status:'pending'}];
  assert.equal(arbitrate(items,history,policy,now).decisions[0].decision,'defer');
  assert.equal(arbitrate(items,[],policy,now).decisions[0].decision,'propose');
});

test('journey event fold refuses unknown collections or unidentifiable events',()=>{
  for(const events of [undefined,{},[{}]]){
    assert.ok(foldEvents(events,'syn-object',now).errors.length>0);
  }
  assert.deepEqual(foldEvents([],'syn-object',now).errors,[]);
});

test('structured credential fields are blocked without treating ordinary token counts as secrets',()=>{
  for(const key of ['apiKey','api_key','access_token','refreshToken','password','secret','authorization']){
    assert.equal(noPrivateText({nested:[{[key]:'FAKE_VALUE'}]}),false,key);
  }
  assert.equal(noPrivateText({tokenCount:12,source:'fixture',description:'secretariat du magasin'}),true);
});

test('timestamps reject normalized 24h while preserving valid offset instants',()=>{
  assert.equal(Number.isNaN(instant('2026-10-02T24:00:00Z')),true);
  assert.equal(instant('2026-10-25T02:30:00+02:00'),Date.parse('2026-10-25T00:30:00Z'));
  assert.equal(instant('2026-10-25T02:30:00+01:00'),Date.parse('2026-10-25T01:30:00Z'));
});

test('source comparison is independent of export order',()=>{
  const a={ref:'fixture-a',subject:'battery',value:40,checkedAt:'2026-09-29T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z'};
  const b={...a,ref:'fixture-b',value:42,checkedAt:'2026-09-30T00:00:00Z'};
  assert.deepEqual(compareSources([b,a],now),compareSources([a,b],now));
  assert.equal(compareSources([b,a],now).changes[0].difference,2);
});

test('CLI reports failed checks with exit 1 and explicit blocked status',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-marketing-regression-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  const envelope={project:PROJECT,environment:'simulation',classification:'synthetic',schemaVersion:'2.0.0',runId:'syn-test'};
  const cases=[
    ['channel',{channel:{channel:'email',account:'syn-wrong',expectedAccount:'syn-right'}}],
    ['privacy',{person:person(),operation:'unknown',retentionDays:30}],
    ['suspend',{items:[],action:{},grant:{}}],
    ['qualify',{request:{project:PROJECT,received:false}}],
    ['delivery-audit',{observations:{}}],
    ['preflight',{dossier:{}}]
  ];
  for(const [command,payload] of cases){
    const file=path.join(dir,command+'.json');await writeFile(file,JSON.stringify({...envelope,...payload}));
    const out=spawnSync(process.execPath,[cli,command,file,'--now',now.toISOString()],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,1,command+': '+out.stdout);
    const result=JSON.parse(out.stdout);assert.equal(result.status,'blocked',command);
    assert.equal(result.externalCalls,0);assert.equal(result.canExecute,false);
  }
});
