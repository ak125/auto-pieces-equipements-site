import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { loadStoreHours } from '../scripts/store-hours.mjs';

const source = readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');
const storeHours = await loadStoreHours();

// Run the shipped script with a controlled clock and browser event/timer ports.
function page(instant, { withStatus = true, configuration = JSON.stringify(storeHours) } = {}) {
  let now = Date.parse(instant);
  let nextId = 0;
  let text = '';
  let writes = 0;
  const timers = new Map();
  const documentEvents = new Map();
  const windowEvents = new Map();
  const classes = new Set();
  const status = {
    get textContent() { return text; },
    set textContent(value) { text = value; writes++; },
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); }
    }
  };
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  function listen(events, name, callback) {
    if (!events.has(name)) events.set(name, []);
    events.get(name).push(callback);
  }
  const document = {
    hidden: false,
    get visibilityState() { return this.hidden ? 'hidden' : 'visible'; },
    querySelector: (selector) => selector === '[data-store-hours]' ? { textContent: configuration } : withStatus && selector === '[data-opening-status]' ? status : null,
    querySelectorAll: () => [],
    addEventListener: (name, callback) => listen(documentEvents, name, callback)
  };
  const context = vm.createContext({
    Date: Clock, Intl, document,
    setTimeout(callback, delay) {
      const id = ++nextId;
      timers.set(id, { callback, time: now + delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    addEventListener: (name, callback) => listen(windowEvents, name, callback)
  });
  vm.runInContext('window = globalThis', context);
  vm.runInContext(source, context, { filename: 'assets/site.js' });
  function emit(events, name) {
    for (const callback of events.get(name) || []) callback();
  }
  return {
    get open() { return classes.has('is-open'); },
    get text() { return text; },
    get writes() { return writes; },
    get timerCount() { return timers.size; },
    advance(target) {
      const until = Date.parse(target);
      let executed = 0;
      while (true) {
        const [id, timer] = [...timers].sort((a, b) => a[1].time - b[1].time)[0] || [];
        if (!timer || timer.time > until) break;
        assert.ok(++executed < 2000, 'timer loop must make progress');
        now = timer.time;
        timers.delete(id);
        timer.callback();
      }
      now = until;
    },
    jump(target) { now = Date.parse(target); },
    hidden(value) { document.hidden = value; emit(documentEvents, 'visibilitychange'); },
    pageshow() { emit(windowEvents, 'pageshow'); }
  };
}

test('Friday closes at 13:30 Paris, even when loaded between minute boundaries', () => {
  const browser = page('2026-09-11T11:29:47Z');
  assert.equal(browser.open, true);
  browser.advance('2026-09-11T11:29:59.999Z');
  assert.equal(browser.open, true);
  browser.advance('2026-09-11T11:30:00Z');
  assert.equal(browser.open, false, 'the existing open tab must show the closing');
  assert.match(browser.text, /actuellement fermé/);
});

test('Friday reopens at 14:30 Paris', () => {
  const browser = page('2026-09-11T12:29:59Z');
  assert.equal(browser.open, false);
  browser.advance('2026-09-11T12:30:00Z');
  assert.equal(browser.open, true);
  assert.match(browser.text, /fermeture à 18h30/);
});

test('winter opening uses Paris time independently of host timezone', () => {
  const browser = page('2026-12-07T08:29:59Z');
  assert.equal(browser.open, false);
  browser.advance('2026-12-07T08:30:00Z');
  assert.equal(browser.open, true);
});

test('Paris seasonal clock changes keep exceptional hours on the correct local date', () => {
  for (const [date, before, opening, transition, closing] of [
    ['2026-03-29', '2026-03-29T00:29:59Z', '2026-03-29T00:30:00Z', '2026-03-29T01:00:00Z', '2026-03-29T01:30:00Z'],
    ['2026-10-25', '2026-10-24T23:29:59Z', '2026-10-24T23:30:00Z', '2026-10-25T01:00:00Z', '2026-10-25T02:30:00Z']
  ]) {
    const schedule = structuredClone(storeHours);
    schedule.exceptions = { [date]: [[90, 210]] }; // Browser configuration uses minutes after midnight.
    const browser = page(before, { configuration: JSON.stringify(schedule) });
    assert.equal(browser.open, false, date);
    browser.advance(opening);
    assert.equal(browser.open, true, date);
    browser.advance(transition);
    assert.equal(browser.open, true, 'the clock jump or repeated hour does not close the store');
    browser.advance(closing);
    assert.equal(browser.open, false, date);
  }
});

test('Saturday closes at 16:00 Paris', () => {
  const browser = page('2026-09-12T13:59:59Z');
  assert.equal(browser.open, true);
  browser.advance('2026-09-12T14:00:00Z');
  assert.equal(browser.open, false);
});

test('Sunday remains closed and Monday opens after the day changes', () => {
  const browser = page('2026-09-13T21:59:59Z');
  assert.equal(browser.open, false);
  browser.advance('2026-09-14T07:30:00Z');
  assert.equal(browser.open, true);
});

test('initial display respects exact business boundaries', () => {
  for (const [instant, expected] of [
    ['2026-09-11T07:30:00Z', true],
    ['2026-09-11T11:30:00Z', false],
    ['2026-09-11T12:30:00Z', true],
    ['2026-09-11T16:30:00Z', false],
    ['2026-09-13T10:00:00Z', false],
    ['2026-12-07T08:30:00Z', true]
  ]) assert.equal(page(instant).open, expected, instant);
});

test('hidden tab suspends its timer and immediately catches up when visible', () => {
  const browser = page('2026-09-11T11:29:00Z');
  browser.hidden(true);
  assert.equal(browser.timerCount, 0);
  browser.jump('2026-09-11T11:31:00Z');
  browser.hidden(false);
  assert.equal(browser.open, false);
  assert.equal(browser.timerCount, 1);
});

test('restored page catches up without accumulating timers', () => {
  const browser = page('2026-09-11T11:29:00Z');
  browser.jump('2026-09-11T11:31:00Z');
  for (let index = 0; index < 3; index++) browser.pageshow();
  assert.equal(browser.open, false);
  assert.equal(browser.timerCount, 1);
});

test('an unchanged status does not rewrite the live region each minute', () => {
  const browser = page('2026-09-11T09:00:00Z');
  const initialWrites = browser.writes;
  browser.advance('2026-09-11T09:05:00Z');
  browser.pageshow();
  assert.equal(browser.writes, initialWrites);
  assert.equal(browser.timerCount, 1);
});

test('pages without a status element need no refresh timer', () => {
  const browser = page('2026-09-11T09:00:00Z', { withStatus: false });
  browser.hidden(true);
  browser.hidden(false);
  browser.pageshow();
  assert.equal(browser.timerCount, 0);
});

test('an exceptional closure overrides a normally open weekday', () => {
  const configuration = JSON.stringify({ ...storeHours, exceptions: { '2026-09-14': [] } });
  const browser = page('2026-09-14T10:00:00Z', { configuration });
  assert.equal(browser.open, false);
  assert.match(browser.text, /exceptionnellement fermé/);
});

test('exceptional periods replace the regular schedule, including a Sunday opening', () => {
  const configuration = JSON.stringify({ ...storeHours, exceptions: { '2026-09-13': [[600, 660], [840, 900]] } });
  const browser = page('2026-09-13T07:59:59Z', { configuration });
  assert.equal(browser.open, false);
  browser.advance('2026-09-13T08:00:00Z');
  assert.equal(browser.open, true);
  assert.match(browser.text, /fermeture à 11h/);
  browser.advance('2026-09-13T09:00:00Z');
  assert.equal(browser.open, false);
  browser.advance('2026-09-13T12:00:00Z');
  assert.equal(browser.open, true);
});

test('exceptions follow the Paris calendar date across midnight and expire the next day', () => {
  const configuration = JSON.stringify({ ...storeHours, exceptions: { '2026-09-14': [[0, 30]] } });
  const browser = page('2026-09-13T21:59:59Z', { configuration });
  browser.advance('2026-09-13T22:00:00Z');
  assert.equal(browser.open, true, 'Monday in Paris while still Sunday in UTC');
  browser.jump('2026-09-15T08:00:00Z');
  browser.pageshow();
  assert.equal(browser.open, true, 'Tuesday uses regular hours again');
  assert.match(browser.text, /18h30/);
});

test('missing or malformed schedule never claims the shop is open', () => {
  for (const configuration of ['null', '{invalid', JSON.stringify({ ...storeHours, weekly: { 1: 'invalid' } })]) {
    const browser = page('2026-09-14T10:00:00Z', { configuration });
    assert.equal(browser.open, false);
    assert.match(browser.text, /Consultez les horaires/);
  }
});

test('closed visitors see the next opening in the Paris calendar', () => {
  for (const [instant, expected] of [
    ['2026-09-28T04:00:00Z', /aujourd’hui à 9h30/],
    ['2026-09-11T11:30:00Z', /aujourd’hui à 14h30/],
    ['2026-09-11T16:30:00Z', /demain à 9h30/],
    ['2026-09-12T14:00:00Z', /lundi 14 septembre à 9h30/],
    ['2026-09-13T21:59:59Z', /demain à 9h30/],
    ['2026-09-13T22:00:00Z', /aujourd’hui à 9h30/],
    ['2026-12-31T22:00:00Z', /demain à 9h30/],
    ['2026-03-28T15:00:00Z', /lundi 30 mars à 9h30/],
    ['2026-10-24T14:00:00Z', /lundi 26 octobre à 9h30/]
  ]) {
    const browser = page(instant);
    assert.equal(browser.open, false, instant);
    assert.match(browser.text, /prochaine ouverture/);
    assert.match(browser.text, expected, instant);
  }
});

test('next opening skips exceptional closures and uses exceptional opening hours', () => {
  const configuration = JSON.stringify({ ...storeHours, exceptions: {
    '2026-09-14': [],
    '2026-09-15': [[660, 720]],
    '2026-09-20': [[600, 660]]
  } });
  assert.match(page('2026-09-13T10:00:00Z', { configuration }).text, /mardi 15 septembre à 11h/);
  assert.match(page('2026-09-14T10:00:00Z', { configuration }).text, /exceptionnellement fermé.*demain à 11h/);
  assert.match(page('2026-09-19T14:00:00Z', { configuration }).text, /demain à 10h/);
});

test('next opening is replaced by the open status at the scheduled minute', () => {
  const browser = page('2026-09-11T12:29:59Z');
  assert.match(browser.text, /aujourd’hui à 14h30/);
  browser.advance('2026-09-11T12:30:00Z');
  assert.equal(browser.open, true);
  assert.match(browser.text, /fermeture à 18h30/);
  assert.doesNotMatch(browser.text, /prochaine ouverture/);
});

test('unknown future hours or a week without opening keeps a cautious fallback', () => {
  const configurations = [
    { ...storeHours, weekly: { ...storeHours.weekly, 1: 'invalid' } },
    { ...storeHours, weekly: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] } }
  ];
  for (const value of configurations) {
    const browser = page('2026-09-13T10:00:00Z', { configuration: JSON.stringify(value) });
    assert.equal(browser.open, false);
    assert.doesNotMatch(browser.text, /prochaine ouverture/);
    assert.match(browser.text, /consultez les horaires/);
  }
});
