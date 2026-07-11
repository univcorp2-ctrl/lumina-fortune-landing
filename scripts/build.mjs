import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

const htmlFiles = [
  'index.html',
  'purchase.html',
  'success.html',
  'cancel.html',
  'commercial.html',
  'privacy.html',
  'terms.html'
];

await rm('dist', { force: true, recursive: true });
await mkdir('dist', { recursive: true });
await Promise.all([
  ...htmlFiles.map((file) => cp(file, `dist/${file}`)),
  cp('styles.css', 'dist/styles.css'),
  cp('src', 'dist/src', { recursive: true }),
  cp('public', 'dist/public', { recursive: true })
]);
await writeFile('dist/build-info.txt', `Built at ${new Date().toISOString()}\n`, 'utf8');
console.log('Built static site in dist/.');
