import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {publicFiles} from '../scripts/site-config.mjs';
import {dispatch} from '../scripts/marketing-workbench.mjs';
import {parseStoreHours} from '../scripts/store-hours.mjs';
const root=new URL('../',import.meta.url);
test('V2 coverage has all C/P/J and explicit eight maturity dimensions, no dropped requirement',async()=>{
 const matrix=JSON.parse(await readFile(new URL('marketing/assistant-local/MATRICE-V2.json',root),'utf8'));
 const expected=[...Array.from({length:30},(_,i)=>'C'+String(i+1).padStart(2,'0')),
  ...Array.from({length:24},(_,i)=>'P'+String(i+1).padStart(2,'0')),
  ...Array.from({length:18},(_,i)=>'J'+String(i+1).padStart(2,'0'))];
 assert.deepEqual(matrix.rows.map(r=>r.id),expected);
 for(const row of matrix.rows) {
  for(const k of ['besoin','valeur_attendue','source_de_verite','proprietaire','composant_reutilise','ajout_necessaire',
   'preconditions_donnees_acces','skill','outil_executable','preuve_attendue','priorite','dependances','blocage_exact']) assert.ok(row[k],row.id+':'+k);
  assert.deepEqual(Object.keys(row.etat),['implementation','connexion','donnees','autorisation','tests','runtime_hermes','runtime_codex','activation']);
  assert.equal(row.etat.activation.statut,'absent');
 }
});
test('T02/T12 local skill links resolve, V2 canonical metadata and nothing added to static public list',async()=>{
 const names=['ape-campagnes-locales','ape-avis-google','ape-audience-preferences','ape-revue-mesure'];
 for(const name of names) {
  const url=new URL('.agents/skills/'+name+'/SKILL.md',root),text=await readFile(url,'utf8');
  assert.ok(text.includes('version: "2.0.0"'));
  assert.ok(text.includes('Ne pas sélectionner ni charger pour AutoMecanik, Alliance Delivery'));
  for(const link of text.matchAll(/\]\(([^)]+)\)/g)) {
   if(!link[1].includes('://')) assert.ok((await stat(new URL(link[1],url))).isFile());
  }
 }
 assert.equal(publicFiles.length,31);
 assert.ok(!publicFiles.some(p=>p.includes('marketing')||p.includes('.agents')));
});
test('T01/T11 nested foreign project and private output never pass CLI boundary',async()=>{
 const f=JSON.parse(await readFile(new URL('marketing/assistant-local/recette-v2/report.json',root),'utf8'));
 const hours=parseStoreHours(JSON.parse(await readFile(new URL('data/store-hours.json',root),'utf8')));
 const ctx={now:new Date('2026-10-02T10:00:00Z'),hours,allowed:new Set(['https://auto-pieces-equipements.fr/'])};
 f.report.events[0].project='AutoMecanik';
 assert.equal(dispatch('report',f,ctx).status,'blocked');
 delete f.report.events[0].project;f.report.secret='api_key=FAKE_TEST_VALUE';
 const output=dispatch('report',f,ctx);assert.equal(output.status,'blocked');assert.ok(!JSON.stringify(output).includes('FAKE_TEST_VALUE'));
});
