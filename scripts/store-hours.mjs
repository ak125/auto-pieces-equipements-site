import { readFile } from 'node:fs/promises';

/** @typedef {[number, number]} Period */
/** @typedef {{timeZone: string, weekly: Record<string, Period[]>, exceptions: Record<string, Period[]>}} StoreHours */
/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {unknown} value */
function minutes(value) {
  if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Heure attendue au format HH:MM.');
  const [hour, minute] = value.split(':').map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

/** @param {unknown} value @returns {Period[]} */
function periods(value) {
  if (!Array.isArray(value)) throw new Error('Les créneaux doivent être un tableau.');
  let previousEnd = -1;
  return value.map(entry => {
    if (!Array.isArray(entry) || entry.length !== 2) throw new Error('Chaque créneau exige une ouverture et une fermeture.');
    const start = minutes(entry[0]);
    const end = minutes(entry[1]);
    if (start >= end || start < previousEnd) throw new Error('Créneaux inversés, non triés ou superposés.');
    previousEnd = end;
    return [start, end];
  });
}

/** @param {unknown} input @returns {StoreHours} */
export function parseStoreHours(input) {
  if (!isRecord(input) || input.timeZone !== 'Europe/Paris' || !Array.isArray(input.weekly) || !isRecord(input.exceptions)) {
    throw new Error('Configuration des horaires invalide : Europe/Paris, weekly et exceptions requis.');
  }
  /** @type {Record<string, Period[]>} */
  const weekly = {};
  for (const group of input.weekly) {
    if (!isRecord(group) || !Array.isArray(group.days) || !group.days.length) throw new Error('Groupe de jours invalide.');
    const windows = periods(group.periods);
    for (const day of group.days) {
      if (!Number.isInteger(day) || day < 1 || day > 7 || Object.hasOwn(weekly, day)) throw new Error('Jour invalide ou dupliqué (1 à 7).');
      weekly[day] = windows;
    }
  }
  if (Object.keys(weekly).length !== 7) throw new Error('Les sept jours doivent être définis.');
  /** @type {Record<string, Period[]>} */
  const exceptions = {};
  for (const [date, windows] of Object.entries(input.exceptions).sort()) {
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      throw new Error(`Date exceptionnelle invalide : ${date}`);
    }
    exceptions[date] = periods(windows);
  }
  return { timeZone: 'Europe/Paris', weekly, exceptions };
}

export async function loadStoreHours() {
  /** @type {unknown} */
  const input = JSON.parse(await readFile(new URL('../data/store-hours.json', import.meta.url), 'utf8'));
  return parseStoreHours(input);
}

/** @param {number} value */
function clock(value) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}
/** @param {Period[]} windows */
function display(windows) {
  return windows.length ? windows.map(([start, end]) => `${clock(start).replace(/^0/, '').replace(':', 'h')}–${clock(end).replace(/^0/, '').replace(':', 'h')}`).join('<br>') : 'Fermé';
}
const daysFr = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const daysEn = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** @param {StoreHours} hours */
export function renderHoursTable(hours) {
  let rows = '';
  for (let day = 1; day <= 7; day++) {
    const start = day;
    const windows = hours.weekly[day] ?? [];
    while (day < 7 && JSON.stringify(windows) === JSON.stringify(hours.weekly[day + 1])) day++;
    const label = start === day ? daysFr[start] : `${daysFr[start]}–${daysFr[day]?.toLowerCase()}`;
    rows += `<dt>${label}</dt><dd>${display(windows)}</dd>`;
  }
  const exceptional = Object.entries(hours.exceptions).map(([date, windows]) => `<dt>${date.split('-').reverse().join('/')}</dt><dd>${display(windows)}</dd>`).join('');
  return `<dl>${rows}</dl>${exceptional ? `<h4>Horaires exceptionnels</h4><dl>${exceptional}</dl>` : ''}`;
}

/** @param {StoreHours} hours */
export function hoursStructuredData(hours) {
  return {
    openingHoursSpecification: Object.entries(hours.weekly).flatMap(([day, windows]) =>
      (windows.length ? windows : [[0, 0]]).map(([start = 0, end = 0]) => ({
        '@type': 'OpeningHoursSpecification', dayOfWeek: daysEn[Number(day)], opens: clock(start), closes: clock(end)
      }))),
    specialOpeningHoursSpecification: Object.entries(hours.exceptions).flatMap(([date, windows]) =>
      (windows.length ? windows : [[0, 0]]).map(([start = 0, end = 0]) => ({
        '@type': 'OpeningHoursSpecification', validFrom: date, validThrough: date, opens: clock(start), closes: clock(end)
      })))
  };
}

/** @param {StoreHours} hours */
export function renderHoursData(hours) {
  return `<script type="application/json" data-store-hours>${JSON.stringify(hours).replaceAll('<', '\\u003c')}</script>`;
}

/** @param {string} html @param {StoreHours} hours */
export function publishedHoursMatch(html, hours) {
  if (!html.includes(renderHoursTable(hours)) || !html.includes(renderHoursData(hours))) return false;
  const expected = hoursStructuredData(hours);
  let matchingStores = 0;
  let stores = 0;
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      /** @type {unknown} */
      const graph = JSON.parse(match[1] ?? '');
      if (!isRecord(graph) || !Array.isArray(graph['@graph'])) continue;
      for (const entry of graph['@graph']) {
        if (!isRecord(entry) || entry['@type'] !== 'AutoPartsStore') continue;
        stores++;
        if (JSON.stringify(entry.openingHoursSpecification) === JSON.stringify(expected.openingHoursSpecification) &&
          JSON.stringify(entry.specialOpeningHoursSpecification) === JSON.stringify(expected.specialOpeningHoursSpecification)) matchingStores++;
      }
    } catch {
      return false;
    }
  }
  return stores === 1 && matchingStores === 1;
}

/** @param {string} html @param {StoreHours} hours */
export function refreshHomeHours(html, hours) {
  /** @param {string} name @param {string} content */
  const replaceSection = (name, content) => {
    const pattern = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`, 'g');
    if ([...html.matchAll(pattern)].length !== 1) throw new Error(`Accueil : section ${name} absente ou dupliquée.`);
    html = html.replace(pattern, `<!-- ${name}:start -->${content}<!-- ${name}:end -->`);
  };
  replaceSection('store-hours', renderHoursTable(hours));
  replaceSection('store-hours-data', renderHoursData(hours));
  let stores = 0;
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (script, text) => {
    /** @type {unknown} */
    const graph = JSON.parse(text);
    if (!isRecord(graph) || !Array.isArray(graph['@graph'])) return script;
    for (const entry of graph['@graph']) {
      if (isRecord(entry) && entry['@type'] === 'AutoPartsStore') {
        Object.assign(entry, hoursStructuredData(hours));
        stores++;
      }
    }
    return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2).replaceAll('<', '\\u003c')}\n</script>`;
  });
  if (stores !== 1) throw new Error('Accueil : exactement un AutoPartsStore requis.');
  return html;
}
