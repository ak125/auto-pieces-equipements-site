import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const forbiddenName = ['ax', 'ios'].join('');
const forbiddenPattern = new RegExp(`\\b${forbiddenName}\\b`, 'i');
const ignoredDirectories = new Set([
  '.git', 'node_modules', 'tmp', 'temp', 'dist', 'build', 'coverage',
  '.wrangler', '.cache', '.vite'
]);
const sourceExtension = /\.(?:[cm]?[jt]sx?|html?|ya?ml)$/i;

/** @param {string} root */
export async function checkHttpPolicy(root) {
  /** @type {string[]} */
  const failures = [];
  /** @param {string} directory */
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) await visit(fullPath);
      } else if (entry.isFile() && (
        sourceExtension.test(entry.name) ||
        ['package.json', 'package-lock.json', 'npm-shrinkwrap.json'].includes(entry.name)
      )) {
        const content = await readFile(fullPath, 'utf8');
        if (forbiddenPattern.test(content)) {
          failures.push(`${path.relative(root, fullPath)}: ${forbiddenName} interdit ; utiliser fetch natif.`);
        }
      }
    }
  }
  await visit(root);
  return failures;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const failures = await checkHttpPolicy(process.cwd());
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Politique HTTP respectée : fetch natif, dépendance interdite absente.');
  }
}
