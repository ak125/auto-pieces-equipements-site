import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');

// Minimal browser ports: real script, bubbling events, attributes and focus.
// These tests assert user-visible state, without prescribing listener placement.
function page({ withMenu = true } = {}) {
  let document;
  function element(tagName, parentNode = null) {
    const listeners = new Map();
    const attributes = new Map();
    const classes = new Set();
    return {
      tagName, parentNode,
      getAttribute: (name) => attributes.get(name) ?? null,
      setAttribute: (name, value) => attributes.set(name, String(value)),
      classList: {
        contains: (name) => classes.has(name),
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
        toggle(name, force = !classes.has(name)) {
          force ? classes.add(name) : classes.delete(name);
          return force;
        }
      },
      addEventListener(name, callback) {
        if (!listeners.has(name)) listeners.set(name, []);
        listeners.get(name).push(callback);
      },
      contains(node) {
        for (; node; node = node.parentNode) if (node === this) return true;
        return false;
      },
      closest(selector) {
        for (let node = this; node; node = node.parentNode) {
          if (node.tagName.toLowerCase() === selector) return node;
        }
        return null;
      },
      focus() { document.activeElement = this; },
      emit(type, properties = {}) {
        const event = {
          type, target: this, defaultPrevented: false, cancelBubble: false,
          preventDefault() { this.defaultPrevented = true; },
          stopPropagation() { this.cancelBubble = true; },
          ...properties
        };
        for (let node = this; node; node = node.parentNode) {
          event.currentTarget = node;
          node.deliver(event);
          if (event.cancelBubble) break;
        }
        return event;
      },
      deliver(event) {
        for (const callback of listeners.get(event.type) || []) callback(event);
      }
    };
  }
  const window = element('WINDOW');
  document = element('DOCUMENT', window);
  const body = element('BODY', document);
  const button = element('BUTTON', body);
  const navigation = element('NAV', body);
  const link = element('A', navigation);
  const label = element('SPAN', link);
  const outside = element('INPUT', body);
  button.setAttribute('aria-expanded', 'false');
  document.activeElement = body;
  document.querySelector = (selector) => withMenu
    ? ({ '[data-menu-button]': button, '[data-mobile-nav]': navigation }[selector] ?? null)
    : null;
  document.querySelectorAll = () => [];
  vm.runInNewContext(source, { document, window, Date, Intl }, { filename: 'assets/site.js' });
  return { document, button, navigation, link, label, outside };
}

function assertOpen(page, expected) {
  assert.equal(page.button.getAttribute('aria-expanded'), String(expected));
  assert.equal(page.navigation.classList.contains('is-open'), expected);
}

test('menu button still opens and closes navigation', () => {
  const p = page();
  assertOpen(p, false);
  p.button.emit('click');
  assertOpen(p, true);
  p.button.emit('click');
  assertOpen(p, false);
});

test('clicking a descendant of a navigation link still closes the menu', () => {
  const p = page();
  p.button.emit('click');
  p.label.emit('click');
  assertOpen(p, false);
});

test('Escape from a navigation link closes the menu and restores button focus', () => {
  const p = page();
  p.button.emit('click');
  p.link.focus();
  p.link.emit('keydown', { key: 'Escape' });
  assertOpen(p, false);
  assert.equal(p.document.activeElement, p.button);
});

test('Escape on the controlling button closes an open menu', () => {
  const p = page();
  p.button.focus();
  p.button.emit('click');
  p.button.emit('keydown', { key: 'Escape' });
  assertOpen(p, false);
  assert.equal(p.document.activeElement, p.button);
});

test('Tab and other keys keep their ordinary behavior inside the menu', () => {
  const p = page();
  p.button.emit('click');
  p.link.focus();
  for (const key of ['Tab', 'ArrowDown', 'a']) {
    const event = p.link.emit('keydown', { key });
    assertOpen(p, true);
    assert.equal(event.defaultPrevented, false);
    assert.equal(p.document.activeElement, p.link);
  }
});

test('Escape outside navigation does not interfere with another control', () => {
  const p = page();
  p.button.emit('click');
  p.outside.focus();
  const event = p.outside.emit('keydown', { key: 'Escape' });
  assertOpen(p, true);
  assert.equal(event.defaultPrevented, false);
  assert.equal(p.document.activeElement, p.outside);
});

test('Escape on a closed menu does not consume the key or move focus', () => {
  const p = page();
  p.button.focus();
  const event = p.button.emit('keydown', { key: 'Escape' });
  assertOpen(p, false);
  assert.equal(event.defaultPrevented, false);
  assert.equal(p.document.activeElement, p.button);
});

test('pages without mobile navigation initialize without errors', () => {
  assert.doesNotThrow(() => page({ withMenu: false }));
});
