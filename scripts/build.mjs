import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

await rm('dist', { force: true, recursive: true });
await mkdir('dist', { recursive: true });
await Promise.all([
  cp('index.html', 'dist/index.html'),
  cp('styles.css', 'dist/styles.css'),
  cp('src', 'dist/src', { recursive: true }),
  cp('public', 'dist/public', { recursive: true })
]);
await writeFile('dist/build-info.txt', `Built at ${new Date().toISOString()}\n`, 'utf8');
console.log('Built static site in dist/.');
