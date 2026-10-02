import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {auditDelivery} from '../scripts/marketing/operations.mjs';
import {PROJECT} from '../scripts/marketing/common.mjs';

const now=new Date('2026-10-02T10:00:00Z');
const observation={spf:'pass',dkim:'pass',dmarc:'pass',alignment:true,senderVerified:true,
  unsubscribeVerified:true,hardBounces:0,complaints:0,observedAt:'2026-10-02T09:00:00Z'};

test('delivery audit keeps missing or invalid incident counts unknown instead of reporting no stop',()=>{
  for(const field of ['hardBounces','complaints']) {
    for(const value of [undefined,null,-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,'0',false,{}]) {
      const out=auditDelivery({...observation,[field]:value},now);
      assert.equal(out.preconditionsMet,false);assert.equal(out.stop,null);
      assert.ok(out.errors.includes('INCIDENT_COUNTS'));
    }
  }
  assert.equal(auditDelivery(undefined,now).stop,null);
});

test('delivery audit requires numeric integer incidents and preserves a known stop despite other missing evidence',()=>{
  for(const value of ['1',true,0.5,[1]]) assert.equal(auditDelivery({...observation,complaints:value},now).stop,null);
  for(const field of ['hardBounces','complaints']) {
    const other=field==='hardBounces'?'complaints':'hardBounces';
    for(const count of [1,Number.MAX_SAFE_INTEGER]) {
      const out=auditDelivery({...observation,[field]:count,[other]:undefined,observedAt:undefined},now);
      assert.equal(out.stop,true);assert.equal(out.preconditionsMet,false);
      assert.ok(out.errors.includes('INCIDENT_COUNTS'));assert.ok(out.errors.includes('OBSERVATION_TIME'));
    }
  }
});

test('delivery audit never clears an incident from stale zero counters and keeps the inclusive fixture horizon',()=>{
  const expired={...observation,observedAt:'2026-10-01T09:59:59.999Z'};
  const out=auditDelivery(expired,now);
  assert.equal(out.stop,null);assert.equal(out.observationFresh,false);assert.ok(out.errors.includes('OBSERVATION_STALE'));
  assert.equal(auditDelivery({...expired,hardBounces:1},now).stop,true);
  for(const observedAt of ['2026-10-01T10:00:00Z','2026-10-01T12:00:00+02:00',now.toISOString()]) {
    const fresh=auditDelivery({...observation,observedAt},now);
    assert.equal(fresh.preconditionsMet,true);assert.equal(fresh.stop,false);assert.deepEqual(fresh.errors,[]);
  }
});

test('delivery audit invalid clocks and future or malformed observation times cannot clear a stop',()=>{
  for(const observedAt of [undefined,'bad-date','2026-10-02T10:00:00.001Z','2026-02-30T00:00:00Z']) {
    const out=auditDelivery({...observation,observedAt},now);
    assert.equal(out.stop,null);assert.equal(out.preconditionsMet,false);assert.ok(out.errors.includes('OBSERVATION_TIME'));
  }
  const out=auditDelivery(observation,new Date(NaN));
  assert.equal(out.stop,null);assert.equal(out.observationFresh,false);assert.ok(out.errors.includes('CLOCK'));
  assert.equal(auditDelivery({...observation,complaints:1},new Date(NaN)).stop,true);
});

test('delivery audit explains declared authentication and sender failures without pretending to verify them',()=>{
  for(const field of ['spf','dkim','dmarc','alignment','senderVerified','unsubscribeVerified']) {
    const out=auditDelivery({...observation,[field]:undefined},now);
    assert.equal(out.preconditionsMet,false);assert.equal(out.stop,false);
    assert.ok(out.errors.includes(['spf','dkim','dmarc','alignment'].includes(field)?'AUTHENTICATION':'SENDER_READINESS'));
  }
  const out=auditDelivery(Object.freeze({...observation}),now);
  assert.equal(out.preconditionsMet,true);assert.deepEqual(out.errors,[]);
  assert.equal(out.observationVerified,false);assert.equal(out.queriedDns,false);assert.equal(out.inboxGuaranteed,false);
});

test('delivery audit CLI blocks unknown and observed incidents and preserves the valid synthetic case',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-delivery-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  for(const [observations,exit,stop] of [[{},1,null],[{...observation,hardBounces:'1'},1,null],
    [{...observation,complaints:1},1,true],[observation,0,false]]) {
    const file=path.join(dir,'input.json');
    await writeFile(file,JSON.stringify({project:PROJECT,environment:'simulation',classification:'synthetic',schemaVersion:'2.0.0',runId:'syn-delivery',observations}));
    const out=spawnSync(process.execPath,[cli,'delivery-audit',file,'--now',now.toISOString()],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,exit,out.stdout);const body=JSON.parse(out.stdout);
    assert.equal(body.result.stop,stop);assert.equal(body.result.observationVerified,false);
    assert.equal(body.status,exit?'blocked':'completed-simulation');assert.equal(body.canExecute,false);assert.equal(body.externalCalls,0);
  }
});
