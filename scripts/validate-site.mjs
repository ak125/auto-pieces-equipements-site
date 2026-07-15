import { execFileSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { publicFiles, retiredPages, seoPages } from './site-config.mjs';

const root = process.cwd();
const outputDirectory = path.join(root, 'dist');
const failures = [];
const seenTitles = new Map();
const seenCanonicals = new Map();
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
  requireMatch(content, /<link\s+rel="stylesheet"\s+href="\/assets\/site\.css">/i, `${page}: feuille de style locale manquante`);
  requireMatch(content, /<meta\s+property="og:image"\s+content="https:\/\/auto-pieces-equipements\.fr\//i, `${page}: image Open Graph manquante`);
  requireMatch(content, /<script\s+type="application\/ld\+json">/i, `${page}: données structurées manquantes`);
  requireMatch(content, /<img\b[^>]+src="\/assets\/images\/products\//i, `${page}: visuel produit local manquant`);
  requireMatch(content, /href="\/mentions-legales\.html"/i, `${page}: lien vers les mentions légales manquant`);
  requireMatch(content, /href="\/politique-confidentialite\.html"/i, `${page}: lien vers la politique de confidentialité manquant`);
  forbidMatch(content, /<(?:script|img)\b[^>]+src=["']https?:\/\//i, `${page}: ressource distante chargée directement`);
  forbidMatch(content, /<link\b[^>]+rel=["']stylesheet["'][^>]+href=["']https?:\/\//i, `${page}: feuille de style distante chargée directement`);

  const title = content.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const canonical = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (title) {
    if (seenTitles.has(title)) failures.push(`${page}: titre dupliqué avec ${seenTitles.get(title)}`);
    seenTitles.set(title, page);
  }
  if (canonical) {
    if (seenCanonicals.has(canonical)) failures.push(`${page}: canonical dupliquée avec ${seenCanonicals.get(canonical)}`);
    seenCanonicals.set(canonical, page);
  }

  for (const match of content.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      failures.push(`${page}: JSON-LD invalide (${error.message})`);
    }
  }

  for (const imageTag of content.match(/<img\b[^>]*>/gi) || []) {
    requireMatch(imageTag, /\salt="[^"]*"/i, `${page}: image sans attribut alt`);
    requireMatch(imageTag, /\swidth="\d+"/i, `${page}: image sans largeur explicite`);
    requireMatch(imageTag, /\sheight="\d+"/i, `${page}: image sans hauteur explicite`);
  }
}

for (const page of seoPages.filter((file) => file !== 'batterie-voiture-les-pavillons-sous-bois.html')) {
  const content = await readFile(path.join(root, page), 'utf8');
  forbidMatch(content, /\b\d+(?:[,.]\d+)?\s*€/i, `${page}: prix non validé ajouté hors de la page batterie`);
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

for (const page of publicFiles.filter((file) => file.endsWith('.html'))) {
  const content = await readFile(path.join(outputDirectory, page), 'utf8');
  for (const match of content.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:https?:|tel:|mailto:|#)/i.test(href)) continue;
    const target = href.split('#')[0].split('?')[0];
    if (!target || target === '/') continue;
    const relativeTarget = target.replace(/^\//, '');
    if (!publicFiles.includes(relativeTarget)) {
      failures.push(`${page}: lien interne vers un fichier non publié (${href})`);
    }
  }
}

const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const page of seoPages) {
  const expectedUrl = page === 'index.html'
    ? 'https://auto-pieces-equipements.fr/'
    : `https://auto-pieces-equipements.fr/${page}`;
  requireMatch(sitemap, new RegExp(`<loc>${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`), `sitemap.xml: URL manquante (${expectedUrl})`);
}

forbidMatch(deployedHtml, /<form\b/i, 'Un formulaire sans traitement est présent dans le site public');
forbidMatch(deployedHtml, /href=["']#["']/i, 'Un lien factice href="#" est présent dans le site public');
forbidMatch(deployedHtml, /Automecanik/i, 'La marque séparée Automecanik est présente dans le site public');
forbidMatch(deployedHtml, /4[,.]9\s*\/\s*5/i, 'Une note Google figée est présente dans le site public');
forbidMatch(deployedHtml, /demande (?:a bien été|d['’]assistance.*enregistrée)/i, 'Une fausse confirmation de formulaire est présente');
forbidMatch(deployedHtml, /ouvrons demain à/i, 'Une heure de réouverture non fiable est présente');
forbidMatch(deployedHtml, /MasterCard_Logo|Visa_Inc\._logo|PayPal\.svg/i, 'Des logos de paiement non justifiés sont présents');
forbidMatch(deployedHtml, /confirm\s*\(.*GPS/is, 'Une sollicitation GPS intrusive est présente');
forbidMatch(deployedHtml, /cdn\.tailwindcss\.com|fonts\.googleapis\.com|cdnjs\.cloudflare\.com|images\.unsplash\.com/i, 'Une dépendance d’affichage distante est encore présente');

const localAssetReferences = [...deployedHtml.matchAll(/(?:src|href)=["']\/(assets\/[^"']+)["']/gi)]
  .map((match) => match[1]);
for (const asset of new Set(localAssetReferences)) {
  if (!publicFiles.includes(asset)) {
    failures.push(`${asset}: ressource locale référencée mais absente de la liste publique`);
  }
}

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
