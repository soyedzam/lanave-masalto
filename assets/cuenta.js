/* LA NAVE · cuenta regresiva viva al cierre + contadores animados + barra de avance. */

import { estado, alCambiar, formatoFecha } from "./datos.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pad(n) {
  return String(n).padStart(2, "0");
}

/* — Cuenta regresiva (días · hh:mm:ss) hacia el fin del 31 de julio — */
export function iniciarCuentaRegresiva() {
  const destinos = Array.from(document.querySelectorAll("[data-cuenta]"));
  if (!destinos.length) return;

  function tic() {
    const fin = estado().cierreFin.getTime();
    const resta = Math.max(0, fin - Date.now());
    const d = Math.floor(resta / 86400000);
    const h = Math.floor(resta / 3600000) % 24;
    const m = Math.floor(resta / 60000) % 60;
    const s = Math.floor(resta / 1000) % 60;
    const texto = resta === 0
      ? "cerrado"
      : d + "d " + pad(h) + ":" + pad(m) + ":" + pad(s);
    destinos.forEach((el) => { el.textContent = texto; });
  }

  tic();
  setInterval(tic, 1000);
}

/* — Contadores grandes de la sección de avance — */
function animaConteo(el, hasta) {
  let inicio = null;
  const DURACION = 1100;
  function paso(ts) {
    if (!inicio) inicio = ts;
    const t = Math.min(1, (ts - inicio) / DURACION);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(hasta * eased));
    if (t < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

export function iniciarContadores() {
  const seccion = document.getElementById("avance");
  const fill = document.getElementById("js-progress");
  let disparado = false;

  function valores() {
    const e = estado();
    return {
      "js-tomados": e.tomados,
      "js-disponibles": e.disponibles,
      "js-dias": e.dias,
      "js-ritmo": e.ritmo
    };
  }

  function pintaTextos() {
    const e = estado();
    document.querySelectorAll("[data-precio]").forEach((el) => {
      if (window.LANAVE && window.LANAVE.precio) el.textContent = "$" + Number(window.LANAVE.precio).toLocaleString("es-MX");
    });
    const progressText = document.getElementById("js-progress-text");
    if (progressText) {
      progressText.textContent = e.tomados + " de " + e.meta + " ladrillos · " + e.pct + "%";
    }
    const wrap = document.getElementById("js-progress-wrap");
    if (wrap) {
      wrap.setAttribute("aria-label",
        "Avance del Fondo Fundadores: " + e.tomados + " de " + e.meta + " ladrillos, " + e.pct + " por ciento");
    }
    const corte = document.getElementById("js-corte");
    if (corte && e.fechaCorte) {
      corte.textContent = "Al corte del " + formatoFecha(e.fechaCorte) +
        " · días y ritmo se calculan al momento.";
    }
    /* hitos de la barra: se encienden solo los alcanzados de verdad */
    [50, 75, 90].forEach((hito) => {
      const marca = document.querySelector('[data-hito="' + hito + '"]');
      if (marca) marca.classList.toggle("es-logrado", e.pct >= hito);
    });
  }

  function dispara() {
    const v = valores();
    Object.keys(v).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (reduceMotion || disparado) { el.textContent = String(v[id]); }
      else { animaConteo(el, v[id]); }
    });
    if (fill) fill.style.width = estado().pct + "%";
    disparado = true;
  }

  pintaTextos();

  if (seccion && "IntersectionObserver" in window) {
    let visto = false;
    new IntersectionObserver((entradas, obs) => {
      entradas.forEach((en) => {
        if (en.isIntersecting && !visto) {
          visto = true;
          dispara();
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 }).observe(seccion);
  } else {
    dispara();
  }

  /* si llega corte remoto después, repinta sin animación */
  alCambiar(() => {
    pintaTextos();
    if (disparado) dispara();
  });
}

/* — Chips del hero — */
export function iniciarChips() {
  const chipAvance = document.getElementById("js-chip-avance");
  const chipCierre = document.getElementById("js-chip-cierre");
  const heroFill = document.getElementById("js-hero-fill");

  function pinta() {
    const e = estado();
    if (chipAvance) {
      chipAvance.innerHTML = "<strong>" + e.tomados + "</strong> de " + e.meta + " ladrillos tomados";
    }
    if (chipCierre) {
      chipCierre.innerHTML = "cierra en <strong>" + e.dias + " " + (e.dias === 1 ? "día" : "días") + "</strong>";
    }
    if (heroFill) heroFill.style.width = e.pct + "%";
  }

  pinta();
  alCambiar(pinta);
}
