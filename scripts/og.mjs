#!/usr/bin/env node
/* LA NAVE · la tarjeta que ve WhatsApp al compartir el enlace.
 *
 * Por qué vive aquí: la tarjeta anterior se renderizó desde un scratchpad y el guion
 * murió con su sesión, así que `assets/og.jpg` se quedó con «56 ladrillos» grabados
 * mientras el sitio iba en 84. Una imagen con el corte adentro envejece sola y nadie
 * la ve envejecer: se ve en el teléfono de quien recibe el enlace, no en el sitio.
 *
 * La tarjeta de `scripts/og-card.html` NO lleva número — sólo la meta (250, que no
 * cambia) y la invitación. Así deja de envejecer.
 *
 *   node scripts/og.mjs                    regenera assets/og.jpg
 *   node scripts/og.mjs /ruta/prueba.jpg   la escribe en otro lado (para revisarla antes)
 *
 * Necesita playwright-core y el Chrome real. Lo busca en el repo y, si no, en
 * ~/Dev/SIS/sis-sistema-de-salida/node_modules, que es donde vive en esta máquina.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const RAIZ = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const CANDIDATOS = [
  path.join(RAIZ, 'node_modules/playwright-core/index.js'),
  '/Users/soyedzam/Dev/SIS/sis-sistema-de-salida/node_modules/playwright-core/index.js',
];
const require = createRequire(import.meta.url);
let chromium = null;
for (const c of CANDIDATOS) { if (fs.existsSync(c)) { ({ chromium } = require(c)); break; } }
if (!chromium) {
  console.error('falta playwright-core. Instálalo aquí (npm i -D playwright-core) o revisa:\n  ' + CANDIDATOS.join('\n  '));
  process.exit(2);
}

const SALIDA = process.argv[2] ? path.resolve(process.argv[2]) : path.join(RAIZ, 'assets/og.jpg');
const CARD = path.join(RAIZ, 'scripts/og-card.html');

// headless SIEMPRE: una ventana visible le roba el puntero a quien esté trabajando.
const b = await chromium.launch({ headless: true, channel: 'chrome',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await p.goto('file://' + CARD, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);   // sin esto la tarjeta sale en Georgia
await p.waitForTimeout(600);
await p.screenshot({ path: SALIDA, type: 'jpeg', quality: 88 });
await b.close();

const kb = Math.round(fs.statSync(SALIDA).size / 1024);
console.log(`tarjeta escrita: ${SALIDA} · ${kb} KB · 2400x1260 (1200x630 @2x)`);
console.log('og:image no cambia de nombre, asi que WhatsApp puede servir la vieja de su cache un rato.');
