import { execFileSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { publicFiles, retiredPages, seoPages } from './site-config.mjs';

const root = process.cwd();
const outputDirectory = path.join(root, 'dist');
const failures = [];
const passwordPrefix = ['GOOGLE', 'PASSWORD'].join('_') + '=';
const passwordPattern = new RegExp(
  `${passwordPrefix}(?!VOTRE_MOT_DE_PASSE\\b|your-google-password\\b|<[^>]+>)[^\\s\"'\\x60]+`
);

const normalize = (value) => value.split(path.sep).join('/');

async function walk(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath, base));
    } else {
      files.push(normalize(path.relative(base, fullPath)));
    }
  }
  return files;
}

function requireMatch(content, pattern, message) {
  if (!pattern.test(content)) failures.push(message);
}

function forbidMatch(content, pattern, message) {
  if (pattern.test(content)) failures.push(message);
}

const builtFiles = (await walk(outputDirectory)).sort();
const expectedFiles = [...publicFiles].sort();

if (JSON.stringify(builtFiles) !== JSON.stringify(expectedFiles)) {
  failures.push(`Le contenu de dist/ ne correspond pas à la liste publique autorisée. Reçu : ${builtFiles.join(', ')}`);
}

for (const page of seoPages) {
  const content = await readFile(path.join(root, page), 'utf8');
  requireMatch(content, /<title>[^<]+<\/title>/i, `${page}: titre manquant`);
  requireMatch(content, /<meta\s+name="description"\s+content="[^"]+"/i, `${page}: meta description manquante`);
  requireMatch(content, /<link\s+rel="canonical"\s+href="https:\/\/auto-pieces-equipements\.fr\//i, `${page}: URL canonique manquante`);
  requireMatch(content, /<h1\b/i, `${page}: H1 manquant`);
  requireMatch(content, /href="\/mentions-legales\.html"/i, `${page}: lien vers les mentions légales manquant`);
  requireMatch(content, /href="\/politique-confidentialite\.html"/i, `${page}: lien vers la politique de confidentialité manquant`);
}

for (const page of ['mentions-legales.html', 'politique-confidentialite.html']) {
  const content = await readFile(path.join(root, page), 'utf8');
  requireMatch(content, /<meta\s+name="robots"\s+content="noindex,follow">/i, `${page}: protection noindex manquante`);
}

const deployedHtml = (
  await Promise.all(
    publicFiles
      .filter((file) => file.endsWith('.html'))
      .map((file) => readFile(path.join(outputDirectory, file), 'utf8'))
  )
).join('\n');

forbidMatch(deployedHtml, /<form\b/i, 'Un formulaire sans traitement est présent dans le site public');
forbidMatch(deployedHtml, /href=["']#["']/i, 'Un lien factice href="#" est présent dans le site public');
forbidMatch(deployedHtml, /Automecanik/i, 'La marque séparée Automecanik est présente dans le site public');
forbidMatch(deployedHtml, /4[,.]9\s*\/\s*5/i, 'Une note Google figée est présente dans le site public');
forbidMatch(deployedHtml, /demande (?:a bien été|d['’]assistance.*enregistrée)/i, 'Une fausse confirmation de formulaire est présente');
forbidMatch(deployedHtml, /ouvrons demain à/i, 'Une heure de réouverture non fiable est présente');
forbidMatch(deployedHtml, /MasterCard_Logo|Visa_Inc\._logo|PayPal\.svg/i, 'Des logos de paiement non justifiés sont présents');
forbidMatch(deployedHtml, /confirm\s*\(.*GPS/is, 'Une sollicitation GPS intrusive est présente');

for (const retiredPage of retiredPages) {
  try {
    await access(path.join(root, retiredPage));
    failures.push(`${retiredPage}: page de démonstration encore présente`);
  } catch {
    // L'absence est le résultat attendu.
  }
}

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { cwd: root })
  .toString('utf8')
  .split('\0')
  .filter(Boolean);

const trackedNodeModules = trackedFiles.filter((file) => file.startsWith('node_modules/'));
if (trackedNodeModules.length > 0) {
  failures.push(`node_modules contient encore ${trackedNodeModules.length} fichiers suivis par Git`);
}

for (const file of trackedFiles) {
  let buffer;
  try {
    buffer = await readFile(path.join(root, file));
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }
  if (buffer.includes(0)) continue;
  const content = buffer.toString('utf8');
  if (/AIza[0-9A-Za-z_-]{20,}/.test(content)) {
    failures.push(`${file}: clé API Google ressemblant à un secret`);
  }
  if (passwordPattern.test(content)) {
    failures.push(`${file}: mot de passe Google ressemblant à un secret`);
  }
}

if (failures.length > 0) {
  console.error('Validation du site échouée :');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validation réussie : ${seoPages.length} pages SEO, ${builtFiles.length} fichiers publics, aucun secret détecté.`);
