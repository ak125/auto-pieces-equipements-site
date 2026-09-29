import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { publicFiles } from '../scripts/site-config.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));

test('validation checks the published artifact independently of its source', async (t) => {
  const fixture = mkdtempSync(path.join(tmpdir(), 'auto-pieces-artifact-'));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const copy = (source, destination) => {
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  };
  for (const file of [...publicFiles, 'data/store-hours.json', 'scripts/site-config.mjs', 'scripts/store-hours.mjs', 'scripts/validate-site.mjs', 'scripts/check-public-references.mjs']) {
    copy(path.join(repository, file), path.join(fixture, file));
  }
  // Keep the real tracked-source checks operational in this isolated fixture.
  execFileSync('git', ['init', '--quiet', '--template='], { cwd: fixture });
  execFileSync('git', ['-c', 'core.autocrlf=false', 'add', '.'], { cwd: fixture });
  for (const file of publicFiles) copy(path.join(fixture, file), path.join(fixture, 'dist', file));

  function validate() {
    const result = spawnSync(process.execPath, ['scripts/validate-site.mjs'], {
      cwd: fixture, encoding: 'utf8', timeout: 15_000
    });
    assert.ifError(result.error);
    return result;
  }

  await t.test('unchanged public artifact passes', () => {
    const result = validate();
    assert.equal(result.status, 0, result.stderr);
  });

  const scenarios = [
    ['missing H1', 'index.html', /<h1\b[^>]*>[\s\S]*?<\/h1>/i, '', /index\.html: H1 principal attendu une fois/],
    ['second real H1', 'index.html', /<\/body>/, '<h1>Deuxième titre</h1></body>', /index\.html: H1 principal attendu une fois/],
    ['H1 only in comment', 'index.html', /(<h1\b[^>]*>[\s\S]*?<\/h1>)/i, '<!-- $1 -->', /index\.html: H1 principal attendu une fois/],
    ['H1 only in script', 'index.html', /(<h1\b[^>]*>[\s\S]*?<\/h1>)/i, '<script type="application/json">{"example":"$1"}</script>', /index\.html: H1 principal attendu une fois/],
    ['H1 only in nested template', 'index.html', /(<h1\b[^>]*>[\s\S]*?<\/h1>)/i, '<template><template>$1</template></template>', /index\.html: H1 principal attendu une fois/],
    ['wrong structured address', 'index.html', /"streetAddress": "184 Avenue Aristide Briand"/, '"streetAddress": "185 Avenue Aristide Briand"', /index\.html: identité AutoPartsStore incohérente/],
    ['wrong structured telephone', 'index.html', /"telephone": "\+33148479627"/, '"telephone": "+33148479628"', /index\.html: téléphone AutoPartsStore incohérent/],
    ['duplicate sitemap URL', 'sitemap.xml', /<\/urlset>/, '<url><loc>https://auto-pieces-equipements.fr/</loc></url></urlset>', /sitemap\.xml: URL dupliquée/],
    ...['https://example.com/', 'https://auto-pieces-equipements.fr/admin/', 'https://auto-pieces-equipements.fr/mentions-legales.html', 'https://auto-pieces-equipements.fr/?source=test', 'https://auto-pieces-equipements.fr/#contact'].map(url => [
      'unexpected sitemap URL ' + url, 'sitemap.xml', /<\/urlset>/, `<url><loc>${url}</loc></url></urlset>`, /sitemap\.xml: URL inattendue/
    ]),
    ['malformed sitemap', 'sitemap.xml', /<\/url>/, '', /sitemap\.xml: format non pris en charge/],
    ['mismatched sitemap namespace quotes', 'sitemap.xml', /xmlns="([^"]+)"/, "xmlns=\"$1'", /sitemap\.xml: format non pris en charge/],
    ['mismatched XML version quotes', 'sitemap.xml', /version="1\.0"/, "version=\"1.0'", /sitemap\.xml: format non pris en charge/],
    ['mismatched XML encoding quotes', 'sitemap.xml', /encoding="UTF-8"/, "encoding=\"UTF-8'", /sitemap\.xml: format non pris en charge/],
    ['commercial noindex', 'index.html', /<\/head>/, '<meta name="robots" content="noindex,follow"></head>', /index\.html: directive bloquant l.indexation/],
    ['Googlebot none with reordered attributes', 'index.html', /<\/head>/, "<META CONTENT='NONE' NAME='GoogleBot'></head>", /index\.html: directive bloquant l.indexation/],
    ['encoded noindex in body', 'index.html', /<\/body>/, '<meta content="no&#105;ndex" name=robots></body>', /index\.html: directive bloquant l.indexation/],
    ['canonical with query', 'index.html', /(<link rel="canonical" href="https:\/\/auto-pieces-equipements\.fr\/)"/, '$1?source=test"', /index\.html: canonical différente de l.URL attendue/],
    ['canonical with fragment', 'index.html', /(<link rel="canonical" href="https:\/\/auto-pieces-equipements\.fr\/)"/, '$1#contact"', /index\.html: canonical différente de l.URL attendue/],
    ['duplicate canonical', 'index.html', /<\/head>/, '<link href="https://auto-pieces-equipements.fr/" rel="canonical"></head>', /index\.html: plusieurs liens canonical/],
    ['broken contact anchor', 'index.html', /href="#contact"/, 'href="#contact-inexistant"', /ancre absente dans index\.html/],
    ['contact anchor only inside template', 'index.html', /(<section\b[^>]*\bid=")contact("[^>]*>)/, '$1contact-deplace$2<template><div id="contact"></div></template>', /ancre absente dans index\.html/],
    ['missing absolute internal page', 'index.html', /href="#contact"/, 'href="https://auto-pieces-equipements.fr/absent.html"', /href vers un fichier non publié/],
    ['missing local script', 'index.html', /src="\/assets\/site\.js"/, 'src="/assets/absent.js"', /src vers un fichier non publié/],
    ['duplicate contact target', 'index.html', /<\/body>/, '<div id="contact"></div></body>', /identifiant HTML dupliqué/],
    ['missing title', 'index.html', /<title>[^<]+<\/title>/, '', /index\.html: titre manquant/],
    ['stale opening hours', 'index.html', /9h30–18h30/, '10h00–18h30', /horaires affichés/],
    ['missing canonical', 'index.html', /<link rel="canonical"[^>]+>/, '', /index\.html: URL canonique manquante/],
    ['invalid structured data', 'index.html', /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, '$1{invalid}$2', /index\.html: JSON-LD invalide/],
    ['unapproved price', 'index.html', /<\/body>/, '<p>123 €</p></body>', /index\.html: prix non validé/],
    ['missing legal noindex', 'mentions-legales.html', /<meta name="robots" content="noindex,follow">/, '', /mentions-legales\.html: protection noindex manquante/],
    ['missing sitemap home', 'sitemap.xml', /<url><loc>https:\/\/auto-pieces-equipements\.fr\/<\/loc>[\s\S]*?<\/url>/, '', /sitemap\.xml: URL manquante/]
  ];
  for (const [name, file, pattern, replacement, expected] of scenarios) {
    await t.test(name + ' in dist fails while its source is unchanged', () => {
      const source = readFileSync(path.join(fixture, file), 'utf8');
      const target = path.join(fixture, 'dist', file);
      const original = readFileSync(target, 'utf8');
      const changed = original.replace(pattern, replacement);
      assert.notEqual(changed, original, 'Mutation must affect the fixture');
      try {
        writeFileSync(target, changed);
        const result = validate();
        assert.equal(result.status, 1, result.stdout + result.stderr);
        assert.match(result.stderr, expected);
        assert.equal(readFileSync(path.join(fixture, file), 'utf8'), source);
      } finally {
        writeFileSync(target, original);
      }
    });
  }

  const validChanges = [
    ['paired XML quotes chosen per attribute', 'sitemap.xml', xml => xml.replace('version="1.0"', "version='1.0'").replace(/xmlns="([^"]+)"/, "xmlns='$1'")],
    ['H1 with case and attributes', 'index.html', html => html.replace(/<h1>/, "<H1 class='principal' data-example='a > b'>").replace('</h1>', '</H1>')],
    ['inert H1 examples beside the real title', 'index.html', html => html.replace('</body>', '<!-- <h1>Comment</h1> --><script type="application/json">{"example":"<h1>Script</h1>"}</script><template><template><h1>Nested</h1></template><h1>Template</h1></template></body>')],
    ['national telephone formatting', 'index.html', html => html.replace('"telephone": "+33148479627"', '"telephone": "01 48 47 96 27"')],
    ['international telephone formatting', 'index.html', html => html.replace('"telephone": "+33148479627"', '"telephone": "+33 1 48 47 96 27"')],
    ['sitemap reordered and spaced', 'sitemap.xml', xml => xml.replace(/(<url>[\s\S]*<\/url>)/, [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].reverse().map(match => match[0]).join('\n')).replaceAll('<loc>', '<loc>\n  ').replaceAll('</loc>', '\n</loc>')]
  ];
  for (const [name, file, change] of validChanges) {
    await t.test(name + ' remains valid in dist', () => {
      const target = path.join(fixture, 'dist', file);
      const original = readFileSync(target, 'utf8');
      const changed = change(original);
      assert.notEqual(changed, original);
      try {
        writeFileSync(target, changed);
        const result = validate();
        assert.equal(result.status, 0, result.stdout + result.stderr);
      } finally { writeFileSync(target, original); }
    });
  }

  await t.test('canonical swaps between two published pages fail despite unique URLs', () => {
    const pages = ['index.html', 'livraison-pieces-auto-93.html'];
    const originals = pages.map(file => readFileSync(path.join(fixture, 'dist', file), 'utf8'));
    const urls = originals.map(html => html.match(/<link rel="canonical" href="([^"]+)"/)[1]);
    try {
      pages.forEach((file, i) => {
        writeFileSync(path.join(fixture, 'dist', file),
          originals[i].replace('href="' + urls[i] + '"', 'href="' + urls[1 - i] + '"'));
      });
      const result = validate();
      assert.equal(result.status, 1, result.stdout + result.stderr);
      for (const file of pages) assert.ok(result.stderr.includes(file + ': canonical différente'));
    } finally {
      pages.forEach((file, i) => writeFileSync(path.join(fixture, 'dist', file), originals[i]));
    }
  });

  await t.test('inert examples and non-blocking directives do not prevent publication', () => {
    const target = path.join(fixture, 'dist', 'index.html');
    const original = readFileSync(target, 'utf8');
    try {
      writeFileSync(target, original
        .replace(/<link rel="canonical" href="([^"]+)">/, "<link href='$1' rel='CANONICAL'>")
        .replace('</head>', `
        <!-- <meta name="robots" content="noindex"><link rel="canonical" href="https://example.com/"> -->
        <script type="application/json">{"example":"<meta name='robots' content='none'>"}</script>
        <meta name="robots" content="index,follow,max-image-preview: none">
        <meta name="googlebot" content="nosnippet">
        </head>`));
      const result = validate();
      assert.equal(result.status, 0, result.stdout + result.stderr);
    } finally {
      writeFileSync(target, original);
    }
  });
});
