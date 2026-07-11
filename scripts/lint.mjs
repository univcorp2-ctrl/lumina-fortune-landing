import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const roots = ['src', 'scripts', 'test', 'functions'];
const files = ['server.mjs'];

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(fullPath);
    if (entry.isFile() && /\.(?:js|mjs)$/.test(entry.name)) files.push(fullPath);
  }
}

for (const root of roots) await collect(root);
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr);
    process.exit(result.status || 1);
  }
}

for (const required of ['index.html','purchase.html','success.html','styles.css','.github/workflows/ci.yml']) {
  const content = await readFile(required, 'utf8');
  if (!content.trim()) throw new Error(`${required} is empty`);
}
console.log(`Syntax checked ${files.length} JavaScript files.`);
