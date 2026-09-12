import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verifyPublication } from '../scripts/verify-publication.mjs';

async function fixture(t, handler) {
  const artifactDirectory = await mkdtemp(path.join(tmpdir(), 'auto-pieces-verify-'));
  t.after(() => rm(artifactDirectory, { recursive: true, force: true }));
  await mkdir(path.join(artifactDirectory, 'assets'));
  await writeFile(path.join(artifactDirectory, 'index.html'), '<h1>Published</h1>');
  await writeFile(path.join(artifactDirectory, 'assets/site.js'), 'console.log("published");');
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  return { artifactDirectory, baseUrl: `http://127.0.0.1:${server.address().port}/`, files: ['index.html', 'assets/site.js'], attempts: 1, delayMs: 0 };
}

function serve(req, res) {
  if (req.url === '/') return res.end('<h1>Published</h1>');
  if (req.url === '/assets/site.js') return res.end('console.log("published");');
  res.writeHead(404).end('Not found');
}

test('published bytes and private 404s pass together using native HTTP', async t => {
  const options = await fixture(t, serve);
  const result = await verifyPublication(options);
  assert.equal(result.success, true);
  assert.equal(result.results.length, 6);
  assert.equal(result.attempts, 1);
});

test('an old cached page is retried and the whole publication is checked again', async t => {
  let homeRequests = 0;
  let assetRequests = 0;
  const options = await fixture(t, (req, res) => {
    if (req.url === '/' && ++homeRequests === 1) return res.end('old deployment');
    if (req.url === '/assets/site.js') assetRequests++;
    serve(req, res);
  });
  const result = await verifyPublication({ ...options, attempts: 3 });
  assert.equal(result.success, true);
  assert.equal(result.attempts, 2);
  assert.equal(assetRequests, 2);
});

test('persistent wrong bytes fail despite HTTP 200 and stop at the attempt limit', async t => {
  let requests = 0;
  const options = await fixture(t, (req, res) => {
    if (req.url === '/') { requests++; return res.end('wrong page'); }
    serve(req, res);
  });
  const result = await verifyPublication({ ...options, attempts: 2 });
  assert.equal(result.success, false);
  assert.equal(requests, 2);
  const home = result.results.find(item => item.file === 'index.html');
  assert.equal(home.status, 200);
  assert.equal(home.match, false);
});

test('a missing public file or exposed private path fails verification', async t => {
  const options = await fixture(t, (req, res) => {
    if (req.url === '/assets/site.js') return res.writeHead(404).end('missing');
    if (req.url === '/.env') return res.end('unexpected public resource');
    serve(req, res);
  });
  const result = await verifyPublication(options);
  assert.equal(result.success, false);
  assert.deepEqual(result.results.filter(item => !item.match).map(item => item.file), ['assets/site.js', '.env']);
});

test('timeout covers a body that stalls after HTTP headers', async t => {
  const options = await fixture(t, (req, res) => {
    if (req.url === '/') { res.writeHead(200); res.write('partial'); return; }
    serve(req, res);
  });
  const result = await verifyPublication({ ...options, timeoutMs: 100 });
  assert.equal(result.success, false);
  assert.match(result.results.find(item => item.file === 'index.html').error, /AbortError|TimeoutError/);
});

test('a missing artifact stops before any HTTP request', async t => {
  const options = await fixture(t, serve);
  let requests = 0;
  await assert.rejects(verifyPublication({ ...options, files: ['absent.html'], fetchImpl: async () => { requests++; return new Response(); } }), /ENOENT/);
  assert.equal(requests, 0);
});
