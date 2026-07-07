import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const useDist = process.argv.includes('--dist');
const root = path.resolve(here, useDist ? 'dist' : '.');
const port = Number(process.env.PORT || 5173);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function safePath(urlPath) {
  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const resolved = path.resolve(root, `.${requested}`);
  return resolved.startsWith(root) ? resolved : null;
}

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname);
    let filePath = safePath(pathname);
    if (!filePath) return response.writeHead(403).end('Forbidden');
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      if (!path.extname(pathname)) filePath = path.join(root, 'index.html');
    }
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Cache-Control': useDist ? 'public, max-age=300' : 'no-store',
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream'
    });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`Not found\n${error instanceof Error ? error.message : ''}`);
  }
});

server.listen(port, '0.0.0.0', () => console.log(`LUMINA is available at http://localhost:${port}`));
