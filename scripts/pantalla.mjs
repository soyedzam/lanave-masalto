#!/usr/bin/env node
/* LA NAVE · la pieza que se proyecta en el culto.
 *
 * Por qué es un solo archivo: medido el 16·nov, si la lámina se abre con doble clic
 * (`file://`) el navegador bloquea el módulo `assets/datos.js` por CORS, quedan los
 * fallbacks del HTML —que son ceros— y la pantalla proyecta «0 de 250 ladrillos» sin dar
 * un solo error. No se cae: miente en silencio. Por eso esto genera UN HTML sin `import`,
 * con el corte inyectado y con tipografías, fotos y QR embebidos: abre con doble clic,
 * sin servidor y sin internet.
 *
 *   node scripts/pantalla.mjs                 escribe pantalla.html en la raíz del repo
 *   node scripts/pantalla.mjs /ruta/x.html    lo escribe en otro lado (para el USB)
 *
 * La geometría del muro NO se copia: se extrae de `assets/muro.js` al generar, y si deja
 * de sumar `meta` el generador falla en vez de publicar celdas muertas.
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const RAIZ = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const leer = (r) => fs.readFileSync(path.join(RAIZ, r), 'utf8');
const b64 = (r, mime) => `data:${mime};base64,` + fs.readFileSync(path.join(RAIZ, r)).toString('base64');

/* ---------- 1 · el corte, de la única fuente ---------- */
const conf = leer('assets/config.js');
const num = (k) => { const m = conf.match(new RegExp(`\\n\\s*${k}:\\s*(\\d+)`)); if (!m) throw new Error(`falta ${k} en config.js`); return Number(m[1]); };
const txt = (k) => { const m = conf.match(new RegExp(`\\n\\s*${k}:\\s*"([^"]*)"`)); return m ? m[1] : ''; };
const D = { tomados: num('tomados'), meta: num('meta'), precio: num('precio'),
            fechaCorte: txt('fechaCorte'), estreno: txt('estreno'), url: txt('urlDisplay') };
D.pct = Math.round((D.tomados / D.meta) * 1000) / 10;
D.siguiente = D.tomados + 1;

/* ---------- 2 · la geometría del muro, EXTRAÍDA de muro.js ---------- */
const muro = leer('assets/muro.js');
const ini = muro.indexOf('const COLS');
const fin = muro.indexOf('const SVG_NS');
if (ini < 0 || fin < 0 || fin < ini) throw new Error('no reconozco la forma de assets/muro.js: revisa el generador antes de publicar');
const GEOM = muro.slice(ini, fin).trim();
const celdas = new Function(`${GEOM}; return { celdas: celdasOrdenadas(), COLS, FILAS, U, CELDA, RADIO };`)();
if (celdas.celdas.length !== D.meta) {
  throw new Error(`la fachada suma ${celdas.celdas.length} celdas y la meta es ${D.meta}: rearma filasFachada() en muro.js (ver la trampa del Pase)`);
}

/* ---------- 3 · lo que se embebe ---------- */
const A = {
  cormorant: b64('assets/fonts/cormorant-600.woff2', 'font/woff2'),
  inter5: b64('assets/fonts/inter-500.woff2', 'font/woff2'),
  inter7: b64('assets/fonts/inter-700.woff2', 'font/woff2'),
  qr: b64('assets/qr-lanave.svg', 'image/svg+xml'),
};
/* Los cuatro hitos, con el encuadre que SÍ tienen. `ya-no-cabemos.jpg` es vertical
   (1047x1500): no se recorta a 16:9 —se tiraría el encuadre, la ley del horizontal—,
   se compone. */
const HITOS = [
  { img: 'assets/sala-casa.jpg',        titulo: 'La sala de una casa', pie: 'Rentada y pintada de negro. Transmitíamos desde ahí.', vert: false },
  { img: 'assets/frente-boliche.jpg',   titulo: 'Frente al boliche',   pie: 'Un salón prestado, enfrente.', vert: false },
  { img: 'assets/boliche-adoracion.jpg',titulo: 'Arriba del boliche',  pie: 'Subiendo las escaleras, cada domingo.', vert: false },
  { img: 'assets/ya-no-cabemos.jpg',    titulo: 'Hoy',                 pie: 'Dos cultos cada domingo, y ya no cabemos.', vert: true },
].map(h => ({ ...h, data: b64(h.img, 'image/jpeg') }));

/* La obra: lo que de verdad existe hoy. No hay carpa en la media (verificado el
   17·nov: lo mas avanzado es el terreno nivelado del 13·nov), y eso no es un hueco,
   es la historia del suelo — el primer pedazo de tierra donde la comunidad puede
   clavar algo despues de anos en lugares prestados. */
const OBRA = [
  { img: 'assets/obra-01.jpg', fecha: '2 de noviembre',  linea: 'Midiendo el terreno, todavía con pasto.',        vert: false },
  { img: 'assets/obra-02.jpg', fecha: '6 de noviembre',  linea: 'El acero de la primera zapata.',                  vert: true  },
  { img: 'assets/obra-03.jpg', fecha: '11 de noviembre', linea: 'La cimbra, lista para el colado.',                vert: true  },
  { img: 'assets/obra-04.jpg', fecha: '12 de noviembre', linea: 'Zapata colada, con sus anclas.',                  vert: true  },
  { img: 'assets/obra-05.jpg', fecha: '13 de noviembre', linea: 'El terreno nivelado. Aquí es.',                   vert: false },
].filter(o => fs.existsSync(path.join(RAIZ, o.img)))
 .map(o => ({ ...o, data: b64(o.img, 'image/jpeg') }));

/* El acto de la carpa entra SOLO cuando haya foto real. Mientras no exista, no se
   proyecta un hueco ni un texto de relleno: la pieza se queda sin ese acto. */
const CARPA = fs.existsSync(path.join(RAIZ, 'assets/carpa-nueva.jpg'))
  ? b64('assets/carpa-nueva.jpg', 'image/jpeg') : null;

/* ---------- 4 · el estreno, si está sellado ---------- */
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
let estrenoFrase = '';
if (/^\d{4}-\d{2}-\d{2}$/.test(D.estreno)) {
  const [a,m,d] = D.estreno.split('-').map(Number);
  const f = new Date(Date.UTC(a, m-1, d));
  const hoy = new Date(); const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  estrenoFrase = f.getTime() <= hoyUTC
    ? 'Hoy entramos a La Nave.'
    : `El ${DIAS[f.getUTCDay()]} ${d} entramos a La Nave.`;
}

/* ---------- 5 · la pieza ---------- */
const actos = [];
actos.push(`<section class="acto acto-latido" data-dur="7000">
  <div class="centro">
    <svg class="corazon" viewBox="0 0 32 30" aria-hidden="true"><defs><radialGradient id="gc" cx="50%" cy="38%" r="68%">
      <stop offset="0" stop-color="#FFCF6A"/><stop offset=".5" stop-color="#F29100"/><stop offset="1" stop-color="#B8862F"/>
    </radialGradient></defs><path d="M16 28.6 C16 28.6 2.2 20.2 2.2 10.4 C2.2 5.7 5.7 3 9.1 3 C12 3 14.6 4.9 16 7.6 C17.4 4.9 20 3 22.9 3 C26.3 3 29.8 5.7 29.8 10.4 C29.8 20.2 16 28.6 16 28.6 Z" fill="url(#gc)"/></svg>
    <p class="verso">El corazón de La Nave<em>somos nosotros.</em></p>
  </div></section>`);

actos.push(`<section class="acto acto-rotulo" data-dur="4200"><div class="centro">
  <p class="label">De dónde venimos</p></div></section>`);

HITOS.forEach((h) => {
  actos.push(h.vert
    ? `<section class="acto acto-hito acto-split" data-dur="5600">
         <div class="split-txt"><p class="hito-num">◆</p><h2>${h.titulo}</h2><p class="hito-pie">${h.pie}</p></div>
         <div class="split-img"><img src="${h.data}" alt=""></div>
       </section>`
    : `<section class="acto acto-hito" data-dur="5600">
         <img class="fondo" src="${h.data}" alt="">
         <div class="rotulo-bajo"><h2>${h.titulo}</h2><p class="hito-pie">${h.pie}</p></div>
       </section>`);
});

if (OBRA.length) {
  actos.push(`<section class="acto acto-rotulo" data-dur="3800"><div class="centro">
    <p class="label">Aquí es</p></div></section>`);
  OBRA.forEach((o) => {
    actos.push(o.vert
      ? `<section class="acto acto-hito acto-split" data-dur="3600">
           <div class="split-txt"><p class="hito-num">${o.fecha}</p><h2 class="obra-h">${o.linea}</h2></div>
           <div class="split-img"><img src="${o.data}" alt=""></div>
         </section>`
      : `<section class="acto acto-hito" data-dur="4200">
           <img class="fondo" src="${o.data}" alt="">
           <div class="rotulo-bajo"><p class="hito-num">${o.fecha}</p><h2>${o.linea}</h2></div>
         </section>`);
  });
  actos.push(`<section class="acto acto-rotulo" data-dur="5200"><div class="centro">
    <p class="verso">Once días del pasto<em>a la plataforma lista.</em></p></div></section>`);
}

if (CARPA) actos.push(`<section class="acto acto-carpa" data-dur="7000">
  <img class="fondo fondo-limpio" src="${CARPA}" alt=""></section>`);

if (estrenoFrase) actos.push(`<section class="acto acto-rotulo" data-dur="5000"><div class="centro">
  <p class="estreno">${estrenoFrase}</p></div></section>`);

actos.push(`<section class="acto acto-muro" data-dur="13000">
  <div class="muro-caja"><svg class="muro" viewBox="0 0 ${celdas.COLS * celdas.U} ${celdas.FILAS * celdas.U}" aria-hidden="true"></svg></div>
  <div class="muro-txt">
    <p class="muro-num"><strong id="js-num">0</strong><span>de ${D.meta} ladrillos</span></p>
    <p class="muro-pie">Cada celda encendida es un ladrillo que alguien ya tomó.</p>
  </div></section>`);

actos.push(`<section class="acto acto-cierre" data-dur="11000">
  <div class="cierre-txt">
    <h2>Tu lugar te espera.</h2>
    <p class="cierre-sig">Toma el ladrillo <strong>#${D.siguiente}</strong></p>
    <p class="cierre-url">${D.url}</p>
  </div>
  <div class="cierre-qr"><img src="${A.qr}" alt=""></div></section>`);

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>La Nave · pantalla</title>
<meta name="robots" content="noindex">
<style>
@font-face{font-family:"Cormorant Garamond";src:url(${A.cormorant}) format("woff2");font-weight:600;font-display:block}
@font-face{font-family:Inter;src:url(${A.inter5}) format("woff2");font-weight:500;font-display:block}
@font-face{font-family:Inter;src:url(${A.inter7}) format("woff2");font-weight:700;font-display:block}
:root{--carbon:#2B2A26;--carbon-deep:#1A1917;--naranja:#F29100;--bronce:#B8862F;--hueso:#F4F1EA;
  --display:"Cormorant Garamond",Georgia,serif;--texto:Inter,system-ui,sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;background:var(--carbon-deep);color:var(--hueso);font-family:var(--texto);overflow:hidden;cursor:none}
.escena{position:fixed;inset:0}
.acto{position:absolute;inset:0;opacity:0;transition:opacity .9s ease;display:grid;place-items:center;
  background:radial-gradient(60rem 40rem at 50% 50%, rgba(242,145,0,.07), transparent 65%), var(--carbon-deep)}
.acto.viva{opacity:1}
.centro{text-align:center;padding:0 8vw}
.fondo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transform:scale(1.02);transition:transform 6.4s linear}
.acto.viva .fondo{transform:scale(1.1)}
.acto-hito::after{content:"";position:absolute;inset:0;
  background:linear-gradient(to top, rgba(26,25,23,.92) 0%, rgba(26,25,23,.34) 42%, rgba(26,25,23,.12) 100%)}
.acto-carpa .fondo-limpio{transform:scale(1.04)}
.acto-carpa::after{content:"";position:absolute;inset:0;background:linear-gradient(to top, rgba(26,25,23,.5), transparent 46%)}
.rotulo-bajo{position:absolute;left:6vw;right:6vw;bottom:7vh;z-index:2;text-align:left}
h2{font-family:var(--display);font-weight:600;font-size:clamp(3rem, 1rem + 6vw, 9rem);line-height:1}
.hito-pie{margin-top:1.2vh;font-size:clamp(1.1rem, .4rem + 1.5vw, 2.4rem);font-weight:500;
  color:color-mix(in srgb, var(--hueso) 80%, transparent)}
.hito-num{color:var(--naranja);font-size:1.6vw;margin-bottom:1vh}
.obra-h{font-size:clamp(2.2rem, .9rem + 3.6vw, 5.4rem);line-height:1.08}
.acto-split{grid-template-columns:1fr 38%;gap:4vw;padding:0 0 0 7vw;place-items:center stretch}
.split-txt{align-self:center;text-align:left}
.split-img{position:relative;height:100%;overflow:hidden}
.split-img img{width:100%;height:100%;object-fit:cover;transform:scale(1.02);transition:transform 6.4s linear}
.acto.viva .split-img img{transform:scale(1.09)}
.label{font-family:var(--texto);font-weight:700;letter-spacing:.42em;text-transform:uppercase;
  font-size:clamp(.9rem, .3rem + 1.1vw, 1.8rem);color:var(--naranja)}
.corazon{width:clamp(7rem, 4rem + 9vw, 15rem);height:auto;filter:drop-shadow(0 0 5vw rgba(242,145,0,.5));
  animation:latido 2.4s ease-in-out infinite}
@keyframes latido{0%,100%{transform:scale(1)}14%{transform:scale(1.07)}28%{transform:scale(1)}42%{transform:scale(1.045)}56%{transform:scale(1)}}
.verso{margin-top:4vh;font-family:var(--display);font-size:clamp(2rem, .8rem + 3.4vw, 5.4rem);line-height:1.2}
.verso em{display:block;font-style:italic;color:var(--naranja)}
.estreno{font-family:var(--display);font-size:clamp(2.2rem, 1rem + 4vw, 6.4rem);line-height:1.15}
.acto-muro{grid-template-columns:48% 1fr;gap:3vw;padding:0 6vw;place-items:center}
.muro-caja{height:78vh;display:grid;place-items:center}
.muro{height:100%;width:auto;overflow:visible}
.muro .celda{fill:#35332E;stroke:#413E38;stroke-width:1;opacity:0;transition:opacity .5s ease, fill .6s ease}
.muro .celda.puesta{opacity:1}
.muro .celda.tomada{fill:var(--naranja);stroke:#FFCF6A}
.muro .celda.proxima{fill:#5A4A22;stroke:var(--naranja);animation:proxima 1.8s ease-in-out infinite}
@keyframes proxima{0%,100%{opacity:.55}50%{opacity:1}}
.muro-txt{text-align:left}
.muro-num strong{display:block;font-family:var(--display);font-size:clamp(5rem, 2rem + 11vw, 17rem);
  line-height:.86;color:var(--naranja)}
.muro-num span{display:block;margin-top:1.4vh;font-size:clamp(1.1rem, .4rem + 1.5vw, 2.6rem);font-weight:500;
  color:color-mix(in srgb, var(--hueso) 78%, transparent)}
.muro-pie{margin-top:3.4vh;font-size:clamp(1rem, .35rem + 1.2vw, 2rem);line-height:1.45;
  color:color-mix(in srgb, var(--hueso) 62%, transparent);max-width:22ch}
.acto-cierre{grid-template-columns:1fr auto;gap:5vw;padding:0 7vw;place-items:center}
.cierre-txt{text-align:left}
.cierre-sig{margin-top:2.6vh;font-size:clamp(1.3rem, .5rem + 1.8vw, 3rem);font-weight:500}
.cierre-sig strong{color:var(--naranja);font-weight:700}
.cierre-url{margin-top:1.6vh;font-size:clamp(1rem, .4rem + 1.3vw, 2.2rem);
  color:color-mix(in srgb, var(--hueso) 72%, transparent)}
.cierre-qr img{width:clamp(13rem, 8rem + 17vw, 30rem);height:auto;display:block;
  background:var(--hueso);padding:1.6vw;border-radius:1.2vw}
.pausa{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9;
  font-size:4vw;letter-spacing:.3em;opacity:0;transition:opacity .3s;pointer-events:none}
.pausa.viva{opacity:.9}
@media (prefers-reduced-motion: reduce){
  .corazon{animation:none}.muro .celda.proxima{animation:none;opacity:1}
  .acto.viva .fondo,.acto.viva .split-img img{transform:scale(1.02)}
}
</style></head>
<body>
<main class="escena">${actos.join('\n')}</main>
<p class="pausa" aria-hidden="true">EN PAUSA</p>
<script>
(function(){
  var actos = [].slice.call(document.querySelectorAll('.acto'));
  var i = -1, t = null, pausado = false;
  var DATOS = { tomados: ${D.tomados}, meta: ${D.meta} };
  var CELDAS = ${JSON.stringify(celdas.celdas)};
  var U = ${celdas.U}, CELDA = ${celdas.CELDA}, RADIO = ${celdas.RADIO};

  /* el muro se dibuja una vez; se enciende cada vez que entra su acto */
  var svg = document.querySelector('.muro');
  CELDAS.forEach(function(c){
    var r = document.createElementNS('http://www.w3.org/2000/svg','rect');
    r.setAttribute('x', c.col * U + (U - CELDA) / 2);
    r.setAttribute('y', c.fila * U + (U - CELDA) / 2);
    r.setAttribute('width', CELDA); r.setAttribute('height', CELDA);
    r.setAttribute('rx', RADIO); r.setAttribute('class','celda');
    r.dataset.orden = c.orden;
    svg.appendChild(r);
  });
  var rects = [].slice.call(svg.querySelectorAll('.celda')).sort(function(a,b){
    return a.dataset.orden - b.dataset.orden; });

  function encenderMuro(dur){
    var num = document.getElementById('js-num');
    rects.forEach(function(r){ r.classList.remove('puesta','tomada','proxima'); });
    num.textContent = '0';
    var paso = Math.max(14, (dur * 0.6) / Math.max(1, DATOS.tomados));
    rects.forEach(function(r, k){
      setTimeout(function(){
        r.classList.add('puesta');
        if (k < DATOS.tomados) { r.classList.add('tomada'); num.textContent = k + 1; }
        else if (k === DATOS.tomados) { r.classList.add('proxima'); }
      }, k < DATOS.tomados ? k * paso : DATOS.tomados * paso + (k - DATOS.tomados) * 6);
    });
  }

  function ir(n){
    if (i >= 0) actos[i].classList.remove('viva');
    i = (n + actos.length) % actos.length;
    var a = actos[i];
    a.classList.add('viva');
    if (a.classList.contains('acto-muro')) encenderMuro(+a.dataset.dur);
    clearTimeout(t);
    if (!pausado) t = setTimeout(function(){ ir(i + 1); }, +a.dataset.dur);
  }

  document.addEventListener('keydown', function(e){
    if (e.key === ' ') { e.preventDefault(); pausado = !pausado;
      document.querySelector('.pausa').classList.toggle('viva', pausado);
      if (pausado) clearTimeout(t); else ir(i + 1); }
    if (e.key === 'ArrowRight') { pausado = false; document.querySelector('.pausa').classList.remove('viva'); ir(i + 1); }
    if (e.key === 'ArrowLeft')  { pausado = false; document.querySelector('.pausa').classList.remove('viva'); ir(i - 1); }
    if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
  });
  document.addEventListener('click', function(){
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function(){});
  });
  ir(0);
})();
</script>
</body></html>`;

const SALIDA = process.argv[2] ? path.resolve(process.argv[2]) : path.join(RAIZ, 'pantalla.html');
fs.writeFileSync(SALIDA, html);
console.log(`pantalla escrita: ${SALIDA} · ${Math.round(html.length / 1024)} KB · ${actos.length} actos`);
console.log(`corte inyectado: ${D.tomados} de ${D.meta} (${D.pct}%) · siguiente #${D.siguiente} · corte ${D.fechaCorte}`);
console.log(`fachada: ${celdas.celdas.length} celdas extraidas de muro.js${CARPA ? '' : ' · SIN acto de la carpa: falta assets/carpa-nueva.jpg'}`);
console.log(`obra: ${OBRA.length} tomas fechadas`);
if (estrenoFrase) console.log(`estreno: "${estrenoFrase}"`);
