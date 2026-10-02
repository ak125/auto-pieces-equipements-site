import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { checkMandate, suspendSimulation } from '../scripts/marketing/operations.mjs';

const fixture=JSON.parse(await readFile(new URL('../marketing/assistant-local/recette-v2/mandate.json',import.meta.url),'utf8'));
const {action,grant}=fixture,now=new Date('2026-10-02T10:00:00Z');
const check=(a={},g={})=>checkMandate({...action,...a},{...grant,...g},now);
const blocked=(out,code)=>{assert.equal(out.scopeMatches,false);assert.ok(out.errors.includes(code));assert.equal(out.permissionVerified,false);assert.equal(out.canExecute,false);};

test('mandate validates every authorized list entry, including holes and non-string values',()=>{
  for(const field of ['operations','families','templates','revisions']) {
    for(const invalid of [[...grant[field],null],[...grant[field],{}],[...grant[field],' '],[...grant[field],,'other'],[...grant[field],' padded ']])
      blocked(check({}, {[field]:invalid}),'VERSION_OR_OPERATION');
    assert.equal(check({}, {[field]:[...grant[field],...grant[field]]}).scopeMatches,true);
  }
});

test('mandate exclusions must be explicit valid lists on both sides before subset comparison',()=>{
  for(const invalid of [[null],[' '],Array(1)])
    blocked(check({exclusions:invalid},{exclusions:invalid}),'AUDIENCE_EXPANDED');
  blocked(check({exclusions:['suppressed',null]}),'AUDIENCE_EXPANDED');
  blocked(check({exclusions:[]}),'AUDIENCE_EXPANDED');
  assert.equal(check({exclusions:['suppressed','withdrawn']}).scopeMatches,true);
});

test('mandate stop rules must contain actual nonempty names',()=>{
  for(const stopConditions of [[null],[{}],[' '],Array(1),['complaint',false]])
    blocked(check({}, {stopConditions}),'STOP_RULE');
  assert.equal(check({}, {stopConditions:['complaint','custom-fixture-rule']}).scopeMatches,true);
});

test('mandate channel and audience names cannot match through missing or malformed values',()=>{
  for(const channel of [undefined,null,42,'',' ',' email '])
    blocked(check({channel},{channel}),'ACCOUNT_CHANNEL');
  blocked(check({audienceRule:' rule '},{audienceRule:' rule '}),'AUDIENCE_EXPANDED');
  assert.equal(check().scopeMatches,true);
});

test('mandate contact and frequency counts are safe integers while cost retains decimals',()=>{
  for(const [actual,cap] of [['contacts','maxContacts'],['frequency','maxFrequency']]) {
    for(const value of [0.5,Number.MAX_SAFE_INTEGER+1]) {
      blocked(check({[actual]:value},{[cap]:value}),'LIMIT');
      blocked(check({[actual]:0},{[cap]:value}),'LIMIT');
    }
    assert.equal(check({[actual]:0},{[cap]:0}).scopeMatches,true);
    assert.equal(check({[actual]:Number.MAX_SAFE_INTEGER},{[cap]:Number.MAX_SAFE_INTEGER}).scopeMatches,true);
    blocked(check({[actual]:1},{[cap]:0}),'LIMIT');
  }
  assert.equal(check({cost:0.25},{maxCost:0.5}).scopeMatches,true);
  for(const cost of [-1,NaN,Infinity,'1']) blocked(check({cost}),'LIMIT');
});

test('mandate list bounds apply to all entries before deduplication or membership',()=>{
  for(const [field,code] of [['operations','VERSION_OR_OPERATION'],['families','VERSION_OR_OPERATION'],
    ['templates','VERSION_OR_OPERATION'],['revisions','VERSION_OR_OPERATION'],['exclusions','AUDIENCE_EXPANDED'],['stopConditions','STOP_RULE']]) {
    blocked(check({}, {[field]:Array(1001).fill(grant[field][0])}),code);
    assert.equal(check({}, {[field]:Array(1000).fill(grant[field][0])}).scopeMatches,true);
  }
  blocked(check({exclusions:Array(1001).fill('suppressed')}),'AUDIENCE_EXPANDED');
});

test('CLI and suspension share the stricter mandate contract without granting execution',async t=>{
  const a={...action,operation:'suspend',contacts:0.5};
  const out=suspendSimulation([{key:'syn-a',status:'pending'}],a,grant,now);
  assert.equal(out.status,'blocked'); assert.deepEqual(out.items,[]); assert.equal(out.realEffects,0);
  const dir=await mkdtemp(path.join(tmpdir(),'ape-mandates-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  for(const [command,payload,exit] of [
    ['mandate',{...fixture,grant:{...grant,stopConditions:[null]}},1],
    ['mandate',{...fixture,action:{...action,contacts:0.5}},1],
    ['suspend',{...fixture,action:a,items:[{key:'syn-a',status:'pending'}]},1],
    ['mandate',fixture,0]
  ]) {
    const file=path.join(dir,'input.json');await writeFile(file,JSON.stringify(payload));
    const result=spawnSync(process.execPath,[cli,command,file,'--now',now.toISOString()],{encoding:'utf8',timeout:15000});
    assert.equal(result.status,exit,result.stdout);
    const body=JSON.parse(result.stdout);assert.equal(body.status,exit?'blocked':'completed-simulation');
    assert.equal(body.externalCalls,0);assert.equal(body.canExecute,false);
  }
});
