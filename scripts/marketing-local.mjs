import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { publicFiles } from './site-config.mjs';

/** @typedef {{code: string, level: 'blocker'|'review', message: string}} Issue */
/** @typedef {{now: Date, allowedLinks: Set<string>}} Context */
/** @param {unknown} value @returns {Record<string, unknown>} */
function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? /** @type {Record<string, unknown>} */ (value) : {};
}
/** @param {unknown} value @returns {string} */
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
/** @param {unknown} value */
function dateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
/** @param {Date} date */
export function parisDate(date) {
  if (!Number.isFinite(date.getTime())) throw new Error('Date invalide.');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type)?.value).join('-');
}
/** @param {import('./store-hours.mjs').StoreHours} hours @param {Date} date */
export function openingAt(hours, date) {
  const day = parisDate(date);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', hourCycle: 'h23', hour: '2-digit', minute: '2-digit'
  }).formatToParts(date);
  const minute = Number(parts.find(p => p.type === 'hour')?.value) * 60 +
    Number(parts.find(p => p.type === 'minute')?.value);
  const weekday = new Date(day + 'T12:00:00Z').getUTCDay() || 7;
  const periods = hours.exceptions[day] ?? hours.weekly[weekday] ?? [];
  return periods.some(([start, end]) => minute >= start && minute < end);
}
/** Stable comparison of documentary versions, never an authorization.
 * @param {unknown} value @returns {string} */
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => JSON.stringify(key) + ':' + canonical(entry)).join(',') + '}';
  }
  return JSON.stringify(value) ?? 'null';
}
/** @param {unknown} input */
export function approvalFingerprint(input) {
  const { approval, ...document } = record(input);
  return createHash('sha256').update(canonical(document)).digest('hex');
}
/** @param {unknown} input @param {Context} context */
export function reviewDossier(input, context) {
  const dossier = record(input);
  /** @type {Issue[]} */ const issues = [];
  /** @param {string} code @param {string} message @param {'blocker'|'review'} [level] */
  const add = (code, message, level = 'blocker') => issues.push({ code, level, message });
  if (dossier.project !== 'ak125/auto-pieces-equipements-site') add('PROJECT', 'Projet Auto Pièces Équipements requis.');
  if (dossier.environment !== 'simulation') add('ENVIRONMENT', 'Seule la simulation est disponible.');
  for (const key of ['runId', 'objective', 'destination']) {
    if (!text(dossier[key])) add('SCHEMA', 'Identifiant, objectif et destination requis.');
  }
  const skill = record(dossier.skill);
  if (!['ape-campagnes-locales', 'ape-avis-google', 'ape-audience-preferences', 'ape-revue-mesure'].includes(text(skill.name)) ||
    !['1.0.0', '2.0.0'].includes(text(skill.version))) add('SKILL', 'Skill ou version non reconnue.');
  if (!['newsletter', 'google-post', 'store-support', 'whatsapp-draft', 'google-review', 'quote-draft'].includes(text(dossier.channel))) {
    add('CHANNEL', 'Canal documentaire non reconnu.');
  }
  const sources = Array.isArray(dossier.sources) ? dossier.sources : [];
  if (!sources.length || sources.some(source => !text(record(source).ref) || !dateOnly(record(source).checkedAt))) {
    add('SOURCES', 'Sources datées requises ; leur exactitude reste à relire.');
  }
  const content = record(dossier.content);
  if (!text(content.version) || !text(content.body)) add('CONTENT', 'Version et contenu requis.');
  if (dossier.channel === 'newsletter' && !text(content.subject)) add('CONTENT', 'Objet requis.');
  if (!context.allowedLinks.has(text(content.ctaUrl))) add('LINK', 'Destination absente des liens publics examinés.');
  // Free text can carry links too. This is a conservative aid, not a general HTML or PII parser.
  for (const link of text(content.body).match(/(?:https?:\/\/|javascript:|data:)[^\s<>"]+/gi) ?? []) {
    if (!context.allowedLinks.has(link)) add('LINK', 'Lien libre non reconnu dans le contenu.');
  }
  const facts = Array.isArray(dossier.facts) ? dossier.facts : [];
  if (!facts.length || facts.some(fact => !text(record(fact).claim) ||
    !sources.some(source => record(source).ref === record(fact).source))) {
    add('FACTS', 'Chaque fait doit référencer une source du dossier.');
  }
  for (const key of ['unknowns', 'risks', 'validationRequired', 'actionsNotPerformed']) {
    const values = dossier[key];
    if (!Array.isArray(values) || !values.length || values.some(value => !text(value))) {
      add('SCHEMA', 'Inconnues, risques, validation et actions non effectuées requis.');
    }
  }
  const audience = record(dossier.audience);
  if (audience.mode !== 'none' || audience.count !== 0 || Object.keys(audience).some(key => !['mode', 'count'].includes(key))) {
    add('AUDIENCE', 'Aucun adressage disponible ; éligibilité et oppositions non vérifiables ici.');
  }
  const privacy = record(dossier.privacy);
  const serialized = JSON.stringify(dossier) ?? '';
  const emails = serialized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  if (!['synthetic', 'public-business-only'].includes(text(privacy.classification)) ||
    privacy.containsPersonalData !== false ||
    emails.some(email => email.toLowerCase() !== 'contact@auto-pieces-equipements.fr') ||
    /\b[A-Z]{2}-\d{3}-[A-Z]{2}\b|\bFR\d{2}[ ]?(?:\d[ ]?){10,}|\b(?:api[_ -]?key|token|password|secret)\s*[:=]\s*[^\s"}]+/i.test(serialized)) {
    add('PRIVACY', 'Donnée privée ou classification manquante : ne pas conserver ce dossier dans Git.');
  }
  if (dossier.offer !== null && dossier.offer !== undefined) {
    const offer = record(dossier.offer);
    if (!['fictional', 'real'].includes(text(offer.kind))) add('OFFER', 'Nature de l’offre manquante.');
    if (offer.kind === 'fictional') add('FICTIONAL', 'Exercice fictif : aucune publication autorisée.', 'review');
    if (!Array.isArray(offer.products) || !offer.products.length || offer.products.some(product => !text(product)) ||
      !text(offer.conditions)) add('OFFER', 'Produits concernés et conditions requis.');
    if (typeof offer.priceTtc !== 'number' || !Number.isFinite(offer.priceTtc) || offer.priceTtc <= 0) {
      add('PRICE', 'Prix TTC manquant ou invalide ; bloquer l’offre chiffrée.');
    }
    if (!dateOnly(offer.startsOn) || !dateOnly(offer.endsOn) || text(offer.startsOn) > text(offer.endsOn)) {
      add('PERIOD', 'Période calendaire invalide.');
    }
    const today = parisDate(context.now);
    if (dateOnly(offer.endsOn) && text(offer.endsOn) < today) add('EXPIRED', 'Offre expirée en Europe/Paris.');
    if (dateOnly(offer.startsOn) && text(offer.startsOn) > today) add('FUTURE', 'Offre future : relire avant diffusion.', 'review');
    if (!text(offer.evidence)) add('OFFER_EVIDENCE', 'Preuve de validation commerciale absente.');
    if (offer.compatibility !== 'unverified') add('COMPATIBILITY', 'Compatibilité affirmée : vérification humaine de référence et véhicule requise.');
  }
  if (/compatible (?:avec tous|tous|toutes)|compatibilité garantie|stock garanti|livraison garantie/i.test(text(content.body))) {
    add('COMPATIBILITY', 'Promesse non établie dans le contenu.');
  }
  if (dossier.channel === 'google-review') {
    const review = record(dossier.review);
    add('UNTRUSTED_REVIEW', 'Avis traité comme donnée inerte ; aucune consigne ni URL de l’avis exécutée.', 'review');
    if (!text(review.id) || !dateOnly(review.date) || !text(review.version) || !Object.hasOwn(review, 'existingReply')) {
      add('RECHECK_REVIEW', 'Identité, date, version ou réponse existante à recontrôler manuellement.', 'review');
    }
    if (review.sensitive === true || /rembours|plainte|avocat|accus|arnaque|danger|bless|secret|\.env|ignore.+instruction/i.test(text(review.text))) {
      add('SENSITIVE', 'Réclamation sensible ou injection : validation renforcée requise.');
    }
  }
  const approval = record(dossier.approval);
  if (dossier.approval && approval.fingerprint !== approvalFingerprint(dossier)) {
    add('APPROVAL_CHANGED', 'La trace ne correspond plus à cette version ; nouvelle revue nécessaire.');
  }
  add('HUMAN_REVIEW', 'Les faits libres, la confidentialité et les preuves exigent une relecture humaine.', 'review');
  add('NO_CONNECTOR', 'Aucun connecteur d’envoi ou publication dans cet outil.', 'review');
  return { draftReady: !issues.some(issue => issue.level === 'blocker'),
    canExecute: false, issues };
}
/** @param {unknown} input @param {Context} context */
export function simulate(input, context) {
  return { ...reviewDossier(input, context), status: 'simulation-only', transportCalls: 0 };
}
/** @param {string} value */
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character] ?? character);
}
/** @param {unknown} input @param {Context} context */
export function renderNewsletter(input, context) {
  const result = reviewDossier(input, context);
  if (!result.draftReady || record(input).channel !== 'newsletter') throw new Error('Brouillon non conforme.');
  const content = record(record(input).content);
  const subject = text(content.subject);
  const body = text(content.body);
  const url = text(content.ctaUrl);
  const label = text(content.ctaLabel) || 'Consulter le site';
  const exercise = record(record(input).offer).kind === 'fictional' ||
    record(record(input).privacy).classification === 'synthetic';
  const footer = 'Auto Pièces Équipements — 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois\n' +
    'Expéditeur à vérifier : contact@auto-pieces-equipements.fr\nDésinscription non raccordée : {{unsubscribe_url}}';
  const plain = 'BROUILLON NON ADRESSÉ — ' + subject + '\n\n' + body + '\n\n' + label + ' : ' + url + '\n\n' + footer;
  const html = '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"><title>' + escapeHtml(subject) +
    '</title></head><body style="margin:0;background:#f5f5f5;font:16px Arial,sans-serif;color:#222">' +
    '<main style="max-width:560px;margin:24px auto;padding:24px;background:white">' +
    '<p style="font-weight:bold;color:#8b2800">BROUILLON NON ADRESSÉ' +
    (exercise ? ' — EXERCICE' : '') + '</p><h1 style="font-size:24px">' +
    escapeHtml(subject) + '</h1><p style="line-height:1.6;white-space:pre-line">' + escapeHtml(body) +
    '</p><p><a href="' + escapeHtml(url) + '">' + escapeHtml(label) +
    '</a></p><hr><p style="font-size:13px;white-space:pre-line">' + escapeHtml(footer) + '</p></main></body></html>\n';
  return { html, text: plain };
}
/** Exact source destinations only: no network probe, tracking parameter or inferred URL.
 * @returns {Promise<Set<string>>} */
export async function loadAllowedLinks() {
  const links = new Set(['https://auto-pieces-equipements.fr/']);
  for (const file of publicFiles.filter(file => file.endsWith('.html'))) {
    links.add(new URL(file, 'https://auto-pieces-equipements.fr/').href);
    const html = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const raw = (match[1] ?? '').replaceAll('&amp;', '&');
      try {
        const url = new URL(raw, 'https://auto-pieces-equipements.fr/' + (file === 'index.html' ? '' : file));
        if (['https:', 'mailto:', 'tel:'].includes(url.protocol)) links.add(url.href);
      } catch { /* Invalid source links are handled by the existing site validator. */ }
    }
  }
  return links;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const file = process.argv[2];
    if (!file || process.argv.length !== 3) throw new Error('Usage: node scripts/marketing-local.mjs chemin-dossier.json');
    /** @type {unknown} */
    const input = JSON.parse(await readFile(file, 'utf8'));
    const result = simulate(input, { now: new Date(), allowedLinks: await loadAllowedLinks() });
    console.log(JSON.stringify(result, null, 2));
    if (!result.draftReady) process.exitCode = 1;
  } catch {
    console.error('Dossier illisible ou invalide ; aucun contenu ni détail privé journalisé.');
    process.exitCode = 1;
  }
}
