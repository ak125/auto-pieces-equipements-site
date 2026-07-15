import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { publicFiles } from './site-config.mjs';

const root = process.cwd();
const outputDirectory = path.join(root, 'dist');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of publicFiles) {
  const source = path.join(root, file);
  const destination = path.join(outputDirectory, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

console.log(`Build statique terminé : ${publicFiles.length} fichiers autorisés dans dist/.`);
