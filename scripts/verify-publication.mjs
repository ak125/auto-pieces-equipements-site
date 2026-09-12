import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout } from 'node:timers/promises';
import { publicFiles } from './site-config.mjs';

/** @param {Uint8Array} bytes */
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const privateFiles = ['package.json', 'server-simple.js', '.env', 'google-places-proxy/package.json'];
/** @typedef {{file: string, expectedStatus: number, expectedHash?: string}} Target */
/** @typedef {Target & {status: number, match: boolean, actualHash?: string, error?: string}} Result */

/**
 * Read-only verification against the artifact from the same deployment.
 * @param {{artifactDirectory: string, baseUrl: string, files?: string[], attempts?: number,
 * delayMs?: number, timeoutMs?: number, fetchImpl?: typeof fetch,
 * onAttempt?: (attempt: number, results: Result[]) => void}} options
 */
export async function verifyPublication({ artifactDirectory, baseUrl, files = publicFiles, attempts = 6,
  delayMs = 15_000, timeoutMs = 8_000, fetchImpl = fetch, onAttempt = () => {} }) {
  const base = new URL(baseUrl);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('URL de publication invalide.');
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 6 || !Number.isFinite(delayMs) || delayMs < 0 || delayMs > 15_000 ||
    !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 8_000) throw new Error('Limites de vérification invalides.');
  /** @type {Target[]} */
  const targets = [];
  for (const file of files) {
    targets.push({ file, expectedStatus: 200, expectedHash: sha(await readFile(path.join(artifactDirectory, file))) });
  }
  targets.push(...privateFiles.map(file => ({ file, expectedStatus: 404 })));
  /** @type {Result[]} */
  let results = [];
  for (let attempt = 1; attempt <= attempts; attempt++) {
    results = [];
    for (let offset = 0; offset < targets.length; offset += 5) {
      results.push(...await Promise.all(targets.slice(offset, offset + 5).map(async target => {
        try {
          const url = new URL(target.file === 'index.html' ? './' : target.file, base);
          const response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
          if (response.status !== target.expectedStatus || target.expectedStatus === 404) {
            await response.body?.cancel();
            return { ...target, status: response.status, match: response.status === target.expectedStatus };
          }
          const actualHash = sha(new Uint8Array(await response.arrayBuffer()));
          return { ...target, status: response.status, actualHash, match: actualHash === target.expectedHash };
        } catch (error) {
          return { ...target, status: 0, match: false, error: error instanceof Error ? error.name : 'UnknownError' };
        }
      })));
    }
    onAttempt(attempt, results);
    if (results.every(result => result.match)) return { success: true, attempts: attempt, results };
    if (attempt < attempts) await setTimeout(delayMs);
  }
  return { success: false, attempts, results };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  try {
    const report = await verifyPublication({
      artifactDirectory: path.resolve(process.argv[2] ?? path.join(root, 'dist')),
      baseUrl: process.argv[3] ?? 'https://auto-pieces-equipements.fr/',
      onAttempt: (attempt, results) => console.log(`Vérification ${attempt}/6 : ${results.filter(result => result.match).length}/${results.length} contrôles conformes.`)
    });
    await mkdir(path.join(root, 'tmp/evidence'), { recursive: true });
    await writeFile(path.join(root, 'tmp/evidence/publication-verification.json'), JSON.stringify({
      checkedAt: new Date().toISOString(), commit: process.env.GITHUB_SHA ?? null, ...report
    }, null, 2) + '\n');
    for (const result of report.results.filter(result => !result.match)) console.error(`${result.file} : HTTP ${result.status}, contenu ou statut inattendu${result.error ? ` (${result.error})` : ''}.`);
    if (!report.success) process.exitCode = 1;
  } catch (error) {
    console.error(`Vérification impossible : ${error instanceof Error ? error.message : 'erreur inconnue'}`);
    process.exitCode = 1;
  }
}
