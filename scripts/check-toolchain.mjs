import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** @param {unknown} value @returns {Record<string, unknown>} */
function record(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? /** @type {Record<string, unknown>} */ (value) : {};
}

/** @param {unknown} value */
function string(value) {
  return typeof value === 'string' ? value : '';
}

/** @param {string} root @returns {Promise<string[]>} */
export async function checkToolchain(root) {
  const nodeVersion = (await readFile(path.join(root, '.nvmrc'), 'utf8')).trim();
  /** @type {unknown} */
  const siteJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  /** @type {unknown} */
  const workerJson = JSON.parse(await readFile(path.join(root, 'google-places-proxy/package.json'), 'utf8'));
  const site = record(siteJson);
  const worker = record(workerJson);
  /** @type {string[]} */
  const failures = [];
  const exactVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  const packageManager = string(site.packageManager);
  const npmVersion = packageManager.startsWith('npm@') ? packageManager.slice(4) : '';
  if (!exactVersion.test(nodeVersion)) failures.push('.nvmrc : version Node stable exacte requise.');
  if (!exactVersion.test(npmVersion)) failures.push('package.json : packageManager doit fixer une version npm stable exacte.');
  if (failures.length) return failures;

  const nodeMajor = Number(nodeVersion.split('.')[0]);
  const npmMajor = Number(npmVersion.split('.')[0]);
  const typescript = string(record(site.devDependencies).typescript);
  if (!exactVersion.test(typescript)) failures.push('package.json : TypeScript doit avoir une version stable exacte.');
  const nodeTypes = string(record(site.devDependencies)['@types/node']);
  if (!exactVersion.test(nodeTypes) || Number(nodeTypes.split('.')[0]) !== nodeMajor) {
    failures.push('package.json : @types/node doit être épinglé à la majeure de .nvmrc.');
  }

  for (const [directory, manifest] of /** @type {[string, Record<string, unknown>][]} */ ([['', site], ['google-places-proxy', worker]])) {
    const label = path.join(directory, 'package.json');
    if (manifest.packageManager !== packageManager) failures.push(`${label} : packageManager doit être aligné sur le site.`);
    const engines = record(manifest.engines);
    if (engines.node !== `>=${nodeVersion} <${nodeMajor + 1}`) failures.push(`${label} : engines.node doit suivre .nvmrc et borner la majeure.`);
    if (engines.npm !== `>=${npmVersion} <${npmMajor + 1}`) failures.push(`${label} : engines.npm doit suivre packageManager et borner la majeure.`);
    if (record(manifest.devDependencies).typescript !== typescript) failures.push(`${label} : TypeScript doit être aligné sur le site.`);

    const npmrc = await readFile(path.join(root, directory, '.npmrc'), 'utf8');
    // The last declaration wins, as in an npm ini configuration.
    const settings = new Map(npmrc.split(/\r?\n/).flatMap(line => {
      const match = /^\s*(engine-strict|save-exact)\s*=\s*(.*?)\s*$/.exec(line);
      return match?.[1] && match[2] !== undefined ? [[match[1], match[2]]] : [];
    }));
    for (const key of ['engine-strict', 'save-exact']) {
      if (settings.get(key) !== 'true') failures.push(`${path.join(directory, '.npmrc')} : ${key}=true requis.`);
    }
  }
  return failures;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const failures = await checkToolchain(fileURLToPath(new URL('../', import.meta.url)));
    if (failures.length) {
      console.error(failures.join('\n'));
      process.exitCode = 1;
    } else {
      console.log('Socle aligné : Node, npm, TypeScript et types Node cohérents entre site et Worker.');
    }
  } catch (error) {
    console.error(`Contrôle du socle impossible : ${error instanceof Error ? error.message : 'erreur inconnue'}`);
    process.exitCode = 1;
  }
}
