/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStoreHours() {
  try {
    /** @type {unknown} */
    const value = JSON.parse(document.querySelector('[data-store-hours]')?.textContent ?? 'null');
    return isRecord(value) && value.timeZone === 'Europe/Paris' && isRecord(value.weekly) && isRecord(value.exceptions)
      ? { weekly: value.weekly, exceptions: value.exceptions } : null;
  } catch {
    return null;
  }
}
const storeHours = readStoreHours();

/** @param {unknown} value @returns {value is [number, number][]} */
function validPeriods(value) {
  return Array.isArray(value) && value.every(period => Array.isArray(period) && period.length === 2 &&
    Number.isInteger(period[0]) && Number.isInteger(period[1]) && period[0] >= 0 && period[1] < 1440 && period[0] < period[1]);
}

function parisNow() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  /** @type {Record<string, number>} */
  const dayByName = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 7 };
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    day: dayByName[values.weekday?.replace('.', '').toLowerCase() ?? ''] ?? 0,
    minutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

/** @param {number} minutes */
function formatTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return minute ? `${hour}h${String(minute).padStart(2, '0')}` : `${hour}h`;
}

function updateOpeningStatus() {
  const status = document.querySelector('[data-opening-status]');
  if (!status) return;
  const now = parisNow();
  const exceptional = storeHours && Object.hasOwn(storeHours.exceptions, now.date);
  const periods = exceptional ? storeHours.exceptions[now.date] : storeHours?.weekly[now.day];
  const valid = validPeriods(periods);
  const currentWindow = valid ? periods.find(([start, end]) => now.minutes >= start && now.minutes < end) : undefined;
  const message = !valid ? 'Consultez les horaires du magasin avant votre déplacement.' : currentWindow
    ? `Magasin ouvert — fermeture à ${formatTime(currentWindow[1])}. Appelez pour vérifier la disponibilité d'une pièce.`
    : exceptional ? 'Magasin exceptionnellement fermé — consultez les horaires ou laissez un message sur WhatsApp.'
      : 'Magasin actuellement fermé — consultez les horaires ou laissez un message sur WhatsApp.';
  // The status is a live region: only announce an actual change.
  if (status.textContent !== message) status.textContent = message;
  status.classList.toggle('is-open', Boolean(currentWindow));
}

function setupOpeningStatus() {
  if (!document.querySelector('[data-opening-status]')) return;
  /** @type {number | undefined} */
  let timer;
  function refresh() {
    window.clearTimeout(timer);
    updateOpeningStatus();
    // Avoid background polling; resume with the current Paris time when visible.
    if (!document.hidden) {
      timer = window.setTimeout(refresh, 60000 - (Date.now() % 60000));
    }
  }
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', refresh);
  refresh();
}

function setupNavigation() {
  const button = document.querySelector('[data-menu-button]');
  const navigation = document.querySelector('[data-mobile-nav]');
  if (!button || !navigation) return;
  if (!(button instanceof HTMLElement) || !(navigation instanceof HTMLElement)) return;
  /** @param {boolean} open */
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  };
  /** @param {EventTarget | null} node */
  const contains = (node) => node instanceof Node && (button.contains(node) || navigation.contains(node));
  button.addEventListener('click', () => {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });
  navigation.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('a')) return;
    setOpen(false);
  });
  /** @param {KeyboardEvent} event */
  const closeOnEscape = (event) => {
    if (event.key !== 'Escape' || button.getAttribute('aria-expanded') !== 'true') return;
    event.preventDefault();
    setOpen(false);
    button.focus();
  };
  /** @param {FocusEvent} event */
  function closeOnFocusOut(event) {
    if (!contains(event.relatedTarget)) setOpen(false);
  }
  document.addEventListener('click', (event) => {
    if (!contains(event.target)) setOpen(false);
  });
  button.addEventListener('focusout', closeOnFocusOut);
  navigation.addEventListener('focusout', closeOnFocusOut);
  button.addEventListener('keydown', closeOnEscape);
  navigation.addEventListener('keydown', closeOnEscape);
}

function updateYear() {
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

setupOpeningStatus();
setupNavigation();
updateYear();
