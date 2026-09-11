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
  for (const file of [...publicFiles, 'scripts/site-config.mjs', 'scripts/validate-site.mjs']) {
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
    ['missing title', 'index.html', /<title>[^<]+<\/title>/, '', /index\.html: titre manquant/],
    ['missing canonical', 'index.html', /<link rel="canonical"[^>]+>/, '', /index\.html: URL canonique manquante/],
    ['invalid structured data', 'index.html', /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, '$1{invalid}$2', /index\.html: JSON-LD invalide/],
    ['unapproved price', 'index.html', /<\/body>/, '<p>123 €</p></body>', /index\.html: prix non validé/],
    ['missing legal noindex', 'mentions-legales.html', /<meta name="robots" content="noindex,follow">/, '', /mentions-legales\.html: protection noindex manquante/],
    ['missing sitemap home', 'sitemap.xml', /<loc>https:\/\/auto-pieces-equipements\.fr\/<\/loc>/, '', /sitemap\.xml: URL manquante/]
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
});
