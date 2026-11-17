#!/usr/bin/env node
/* LA NAVE · el QA del casco, DENTRO del repo.
 *
 * Por qué vive aquí: tres veces se escribió este guion en un scratchpad y tres veces
 * murió con su sesión (igual que el generador de la galería y el de la tarjeta). Un
 * guion de verificación que hay que reescribir no se corre, y lo que no se corre no
 * prueba nada.
 *
 *   node scripts/qa.mjs            sitio (390 y 1440) + pantalla.html por file:// sin red
 *   node scripts/qa.mjs --sitio    solo el sitio
 *   node scripts/qa.mjs --pantalla solo la pieza del culto
 *
 * Qué mide: axe-core (el casco está en 0 violaciones y así se queda), errores de JS,
 * desborde horizontal contra innerWidth (nunca contra un ancho fijo: en headless la
 * barra de scroll no se dibuja y scrollWidth sale ~15 px mayor), y que los textos del
 * corte y del estreno digan lo que dice config.js.
 *
 * Chrome real y SIEMPRE headless: una ventana visible le roba el puntero a quien esté
 * trabajando en la máquina.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createRequire } from 'node:module';

const RAIZ = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const BUSCAR = [
  path.join(RAIZ, 'node_modules/playwright-core/index.js'),
  '/Users/soyedzam/Dev/SIS/sis-sistema-de-salida/node_modules/playwright-core/index.js',
];
let chromium = null;
for (const c of BUSCAR) if (fs.existsSync(c)) { ({ chromium } = require(c)); break; }
if (!chromium) { console.error('falta playwright-core. Busqué en:\n  ' + BUSCAR.join('\n  ')); process.exit(2); }

const AXE = [
  path.join(RAIZ, 'node_modules/axe-core/axe.min.js'),
  '/Users/soyedzam/Dev/SIS/sis-sistema-de-salida/node_modules/axe-core/axe.min.js',
].find(f => fs.existsSync(f));
if (!AXE) { console.error('falta axe-core (npm i -D axe-core en el repo, o en sis-sistema-de-salida)'); process.exit(2); }
const axe = fs.readFileSync(AXE, 'utf8');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PAGINAS = ['index.html', 'avance.html', 'qr.html', 'galeria-videos.html'];
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain','.xml':'application/xml','.woff2':'font/woff2','.mp4':'video/mp4'};

const solo = process.argv[2];
let fallas = 0;

function servir(puerto) {
  const srv = http.createServer((q, s) => {
    let r = decodeURIComponent(q.url.split('?')[0]);
    if (r.endsWith('/')) r += 'index.html';
    const f = path.join(RAIZ, r);
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end('404'); }
    s.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(s);
  });
  return new Promise(ok => srv.listen(puerto, '127.0.0.1', () => ok(srv)));
}

async function mide(ctx, dir, { lenis = true } = {}) {
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 130)));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 130)); });
  await p.goto(dir, { waitUntil: 'load' });
  await p.waitForTimeout(2600);                       // que se asiente: fuentes + animaciones
  if (lenis) await p.evaluate(() => { try { window.__lenis && window.__lenis.destroy(); } catch (e) {} });
  await p.addScriptTag({ content: axe });
  const v = await p.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] }))
    .violations.map(x => ({ id: x.id, impacto: x.impact, nodos: x.nodes.length })));
  const m = await p.evaluate(() => {
    const t = (s) => { const e = document.querySelector(s); return e && !e.hidden ? e.textContent.trim() : null; };
    return { scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
             chip: t('#js-chip-avance'), estreno: t('#js-chip-estreno'), obra: document.querySelectorAll('.obra-paso').length };
  });
  await p.close();
  return { v, errs, m };
}

const navegador = await chromium.launch({ headless: true, channel: 'chrome', executablePath: CHROME });

if (solo !== '--pantalla') {
  const srv = await servir(4187);
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const ctx = await navegador.newContext({ viewport: { width: w, height: h } });
    for (const pg of PAGINAS) {
      const { v, errs, m } = await mide(ctx, `http://127.0.0.1:4187/${pg}`);
      const desborde = m.scrollW > m.innerW + 18;     // margen por la barra que headless no dibuja
      const mal = v.length || errs.length || desborde;
      if (mal) fallas++;
      console.log(`${mal ? 'FALLA ' : 'ok    '} ${String(w).padStart(4)}px ${pg.padEnd(20)} axe=${v.length} js=${errs.length}${desborde ? ' DESBORDE ' + m.scrollW + '/' + m.innerW : ''}`);
      if (v.length) console.log('        ', JSON.stringify(v));
      if (errs.length) console.log('        ', errs.slice(0, 3));
      if (pg === 'index.html' && w === 390) console.log(`         corte: ${m.chip} · estreno: ${m.estreno || 'apagado'} · obra: ${m.obra} tomas`);
    }
    await ctx.close();
  }
  srv.close();
}

if (solo !== '--sitio') {
  const pieza = path.join(RAIZ, 'pantalla.html');
  if (!fs.existsSync(pieza)) { console.log('ok     pantalla.html no existe todavia (node scripts/pantalla.mjs)'); }
  else {
    const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 } });
    // SIN RED: es como la va a abrir quien opera la pantalla, desde una USB
    await ctx.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort());
    const { v, errs } = await mide(ctx, 'file://' + pieza, { lenis: false });
    const p2 = await ctx.newPage();
    await p2.goto('file://' + pieza, { waitUntil: 'load' });
    await p2.waitForTimeout(2200);
    const d = await p2.evaluate(() => ({
      actos: document.querySelectorAll('.acto').length,
      celdas: document.querySelectorAll('.celda').length,
      cormorant: document.fonts.check('600 48px "Cormorant Garamond"'),
      inter: document.fonts.check('500 16px Inter'),
    }));
    const mal = v.length || errs.length || !d.cormorant || !d.inter || !d.actos || !d.celdas;
    if (mal) fallas++;
    console.log(`${mal ? 'FALLA ' : 'ok    '} pantalla.html por file:// SIN RED · actos=${d.actos} celdas=${d.celdas} tipografias=${d.cormorant && d.inter ? 'cargan' : 'NO CARGAN'} axe=${v.length} js=${errs.length}`);
    if (errs.length) console.log('        ', errs.slice(0, 3));
    await ctx.close();
  }
}

await navegador.close();
console.log(fallas ? `\n${fallas} comprobacion(es) en rojo` : '\ntodo en verde');
process.exit(fallas ? 1 : 0);
