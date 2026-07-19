/* LA NAVE · el Muro de los 250 — la fachada hecha de ladrillos.
   250 celdas dibujan el frente de la nave: hastial de 4·8·12,
   cuerpo de 12 filas de 18 y, abajo, la puerta abierta (8 de ancho)
   flanqueada por 5 y 5. 4+8+12 + 12×18 + 10 = 250, exacto.

   Si la meta cambia, hay que rearmar filasFachada() para que la suma
   coincida con cfg.meta (ver el aviso en config.js).

   Se enciende de abajo hacia arriba, del centro hacia afuera —
   como se levanta un muro de verdad. Sin nombres: solo el conteo real. */

import { estado, alCambiar } from "./datos.js";
import { medir } from "./medir.js";

const COLS = 18;
const FILAS = 16;      // 3 de hastial + 12 de cuerpo + 1 de puerta
const FILA_PUERTA = 15;
const U = 30;          // paso de la retícula
const CELDA = 24;      // lado de cada celda
const RADIO = 3;

/* filas de arriba hacia abajo: [fila, colInicio, cantidad] */
function filasFachada() {
  const filas = [
    [0, 7, 4],
    [1, 5, 8],
    [2, 3, 12]
  ];
  for (let r = 3; r <= 14; r++) filas.push([r, 0, 18]);
  /* fila de la puerta: 5 + hueco de 8 + 5 */
  filas.push([FILA_PUERTA, 0, 5, "izq"]);
  filas.push([FILA_PUERTA, 13, 5, "der"]);
  return filas;
}

function celdasOrdenadas() {
  const celdas = [];
  filasFachada().forEach((f) => {
    for (let i = 0; i < f[2]; i++) {
      const col = f[1] + i;
      celdas.push({ fila: f[0], col });
    }
  });
  /* orden de encendido: fila más baja primero, luego del centro hacia afuera */
  const centro = (COLS - 1) / 2;
  const orden = celdas.slice().sort((a, b) => {
    if (a.fila !== b.fila) return b.fila - a.fila;
    const da = Math.abs(a.col - centro);
    const db = Math.abs(b.col - centro);
    if (da !== db) return da - db;
    return a.col - b.col;
  });
  orden.forEach((c, i) => { c.orden = i; });
  return celdas;
}

const SVG_NS = "http://www.w3.org/2000/svg";

function el(nombre, attrs) {
  const n = document.createElementNS(SVG_NS, nombre);
  Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
  return n;
}

export function iniciarMuro() {
  const monte = document.getElementById("js-muro");
  if (!monte) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ancho = COLS * U;
  const alto = FILAS * U;
  const margen = (U - CELDA) / 2;

  const svg = el("svg", {
    class: "muro-svg",
    viewBox: "0 0 " + ancho + " " + (alto + 14),
    role: "img",
    "aria-label": "La fachada de La Nave dibujada con " + (estado().meta || 250) + " ladrillos; los ladrillos ya tomados están encendidos y el avance se detalla en los contadores debajo."
  });

  /* degradado de lugar tomado: bronce → naranja, la chispa de la marca */
  const defs = el("defs");
  const grad = el("linearGradient", { id: "gradLugar", x1: "0", y1: "1", x2: "0", y2: "0" });
  grad.appendChild(el("stop", { offset: "0", "stop-color": "#B8862F" }));
  grad.appendChild(el("stop", { offset: "1", "stop-color": "#F29100" }));
  defs.appendChild(grad);
  svg.appendChild(defs);

  const celdas = celdasOrdenadas();
  const rects = [];

  celdas.forEach((c) => {
    const r = el("rect", {
      x: c.col * U + margen,
      y: c.fila * U + margen,
      width: CELDA,
      height: CELDA,
      rx: RADIO,
      class: "celda"
    });
    r.dataset.orden = String(c.orden);
    const titulo = el("title");
    r.appendChild(titulo);
    r.addEventListener("click", () => {
      if (!r.classList.contains("es-tomada")) {
        medir("muro_celda", { orden: c.orden });
        location.hash = "#tomar";
      }
    });
    svg.appendChild(r);
    rects.push({ rect: r, titulo, orden: c.orden });
  });

  /* la puerta abierta: umbral cálido en el hueco de la fila baja */
  const puertaX = 5 * U + margen;
  const puertaW = 8 * U - margen * 2;
  const puertaY = FILA_PUERTA * U + margen;
  svg.appendChild(el("path", {
    d: "M" + puertaX + " " + (puertaY + CELDA) +
       " L" + puertaX + " " + (puertaY + 6) +
       " L" + (puertaX + puertaW) + " " + (puertaY + 6) +
       " L" + (puertaX + puertaW) + " " + (puertaY + CELDA),
    class: "muro-puerta",
    fill: "none"
  }));
  const umbral = el("line", {
    x1: puertaX, y1: puertaY + CELDA + 6,
    x2: puertaX + puertaW, y2: puertaY + CELDA + 6,
    class: "muro-umbral"
  });
  svg.appendChild(umbral);

  monte.appendChild(svg);

  let encendido = false;

  function pinta(animar) {
    const e = estado();
    svg.setAttribute("aria-label",
      "El Muro: la fachada de La Nave dibujada con " + e.meta +
      " ladrillos. " + e.tomados + " tomados, " + e.disponibles +
      " disponibles. Se enciende de abajo hacia arriba y la puerta queda abierta.");

    rects.forEach((r) => {
      const tomada = r.orden < e.tomados;
      r.titulo.textContent = tomada
        ? "Ladrillo tomado · gracias"
        : "Ladrillo disponible · toca para tomarlo";
      if (tomada && !r.rect.classList.contains("es-tomada")) {
        r.rect.classList.add("es-tomada");
        if (animar && !reduceMotion) {
          r.rect.style.transitionDelay = Math.min(r.orden * 26, 2400) + "ms";
        } else {
          r.rect.style.transitionDelay = "0ms";
        }
        /* forzar el estado inicial antes de encender */
        requestAnimationFrame(() => r.rect.classList.add("es-viva"));
      } else if (!tomada) {
        r.rect.classList.remove("es-tomada", "es-viva");
      }
    });

    const nota = document.getElementById("js-muro-nota");
    if (nota) {
      nota.textContent = e.completo
        ? "Los " + e.meta + " ladrillos están tomados. La Nave se levanta completa."
        : e.tomados + " encendidos · " + e.disponibles + " por encender — el siguiente es el ladrillo #" + e.siguiente + ".";
    }
    const btn = document.getElementById("js-muro-cta");
    if (btn && !e.completo) {
      btn.textContent = "Toma el ladrillo #" + e.siguiente;
    }
  }

  /* enciende al entrar en pantalla, con la cascada desde los cimientos */
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entradas, obs) => {
      entradas.forEach((en) => {
        if (en.isIntersecting && !encendido) {
          encendido = true;
          pinta(true);
          medir("muro_visto");
          obs.disconnect();
        }
      });
    }, { threshold: 0.25 });
    io.observe(monte);
  } else {
    encendido = true;
    pinta(false);
  }

  alCambiar(() => { if (encendido) pinta(false); });
}
