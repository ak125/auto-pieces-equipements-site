import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { publicFiles } from '../scripts/site-config.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));

test('publication scripts use their repository and preserve an unrelated working directory', (t) => {
  const fixture = mkdtempSync(path.join(tmpdir(), 'auto-pieces-publication-'));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const project = path.join(fixture, 'project');
  const unrelated = path.join(fixture, 'unrelated');
  const scripts = ['site-config.mjs', 'catalog-content.mjs', 'render-catalog-pages.mjs', 'build-static.mjs', 'validate-site.mjs'];
  for (const file of [...publicFiles, ...scripts.map(file => `scripts/${file}`)]) {
    const target = path.join(project, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(repository, file), target);
  }
  execFileSync('git', ['init', '--quiet', '--template='], { cwd: project });
  execFileSync('git', ['-c', 'core.autocrlf=false', 'add', '.'], { cwd: project });

  const run = (script, cwd) => {
    const result = spawnSync(process.execPath, [path.join(project, 'scripts', script)], {
      cwd, encoding: 'utf8', timeout: 15_000
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  };
  run('render-catalog-pages.mjs', project);
  const expected = new Map(publicFiles.map(file => [file, readFileSync(path.join(project, file))]));
  mkdirSync(path.join(unrelated, 'dist'), { recursive: true });
  writeFileSync(path.join(unrelated, 'dist', 'keep.txt'), 'unrelated build');
  const catalogPage = 'pieces-auto-les-pavillons-sous-bois.html';
  writeFileSync(path.join(unrelated, catalogPage), 'unrelated page');
  writeFileSync(path.join(project, catalogPage), 'page to regenerate');
  mkdirSync(path.join(project, 'dist'));
  writeFileSync(path.join(project, 'dist', 'stale.txt'), 'stale artifact');

  run('render-catalog-pages.mjs', unrelated);
  run('build-static.mjs', unrelated);
  run('validate-site.mjs', unrelated);

  for (const [file, content] of expected) {
    assert.deepEqual(readFileSync(path.join(project, 'dist', file)), content, file);
  }
  assert.ok(!readdirSync(path.join(project, 'dist')).includes('stale.txt'));
  assert.equal(readFileSync(path.join(unrelated, 'dist', 'keep.txt'), 'utf8'), 'unrelated build');
  assert.equal(readFileSync(path.join(unrelated, catalogPage), 'utf8'), 'unrelated page');
  assert.deepEqual(readdirSync(unrelated).sort(), ['dist', catalogPage].sort());
});
