import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { fetchPlaceDetails } = require('../server/google-places.cjs');
const nativeFetch = globalThis.fetch;

test('native fetch encodes Google parameters and decodes its JSON payload', async (t) => {
  const expected = { status: 'OK', result: { name: 'Pièces & Équipement' } };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.origin, 'https://maps.googleapis.com');
    assert.equal(url.pathname, '/maps/api/place/details/json');
    assert.equal(url.searchParams.get('place_id'), 'place & +/é');
    assert.equal(url.searchParams.get('key'), 'test-key');
    assert.equal(url.searchParams.get('language'), 'fr');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(expected);
  });
  assert.deepEqual(await fetchPlaceDetails({ place_id: 'place & +/é', key: 'test-key', language: 'fr' }), expected);
});

test('HTTP failure rejects without exposing the request URL or key', async (t) => {
  const response = new Response('upstream unavailable', { status: 503 });
  t.mock.method(globalThis, 'fetch', async () => response);
  await assert.rejects(fetchPlaceDetails({ key: 'private-test-key' }), { message: 'Google Places HTTP 503' });
  assert.equal(response.bodyUsed, true);
});

test('invalid JSON and network errors reject instead of returning success', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('invalid JSON'));
  await assert.rejects(fetchPlaceDetails({}), SyntaxError);
  mock.mock.mockImplementation(async () => { throw new TypeError('fetch failed'); });
  await assert.rejects(fetchPlaceDetails({}), { message: 'fetch failed' });
});

test('timeout aborts a stalled JSON body after headers arrive', async (t) => {
  const upstream = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.write('{');
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  t.after(() => { upstream.closeAllConnections(); upstream.close(); });
  t.mock.method(globalThis, 'fetch', async (_url, options) =>
    nativeFetch(`http://127.0.0.1:${upstream.address().port}`, options));
  await assert.rejects(fetchPlaceDetails({}, { timeoutMs: 100 }), error =>
    error.name === 'TimeoutError' || error.name === 'AbortError');
});

test('active review endpoint preserves success, business-error and HTTP-error responses', async (t) => {
  const previous = { key: process.env.GOOGLE_MAPS_API_KEY, place: process.env.GOOGLE_PLACE_ID };
  process.env.GOOGLE_MAPS_API_KEY = 'test-key';
  process.env.GOOGLE_PLACE_ID = 'test-place';
  const app = require('../server-simple.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => {
    server.closeAllConnections(); server.close();
    for (const [key, value] of [['GOOGLE_MAPS_API_KEY', previous.key], ['GOOGLE_PLACE_ID', previous.place]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  let upstream = Response.json({ status: 'OK', result: {
    name: 'Magasin', rating: 4.5, user_ratings_total: 10, reviews: [],
    formatted_address: 'Adresse', formatted_phone_number: '0100000000'
  } });
  t.mock.method(globalThis, 'fetch', async () => upstream);
  const url = `http://127.0.0.1:${server.address().port}/api/google-reviews`;
  let response = await nativeFetch(url);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, data: {
    name: 'Magasin', rating: 4.5, totalReviews: 10, reviews: [], address: 'Adresse', phone: '0100000000'
  } });
  upstream = Response.json({ status: 'REQUEST_DENIED', error_message: 'Test refusal' });
  response = await nativeFetch(url);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'REQUEST_DENIED');
  upstream = new Response('unavailable', { status: 503 });
  response = await nativeFetch(url);
  assert.equal(response.status, 500);
  assert.equal((await response.json()).details, 'Google Places HTTP 503');
});
