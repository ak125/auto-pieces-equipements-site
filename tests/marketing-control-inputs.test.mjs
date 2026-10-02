import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { suspendSimulation, validateJob } from '../scripts/marketing/operations.mjs';

const fixture=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/suspend.json',import.meta.url),'utf8'));
const now=new Date('2026-10-02T10:00:00Z');
const suspend=items=>suspendSimulation(items,fixture.action,fixture.grant,now);
const context={project:fixture.project,workdir:'/approved/ape',account:'syn-account',trusted:true};
const job={...context,timeZone:'Europe/Paris',maxItems:100,timeoutMs:5000,costCap:0,command:'report',llm:false};

test('suspension refuses absent malformed and oversized item collections without partial cancellation',()=>{
  for(const items of [undefined,null,{},[null],Array(1),[{key:'syn-a'}],
    [{key:'invalid',status:'pending'}],[{key:'syn-a',status:'unknown'}],Array(1001).fill({key:'syn-a',status:'pending'})]) {
    const out=suspend(items);
    assert.equal(out.status,'blocked'); assert.ok(out.errors.includes('SUSPENSION_INPUT'));
    assert.deepEqual(out.items,[]); assert.equal(out.realEffects,0); assert.equal(out.recallGuaranteed,false);
  }
});

test('suspension blocks contradictory canonical keys independently of input order',()=>{
  const items=[{key:'syn-a',status:'pending'},{key:' syn-a ',status:'accepted'}];
  const forward=suspend(items),reverse=suspend([...items].reverse());
  assert.equal(forward.status,'blocked'); assert.deepEqual(forward.items,[]);
  assert.ok(forward.errors.includes('SUSPENSION_CONFLICT')); assert.deepEqual(forward,reverse);
});

test('suspension deduplicates known states and never recalls accepted or uncertain items',()=>{
  const items=Object.freeze([
    Object.freeze({key:' syn-b ',status:' pending '}), Object.freeze({key:'syn-b',status:'pending'}),
    Object.freeze({key:'syn-a',status:'accepted'})
  ]);
  const out=suspend(items);
  assert.deepEqual(out.items,[{key:'syn-a',status:'accepted'},{key:'syn-b',status:'cancelled'}]);
  assert.deepEqual(out,suspend([...items].reverse()));
  for(const status of ['pending','proposed','scheduled','accepted','processed','uncertain','rejected','cancelled','quota']) {
    const expected=['pending','proposed','scheduled'].includes(status)?'cancelled':status;
    assert.equal(suspend([{key:'syn-a',status}]).items[0].status,expected);
  }
  assert.deepEqual(suspend([]).items,[]); assert.equal(suspend([]).status,'simulated');
  assert.equal(out.permissionVerified,false);
  assert.equal(suspend(Array.from({length:1000},(_,i)=>({key:'syn-'+i,status:'pending'}))).items.length,1000);
});

test('suspension rejects item scope that contradicts the supplied mandate',()=>{
  for(const [field,value] of [['account','syn-other'],['channel','sms'],['project','other-project'],
    ['family','other'],['template','other'],['revision','other'],['audienceRule','other']]) {
    const out=suspend([{key:'syn-a',status:'pending',[field]:value}]);
    assert.equal(out.status,'blocked',field); assert.ok(out.errors.includes('SUSPENSION_SCOPE'));
    assert.deepEqual(out.items,[]);
  }
  assert.equal(suspend([{key:'syn-a',status:'pending',account:' syn-account ',channel:'email'}]).status,'simulated');
  const out=suspendSimulation([],fixture.action,{...fixture.grant,revoked:true},now);
  assert.equal(out.error,'MANDATE'); assert.deepEqual(out.items,[]);
});

test('job item and duration limits require bounded integers',()=>{
  for(const [field,values] of [['maxItems',[0,1.5,1001,Number.MAX_SAFE_INTEGER+1]],['timeoutMs',[0,1.5,30001]]]) {
    for(const value of values) {
      const out=validateJob({...job,[field]:value},context);
      assert.equal(out.valid,false); assert.ok(out.errors.includes('BUDGET'));
    }
  }
  for(const limits of [{maxItems:1,timeoutMs:1},{maxItems:1000,timeoutMs:30000}])
    assert.equal(validateJob({...job,...limits},context).valid,true);
});

test('job workdir must be explicit and absolute in addition to matching context',()=>{
  for(const workdir of ['ape','../ape','.','C:ape','\\ape',' /approved/ape','/approved/ape\0']) {
    const out=validateJob({...job,workdir},{...context,workdir});
    assert.equal(out.valid,false,workdir); assert.ok(out.errors.includes('WORKDIR'));
  }
  for(const workdir of ['/approved/ape','C:\\approved\\ape','\\\\fixture-host\\ape'])
    assert.equal(validateJob({...job,workdir},{...context,workdir}).valid,true,workdir);
});

test('job command is exact and validation never authenticates fixture authority',()=>{
  assert.equal(validateJob({...job,command:' report '},context).valid,false);
  assert.equal(validateJob({...job,command:'execute'},context).valid,false);
  for(const command of ['report','capabilities']) {
    const out=validateJob({...job,command},context);
    assert.equal(out.valid,true); assert.equal(out.activated,false); assert.equal(out.permissionVerified,false);
  }
});

test('CLI reports invalid suspension and job inputs as blocked while preserving valid simulation',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-controls-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  for(const [command,payload,exit] of [
    ['suspend',{...fixture,items:undefined},1],
    ['suspend',{...fixture,items:[{key:'syn-a',status:'pending'},{key:'syn-a',status:'accepted'}]},1],
    ['plan-job',{...fixture,job:{...job,maxItems:1.5},context},1],
    ['plan-job',{...fixture,job,context},0],
    ['suspend',fixture,0]
  ]) {
    const file=path.join(dir,'input.json'); await writeFile(file,JSON.stringify(payload));
    const out=spawnSync(process.execPath,[cli,command,file,'--now',now.toISOString()],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,exit,out.stdout);
    const body=JSON.parse(out.stdout); assert.equal(body.status,exit?'blocked':'completed-simulation');
    assert.equal(body.canExecute,false); assert.equal(body.externalCalls,0);
  }
});
