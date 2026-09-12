import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseStoreHours, renderHoursTable, renderHoursData, hoursStructuredData, refreshHomeHours, publishedHoursMatch } from '../scripts/store-hours.mjs';

const original = JSON.parse(await readFile(new URL('../data/store-hours.json', import.meta.url), 'utf8'));
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('one schedule drives displayed, browser and structured hours, including exceptions', () => {
  const input = structuredClone(original);
  input.weekly[0].periods = [['10:00', '18:00']];
  input.exceptions = { '2026-12-25': [], '2026-12-27': [['10:00', '12:00']] };
  const schedule = parseStoreHours(input);
  const html = refreshHomeHours(home, schedule);
  assert.match(renderHoursTable(schedule), /Lundi–jeudi<\/dt><dd>10h00–18h00/);
  assert.match(html, /25\/12\/2026<\/dt><dd>Fermé/);
  assert.match(html, /27\/12\/2026<\/dt><dd>10h00–12h00/);
  assert.ok(html.includes(renderHoursData(schedule)));
  const specs = hoursStructuredData(schedule).specialOpeningHoursSpecification;
  assert.deepEqual(specs.map(spec => [spec.validFrom, spec.opens, spec.closes]), [
    ['2026-12-25', '00:00', '00:00'], ['2026-12-27', '10:00', '12:00']
  ]);
  assert.ok(publishedHoursMatch(html, schedule));
  assert.equal(refreshHomeHours(html, schedule), html, 'regeneration must be idempotent');
  assert.equal(publishedHoursMatch(html.replace('"opens": "10:00"', '"opens": "11:00"'), schedule), false);
});

test('invalid schedules fail before any generated page is written', async t => {
  const mutations = [
    ['timezone', input => { input.timeZone = 'UTC'; }],
    ['missing day', input => { input.weekly.pop(); }],
    ['duplicate day', input => { input.weekly[0].days.push(5); }],
    ['invalid day', input => { input.weekly[0].days.push(8); }],
    ['invalid time', input => { input.weekly[0].periods = [['25:00', '26:00']]; }],
    ['inverted period', input => { input.weekly[0].periods = [['18:00', '09:00']]; }],
    ['overlapping periods', input => { input.weekly[0].periods = [['09:00', '14:00'], ['13:00', '18:00']]; }],
    ['invalid date', input => { input.exceptions = { '2026-02-30': [] }; }],
    ['invalid exception', input => { input.exceptions = { '2026-12-25': 'closed' }; }]
  ];
  for (const [name, mutate] of mutations) {
    await t.test(name, () => {
      const input = structuredClone(original);
      mutate(input);
      assert.throws(() => parseStoreHours(input));
    });
  }
});

test('missing generation markers fail instead of leaving stale home hours', () => {
  assert.throws(() => refreshHomeHours(home.replace('<!-- store-hours:start -->', ''), parseStoreHours(original)), /section store-hours/);
});
