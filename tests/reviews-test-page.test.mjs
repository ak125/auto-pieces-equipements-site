import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../server/reviews-test.js', import.meta.url), 'utf8');
async function render(fetchResponse, { withContainers = true } = {}) {
  const nodes = [];
  function createElement(tag) {
    const node = {
      tag, children: [], textContent: '', className: '',
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      set innerHTML(value) { throw new Error('HTML insertion is forbidden for review data'); }
    };
    nodes.push(node);
    return node;
  }
  const stats = createElement('div');
  const content = createElement('div');
  content.className = 'loading';
  const document = { createElement, getElementById: id => withContainers ? ({ stats, content })[id] : null };
  await vm.runInNewContext(source, {
    document, URL, AbortSignal,
    fetch: async (url, options) => {
      assert.equal(url, '/api/google-reviews');
      assert.ok(options.signal instanceof AbortSignal);
      return fetchResponse();
    }
  });
  const text = node => [node.textContent, ...node.children.map(text)].join(' ');
  return { stats, content, nodes, text: text(content) };
}

test('review content remains text, unsafe photos are ignored and ratings are bounded', async () => {
  const hostile = '<img src=x onerror=alert(1)>';
  const page = await render(() => Response.json({ success: true, data: {
    name: hostile, address: hostile, phone: hostile, rating: 4.5, totalReviews: 3,
    reviews: [
      { author_name: hostile, text: hostile, relative_time_description: hostile, profile_photo_url: 'javascript:alert(1)', rating: 999 },
      { text: 'Second review', profile_photo_url: 'https://example.com/photo.jpg', rating: -1 },
      { text: 'Third review', profile_photo_url: 'data:image/svg+xml,<svg></svg>', rating: null }
    ]
  } }));
  assert.equal(page.content.className, '');
  assert.ok(page.text.includes(hostile));
  assert.ok(page.text.includes('Les avis Google ont été récupérés.'));
  assert.equal(page.stats.children.length, 3);
  const images = page.nodes.filter(node => node.tag === 'img');
  assert.equal(images.length, 1);
  assert.equal(images[0].src, 'https://example.com/photo.jpg');
  assert.equal(images[0].referrerPolicy, 'no-referrer');
  assert.deepEqual(page.nodes.filter(node => node.className === 'review-rating').map(node => node.textContent), ['⭐⭐⭐⭐⭐', '', '']);
});

test('HTTP errors are shown as text and clear the loading state', async () => {
  const message = '<script>alert(1)</script>';
  const page = await render(() => Response.json({ success: true, error: message }, { status: 502 }));
  assert.equal(page.content.className, '');
  assert.equal(page.content.children[0].className, 'error');
  assert.ok(page.text.includes(message));
  assert.equal(page.stats.children.length, 0);
});

test('empty reviews and timeouts have explicit visible messages', async () => {
  const empty = await render(() => Response.json({ success: true, data: { name: 'Magasin', reviews: [] } }));
  assert.ok(empty.text.includes('Aucun avis disponible.'));
  const timeout = await render(() => { throw new DOMException('Internal detail', 'TimeoutError'); });
  assert.ok(timeout.text.includes('a dépassé le délai prévu'));
  assert.equal(timeout.content.className, '');
  assert.ok(!timeout.text.includes('Internal detail'));
});

test('missing containers skip the request and malformed payloads get a clear error', async () => {
  await render(() => assert.fail('No request expected without the diagnostic containers'), { withContainers: false });
  for (const payload of [null, [], { success: true }, { success: true, data: { reviews: {} } }]) {
    const page = await render(() => Response.json(payload));
    assert.ok(page.text.includes('Réponse des avis invalide'));
    assert.equal(page.content.children[0].className, 'error');
  }
  const page = await render(() => { throw null; });
  assert.ok(page.text.includes('Avis indisponibles'));
});
