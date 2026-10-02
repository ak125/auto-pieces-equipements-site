import { readFile, writeFile } from 'node:fs/promises';
import { loadAllowedLinks, renderNewsletter } from './marketing-local.mjs';

// Only the synthetic repository fixture is rendered here. Real documents belong
// in an explicitly authorized private workspace, never in this Git repository.
const directory = new URL('../marketing/assistant-local/pilote/', import.meta.url);
/** @type {unknown} */
const dossier = JSON.parse(await readFile(new URL('newsletter.json', directory), 'utf8'));
if (!dossier || typeof dossier !== 'object' || !('runId' in dossier) ||
  dossier.runId !== 'ape-pilote-20261002') throw new Error('Fixture pilote attendue.');
const rendered = renderNewsletter(dossier, {
  now: new Date('2026-10-02T10:00:00Z'), allowedLinks: await loadAllowedLinks()
});
await writeFile(new URL('newsletter.html', directory), rendered.html);
await writeFile(new URL('newsletter.txt', directory), rendered.text);
console.log('Pilote fictif rendu en HTML/texte, sans réseau ni destinataire.');
