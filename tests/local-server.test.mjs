import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { publicFiles } from '../scripts/site-config.mjs';

const root = new URL('../', import.meta.url);

for (const [entry, hiddenParent] of [['server-simple.js', false], ['server.js', false], ['server/server.js', false], ['server-simple.js', true]]) {
  test(`${entry}${hiddenParent ? ' under a hidden parent' : ''} starts outside the repository and exposes only public routes`, async (t) => {
    let serverRoot = root;
    if (hiddenParent) {
      const temporaryRoot = fileURLToPath(new URL('../tmp/', import.meta.url));
      await mkdir(temporaryRoot, { recursive: true });
      const fixture = await mkdtemp(path.join(temporaryRoot, '.local-server-'));
      t.after(async () => {
        assert.equal(path.dirname(fixture), path.resolve(temporaryRoot));
        await rm(fixture, { recursive: true, force: true });
      });
      const files = [...publicFiles, 'server-simple.js', 'scripts/site-config.mjs', 'server/google-places.cjs', 'server/reviews-test.html', 'server/reviews-test.js'];
      for (const file of files) {
        const target = path.join(fixture, file);
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(new URL(file, root), target);
      }
      serverRoot = new URL(`./${path.basename(fixture)}/`, new URL('../tmp/', import.meta.url));
    }
    const child = spawn(process.execPath, [fileURLToPath(new URL(entry, serverRoot))], {
      cwd: tmpdir(), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: '0', HOST: '', GOOGLE_MAPS_API_KEY: '', GOOGLE_PLACE_ID: '' }
    });
    t.after(async () => {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = new Promise(resolve => child.once('exit', resolve));
        child.kill();
        await exited;
      }
    });
    const base = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`Server did not start: ${output}`)), 10_000);
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited ${code}: ${output}`)); });
      child.stderr.on('data', data => { output += data; });
      child.stdout.on('data', data => {
        output += data;
        const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
        if (match) { clearTimeout(timer); resolve(match[0]); }
      });
    });
    for (const file of publicFiles) {
      const response = await fetch(`${base}/${file}`);
      assert.equal(response.status, 200, file);
      assert.equal(response.headers.get('x-powered-by'), null);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(new URL(file, root)), file);
    }
    assert.equal((await fetch(base)).status, 200);
    const head = await fetch(base, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const pathname of [
      '/package.json', '/package-lock.json', '/server-simple.js', '/.env', '/.git/config',
      '/node_modules/express/package.json', '/docs/archives/prototype-mcp.md',
      '/tmp/evidence/fetch-site-audit.json', '/server/reviews-test.html', '/server/reviews-test.js',
      '/%2e%2e%2fpackage.json', '/assets%2f..%2fpackage.json', '/INDEX.HTML'
    ]) {
      const response = await fetch(base + pathname);
      assert.equal(response.status, 404, pathname);
      assert.equal(await response.text(), 'Page introuvable');
    }
    assert.equal((await fetch(`${base}/%ZZ`)).status, 400);
    assert.equal((await fetch(base, { method: 'POST' })).status, 404);
    assert.equal((await fetch(`${base}/test`)).status, 200);
    const script = await fetch(`${base}/test/reviews.js`);
    assert.equal(script.status, 200);
    assert.match(script.headers.get('content-type'), /javascript/);
    const api = await fetch(`${base}/api/google-reviews`);
    assert.equal(api.status, 500);
    assert.equal((await api.json()).error, 'Configuration manquante');
    assert.equal((await fetch(`${base}/api/obd-diagnostic`, { method: 'POST' })).status, 404);
  });
}
