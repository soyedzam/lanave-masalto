#!/usr/bin/env node
/* LA NAVE · el medidor del corte.
 *
 * Por qué existe: el corte vive en assets/config.js, pero index.html lleva CINCO
 * copias del mismo número escritas a mano (los fallbacks que ve quien entra sin JS,
 * y lo que leen WhatsApp y Google al compartir el enlace). Actualizar config y
 * olvidar una copia deja al sitio diciendo dos números distintos. Esto las mueve
 * todas de una vez, o avisa si ya se separaron.
 *
 *   node scripts/corte.mjs --check          verifica que las cinco coincidan con config
 *   node scripts/corte.mjs 92               aplica el corte 92 con la fecha de hoy
 *   node scripts/corte.mjs 92 2026-11-15    aplica el corte 92 con esa fecha
 *
 * Lo que NO hace: no toca `cierre` (la causa está abierta a propósito), no toca
 * assets/og.jpg (es una imagen; lleva un número grabado y envejece aparte),
 * no commitea y no publica. Eso lo decide una persona.
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const RAIZ = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const CONFIG = path.join(RAIZ, 'assets/config.js');
const INDEX = path.join(RAIZ, 'index.html');

const pesos = (n) => '$' + Number(n).toLocaleString('es-MX');
const leer = (f) => fs.readFileSync(f, 'utf8');

function config(src) {
  const num = (k) => {
    const m = src.match(new RegExp(`\\n\\s*${k}:\\s*(\\d+)`));
    if (!m) throw new Error(`no encuentro ${k} en assets/config.js`);
    return Number(m[1]);
  };
  const fecha = src.match(/\n\s*fechaCorte:\s*"([\d-]+)"/);
  if (!fecha) throw new Error('no encuentro fechaCorte en assets/config.js');
  return { tomados: num('tomados'), meta: num('meta'), precio: num('precio'), fechaCorte: fecha[1] };
}

/* Las cinco superficies escritas a mano. Cada una dice cómo encontrarse y cómo
   debería leerse dado el corte; así el --check y el --write usan la misma verdad. */
function superficies({ tomados, meta, precio }) {
  const pct = Math.round((tomados / meta) * 1000) / 10; // igual que assets/datos.js
  return [
    { nombre: 'og:image:alt',      re: /(<meta property="og:image:alt" content="[^"]*?)\d+ de \d+ ladrillos/, txt: `$1${tomados} de ${meta} ladrillos` },
    { nombre: 'chip del hero',     re: /(id="js-chip-avance">)[^<]*/,                                        txt: `$1${tomados} de ${meta} ladrillos` },
    { nombre: 'texto de la barra', re: /(id="js-progress-text">)[^<]*/,                                      txt: `$1${tomados} de ${meta} ladrillos · ${pct}%` },
    { nombre: 'pesos levantados',  re: /(<strong data-levantado>)[^<]*/,                                     txt: `$1${pesos(tomados * precio)}` },
    { nombre: 'CTA del muro',      re: /(id="js-muro-cta"[^>]*>)[^<]*/,                                      txt: `$1Toma el ladrillo #${tomados + 1}` },
  ];
}

const arg = process.argv[2];
const cfg = config(leer(CONFIG));

if (!arg || arg === '--check') {
  const html = leer(INDEX);
  let sanas = 0;
  console.log(`config: ${cfg.tomados} de ${cfg.meta} ladrillos · corte ${cfg.fechaCorte}`);
  for (const s of superficies(cfg)) {
    const m = html.match(s.re);
    if (!m) { console.log(`  ROTA     ${s.nombre} — el patrón ya no encuentra nada en index.html`); continue; }
    const esperado = m[0].replace(s.re, s.txt);
    if (m[0] === esperado) { sanas++; console.log(`  al día   ${s.nombre}`); }
    else console.log(`  ATRASADA ${s.nombre}\n           dice:    ${m[0].slice(0, 110)}\n           debería: ${esperado.slice(0, 110)}`);
  }
  const total = superficies(cfg).length;
  console.log(sanas === total ? `\nlas ${total} superficies coinciden con config.` : `\n${sanas} de ${total} al día — corre: node scripts/corte.mjs ${cfg.tomados}`);
  process.exit(sanas === total ? 0 : 1);
}

const tomados = Number(arg);
if (!Number.isInteger(tomados) || tomados < 0 || tomados > cfg.meta) {
  console.error(`uso: node scripts/corte.mjs <ladrillos 0-${cfg.meta}> [AAAA-MM-DD]   |   node scripts/corte.mjs --check`);
  process.exit(2);
}
const fecha = process.argv[3] || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Merida' });
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { console.error(`fecha inválida: ${fecha} (se espera AAAA-MM-DD)`); process.exit(2); }

let conf = leer(CONFIG);
conf = conf.replace(/(\n\s*tomados:\s*)\d+/, `$1${tomados}`).replace(/(\n\s*fechaCorte:\s*")[\d-]+/, `$1${fecha}`);
fs.writeFileSync(CONFIG, conf);

let html = leer(INDEX);
const nuevo = { ...cfg, tomados };
for (const s of superficies(nuevo)) {
  if (!s.re.test(html)) { console.error(`ROTA: el patrón de «${s.nombre}» no encuentra nada en index.html — revísalo a mano antes de publicar`); process.exit(3); }
  html = html.replace(s.re, s.txt);
}
fs.writeFileSync(INDEX, html);

const pct = Math.round((tomados / nuevo.meta) * 1000) / 10;
console.log(`corte aplicado: ${tomados} de ${nuevo.meta} ladrillos · ${pct}% · ${pesos(tomados * nuevo.precio)} · siguiente #${tomados + 1} · corte ${fecha}`);
console.log('faltan: verificar (axe + captura), commit y push. assets/og.jpg lleva su propio número grabado.');
