import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkToolchain } from '../scripts/check-toolchain.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));

test('toolchain alignment rejects independent version and installation-policy drift', async (t) => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'auto-pieces-toolchain-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await mkdir(path.join(fixture, 'google-places-proxy'));
  const files = ['.nvmrc', 'package.json', '.npmrc', 'google-places-proxy/package.json', 'google-places-proxy/.npmrc'];
  const originals = new Map();
  for (const file of files) {
    const content = await readFile(path.join(repository, file), 'utf8');
    originals.set(file, content);
    await writeFile(path.join(fixture, file), content);
  }
  assert.deepEqual(await checkToolchain(fixture), []);
  const json = mutate => content => {
    const manifest = JSON.parse(content);
    mutate(manifest);
    return JSON.stringify(manifest);
  };
  const scenarios = [
    ['floating Node', '.nvmrc', () => '24', /version Node stable exacte/],
    ['unbounded Node', 'package.json', json(m => { m.engines.node = '>=24.0.0'; }), /engines.node/],
    ['floating npm', 'package.json', json(m => { m.packageManager = 'npm@latest'; }), /packageManager/],
    ['different Worker npm', 'google-places-proxy/package.json', json(m => { m.packageManager = 'npm@11.0.0'; }), /packageManager/],
    ['different npm engine', 'google-places-proxy/package.json', json(m => { m.engines.npm = '>=11'; }), /engines.npm/],
    ['different Worker TypeScript', 'google-places-proxy/package.json', json(m => { m.devDependencies.typescript = '0.0.0'; }), /TypeScript/],
    ['floating TypeScript', 'package.json', json(m => { m.devDependencies.typescript = '^7.0.2'; }), /version stable exacte/],
    ['wrong Node types major', 'package.json', json(m => { m.devDependencies['@types/node'] = '0.0.0'; }), /@types\/node/],
    ['disabled engine enforcement', 'google-places-proxy/.npmrc', text => text + '\nengine-strict=false\n', /engine-strict=true/],
    ['disabled exact saving', '.npmrc', text => text + '\nsave-exact=false\n', /save-exact=true/],
    ['missing manifest fields', 'google-places-proxy/package.json', () => '{}', /engines.node/]
  ];
  for (const [name, file, mutate, expected] of scenarios) {
    await t.test(name, async () => {
      await writeFile(path.join(fixture, file), mutate(originals.get(file)));
      try {
        assert.match((await checkToolchain(fixture)).join('\n'), expected);
      } finally {
        await writeFile(path.join(fixture, file), originals.get(file));
      }
    });
  }
});
