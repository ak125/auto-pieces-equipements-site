import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPublicReferences } from '../scripts/check-public-references.mjs';

const files = ['index.html', 'catalog/item.html', 'assets/site.js', 'assets/site.css', 'logo.svg'];
const check = (home, catalog = '<main id="fiche"></main>') => checkPublicReferences(new Map([
  ['index.html', home], ['catalog/item.html', catalog]
]), files);

test('published links resolve fragments, relative paths, queries and encoded attributes', () => {
  assert.deepEqual(check(`
    <main id="contact"></main><div id="pièces&amp;prix"></div>
    <a href="#contact">Contact</a><a href="#pi%C3%A8ces&amp;prix">Pièces</a>
    <a href="/catalog/item.html?q=1&amp;other=2#fiche">Fiche</a>
    <a href="https://auto-pieces-equipements.fr/#contact">Accueil</a>
    <a href="//auto-pieces-equipements.fr/catalog/item.html#fiche">Catalogue</a>
    <a href="#top">Haut</a><a href="#:~:text=Contact">Texte</a>
    <script src="/assets/site.js?v=2"></script><link href='/assets/site.css' rel=stylesheet>
    <img src="/logo.svg"><a href="tel:+33148479627">Appeler</a>
    <a href="mailto:contact@example.com">Courriel</a><a href="https://example.com/absent#elsewhere">Externe</a>
  `, '<main id="fiche"></main><a href="../?q=1#contact">Retour</a><script src="../assets/site.js"></script>'), []);
});

test('missing targets are reported on the correct published page', () => {
  const failures = check('<a href="#absent">Contact</a><a href="catalog/item.html#contact">Autre</a>',
    '<main id="fiche"></main><a href="../absent.html">Lien</a><script src="../assets/missing.js"></script>');
  assert.equal(failures.length, 4);
  assert.match(failures[0], /index.html: ancre absente dans index.html/);
  assert.match(failures[1], /ancre absente dans catalog\/item.html/);
  assert.match(failures[2], /catalog\/item.html: href vers un fichier non publié/);
  assert.match(failures[3], /catalog\/item.html: src vers un fichier non publié/);
});

test('comments and raw text cannot create phantom links or anchor targets', () => {
  const html = `<!-- <a href="/absent.html" id="comment"> -->
    <script>const html = '<a href="/absent.html" id="script">';</script>
    <style>/* <a href="/absent.html" id="style"> */</style>
    <textarea><a href="/absent.html" id="textarea"></textarea>
    <a href="#script">Absent</a>`;
  assert.deepEqual(check(html), ['index.html: ancre absente dans index.html (#script)']);
});

test('invalid encoding, duplicate ids and unsupported base URL fail explicitly', () => {
  const failures = check('<div id="contact"></div><div id="contact"></div><base href="/catalog/"><a href="#%zz">Lien</a>');
  assert.equal(failures.length, 4);
  assert.ok(failures.some(value => value.includes('identifiant HTML dupliqué')));
  assert.ok(failures.some(value => value.includes('base href')));
  assert.ok(failures.some(value => value.includes('encodage de référence invalide')));
});

test('HTML entity references and legacy named anchors resolve without false positives', () => {
  assert.deepEqual(check('<a name="référence"></a><a href="#r&#233;f&#xE9;rence">Lien</a>'), []);
});

test('template contents cannot satisfy same-page or cross-page fragment links', () => {
  assert.deepEqual(check(
    '<template><div id="contact"></div></template><a href="#contact">Contact</a><a href="catalog/item.html#fiche">Fiche</a>',
    '<template><template><a name="fiche"></a></template></template>'
  ), [
    'index.html: ancre absente dans index.html (#contact)',
    'index.html: ancre absente dans catalog/item.html (catalog/item.html#fiche)'
  ]);
});

test('template ids belong to their document but nested contents do not', () => {
  assert.deepEqual(check(`
    <template id="modele"><template id="interne"><div id="contact"></div></template></template>
    <div id="contact"></div><a href="#contact">Contact</a><a href="#modele">Modèle</a>
    <a href="#interne">Absent</a>
  `), ['index.html: ancre absente dans index.html (#interne)']);
});

test('inert template references do not create published links or resources', () => {
  assert.deepEqual(check(`
    <template><template><a href="absent.html">Exemple</a></template><img src="absent.svg"></template>
    <div id="contact"></div><a href="#contact">Contact</a>
  `), []);
});
