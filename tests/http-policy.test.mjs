import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkHttpPolicy } from '../scripts/check-http-policy.mjs';

const forbidden = ['ax', 'ios'].join('');
const script = fileURLToPath(new URL('../scripts/check-http-policy.mjs', import.meta.url));

test('HTTP policy rejects dependency aliases, transitive locks, source and CDN usage', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'http-policy-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const cases = [
    ['package.json', JSON.stringify({ dependencies: { client: `npm:${forbidden}@1.0.0` } })],
    ['worker/package-lock.json', JSON.stringify({ packages: { [`node_modules/${forbidden}`]: { version: '1.0.0' } } })],
    ['src/client.js', `const client = require('${forbidden}');`],
    ['index.html', `<script src="https://cdn.example/${forbidden}/client.js"></script>`]
  ];
  for (const [file, content] of cases) {
    await t.test(file, async () => {
      const fullPath = path.join(root, file);
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
      const failures = await checkHttpPolicy(root);
      assert.equal(failures.length, 1);
      assert.ok(failures[0].includes(path.normalize(file)));
      const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
      assert.equal(result.status, 1, result.stderr);
      await rm(fullPath);
    });
  }
  await writeFile(path.join(root, 'src/client.js'), 'export const load = () => fetch("/api");');
  await writeFile(path.join(root, 'README.md'), `${forbidden} est interdit.`);
  await mkdir(path.join(root, 'node_modules'), { recursive: true });
  await writeFile(path.join(root, 'node_modules/ignored.js'), forbidden);
  assert.deepEqual(await checkHttpPolicy(root), []);
});
