import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {inspectSkillIndex} from '../scripts/marketing/operations.mjs';
import {PROJECT} from '../scripts/marketing/common.mjs';

const names=['ape-campagnes-locales','ape-avis-google','ape-audience-preferences','ape-revue-mesure'];
const context={project:PROJECT,root:'/ape'};
const entries=(root='/ape')=>names.map(name=>({name,version:'2.0.0',path:root+'/.agents/skills/'+name+'/SKILL.md',referencesValid:true}));

test('skill index preserves partial inspection but reports missing expected skills explicitly',()=>{
  const partial=inspectSkillIndex(entries().slice(0,1),context);
  assert.equal(partial.valid,true);assert.equal(partial.complete,false);
  assert.deepEqual(partial.missingSkills,[...names.slice(1)].sort());assert.equal(partial.expectedCount,4);
  const full=inspectSkillIndex(Object.freeze(entries().map(Object.freeze)),context);
  assert.equal(full.valid,true);assert.equal(full.complete,true);assert.deepEqual(full.missingSkills,[]);
  assert.deepEqual(full,inspectSkillIndex(entries().reverse(),context));
});

test('skill index rejects malformed and sparse collections with structured errors instead of throwing',()=>{
  for(const input of [Array(1),undefined,null,{},[null],[...entries(),,],Array(1001).fill(entries()[0])]) {
    let out;assert.doesNotThrow(()=>{out=inspectSkillIndex(input,context);});
    assert.equal(out.valid,false);assert.equal(out.complete,false);assert.ok(out.errors.length);
    assert.equal(out.referencesVerified,false);assert.equal(out.implicitRoutingVerified,false);
  }
  const empty=inspectSkillIndex([],context);assert.ok(empty.errors.includes('EMPTY'));
  assert.deepEqual(empty.missingSkills,[...names].sort());
});

test('skill index detects canonical duplicate names and gives deterministic diagnostics',()=>{
  const input=[...entries(),{...entries()[0],name:' '+names[0]+' '}];
  const out=inspectSkillIndex(input,context);
  assert.equal(out.valid,false);assert.ok(out.errors.includes('DUPLICATE'));assert.equal(out.complete,false);
  assert.deepEqual(out,inspectSkillIndex(input.reverse(),context));
  const padded=entries().map(entry=>({...entry,name:' '+entry.name+' '}));
  assert.equal(inspectSkillIndex(padded,context).complete,true);
});

test('skill index root must be absolute and explicit even if paths repeat the same malformed root',()=>{
  for(const root of ['ape','../ape','.','C:ape','\\ape',' /ape','/ape\0']) {
    const out=inspectSkillIndex(entries(root),{...context,root});
    assert.equal(out.valid,false,root);assert.ok(out.errors.includes('CONTEXT'));
  }
  for(const root of ['/ape','C:\\approved\\ape','\\\\fixture-host\\ape'])
    assert.equal(inspectSkillIndex(entries(root),{...context,root}).complete,true,root);
  assert.equal(inspectSkillIndex(entries('/ape'),{...context,root:'/ape/'}).complete,true);
  assert.equal(inspectSkillIndex(entries(''),{...context,root:'/'}).complete,true);
});

test('complete declared index is still not verified filesystem references or runtime discovery',()=>{
  const full=inspectSkillIndex(entries(),context);
  assert.equal(full.referencesVerified,false);assert.equal(full.implicitRoutingVerified,false);
  for(const patch of [{version:'1.0.0'},{referencesValid:false},{referencesValid:'true'},{path:'/other/SKILL.md'},{name:'foreign-skill'}]) {
    const out=inspectSkillIndex([{...entries()[0],...patch},...entries().slice(1)],context);
    assert.equal(out.valid,false);assert.equal(out.complete,false);
    assert.ok(out.errors.includes('PATH_VERSION_OR_REFERENCE'));
  }
});

test('skill index CLI distinguishes partial and complete observations and blocks canonical duplicates',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'ape-skill-index-'));
  t.after(async()=>{assert.equal(path.dirname(dir),path.resolve(tmpdir()));await rm(dir,{recursive:true,force:true});});
  const cli=fileURLToPath(new URL('../scripts/marketing-workbench.mjs',import.meta.url));
  for(const [index,exit,complete] of [[entries().slice(0,1),0,false],[entries(),0,true],
    [[...entries(),{...entries()[0],name:' '+names[0]+' '}],1,false],[[null],1,false]]) {
    const file=path.join(dir,'input.json');
    await writeFile(file,JSON.stringify({project:PROJECT,environment:'simulation',classification:'synthetic',schemaVersion:'2.0.0',runId:'syn-index',index,context}));
    const out=spawnSync(process.execPath,[cli,'skill-index',file],{encoding:'utf8',timeout:15000});
    assert.equal(out.status,exit,out.stdout);const body=JSON.parse(out.stdout);
    assert.equal(body.result.complete,complete);assert.equal(body.result.referencesVerified,false);
    assert.equal(body.status,exit?'blocked':'completed-simulation');assert.equal(body.canExecute,false);assert.equal(body.externalCalls,0);
  }
});
