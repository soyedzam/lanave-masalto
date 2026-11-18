#!/usr/bin/env node
/* LA NAVE · capturas del casco a 390 px, para enseñarlas.
 *
 * Por qué vive aquí y no en un scratchpad: es la cuarta vez que un guion de apoyo se
 * escribe fuera del repo y se pierde con la sesión.
 *
 *   node scripts/capturas.mjs [carpeta de salida]
 *
 * Saca el hero, la línea de tiempo y la sección de obra, a 390 px y 2x, con la cabecera
 * y la barra flotante ocultas para que no tapen. Chrome real, SIEMPRE headless.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createRequire } from 'node:module';

const RAIZ = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const CAND = [path.join(RAIZ, 'node_modules/playwright-core/index.js'),
              '/Users/soyedzam/Dev/SIS/sis-sistema-de-salida/node_modules/playwright-core/index.js'];
let chromium = null;
for (const c of CAND) if (fs.existsSync(c)) { ({ chromium } = require(c)); break; }
if (!chromium) { console.error('falta playwright-core'); process.exit(2); }

const SALIDA = path.resolve(process.argv[2] || path.join(RAIZ, '_ENTREGA-GALERIA/capturas'));
fs.mkdirSync(SALIDA, { recursive: true });
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain','.xml':'application/xml','.woff2':'font/woff2','.mp4':'video/mp4'};
const srv = http.createServer((q, s) => {
  let r = decodeURIComponent(q.url.split('?')[0]);
  if (r.endsWith('/')) r += 'index.html';
  const f = path.join(RAIZ, r);
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end('404'); }
  s.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(s);
});
await new Promise(ok => srv.listen(4192, '127.0.0.1', ok));

const b = await chromium.launch({ headless: true, channel: 'chrome',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto('http://127.0.0.1:4192/index.html', { waitUntil: 'load' });
await p.waitForTimeout(3200);
await p.evaluate(() => { try { window.__lenis && window.__lenis.destroy(); } catch (e) {} });
await p.evaluate(() => {
  ['.site-header', '.zarpe', '.progreso'].forEach((s) => {
    const e = document.querySelector(s); if (e) e.style.opacity = '0';
  });
});
const TOMAS = [['', '1-hero'], ['.historia', '2-linea-de-tiempo'], ['#evidencia', '3-la-obra']];
for (const [sel, nombre] of TOMAS) {
  if (sel) {
    const el = await p.$(sel);
    if (!el) { console.log(`no encontre ${sel}`); continue; }
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(1500);
  }
  const salida = path.join(SALIDA, `${nombre}.png`);
  await p.screenshot({ path: salida });
  console.log(salida);
}
await b.close(); srv.close();
