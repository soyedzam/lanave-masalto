/* LA NAVE · cuenta regresiva viva al cierre + contadores animados + barra de avance. */

import { estado, alCambiar, formatoFecha } from "./datos.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pad(n) {
  return String(n).padStart(2, "0");
}

/* — Cuenta regresiva hacia el fin del día de `cierre`.
     Si `cierre` viene vacío en config, no arranca: la causa no tiene plazo. — */
export function iniciarCuentaRegresiva() {
  const destinos = Array.from(document.querySelectorAll("[data-cuenta]"));
  /* Sin plazo no hay reloj: `cierre` vacío en config apaga la cuenta regresiva. */
  if (!destinos.length || !estado().hayCierre) return;

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
    const precio = window.LANAVE && window.LANAVE.precio;
    const pesos = (n) => "$" + Number(n).toLocaleString("es-MX");
    if (precio) {
      document.querySelectorAll("[data-precio]").forEach((el) => { el.textContent = pesos(precio); });
      document.querySelectorAll("[data-meta-total]").forEach((el) => { el.textContent = pesos(e.meta * precio); });
      document.querySelectorAll("[data-levantado]").forEach((el) => { el.textContent = pesos(e.tomados * precio); });
    }
    document.querySelectorAll("[data-meta-ladrillos]").forEach((el) => { el.textContent = String(e.meta); });
    const progressText = document.getElementById("js-progress-text");
    if (progressText) {
      progressText.textContent = e.tomados + " de " + e.meta + " ladrillos · " + e.pct + "%";
    }
    const wrap = document.getElementById("js-progress-wrap");
    if (wrap) {
      wrap.setAttribute("aria-label",
        "Avance de la causa: " + e.tomados + " de " + e.meta + " ladrillos, " + e.pct + " por ciento");
    }
    const corte = document.getElementById("js-corte");
    if (corte && e.fechaCorte) {
      corte.textContent = "Al corte del " + formatoFecha(e.fechaCorte) + ".";
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

/* — El estreno: la fecha en que la comunidad entra a La Nave.
     Los destinos arrancan ocultos en el HTML y sólo aparecen si config.estreno tiene fecha.
     Así el HTML nunca afirma un día: si el estreno cambia o se borra, no queda nada viejo. — */
function pintaEstreno(e) {
  const chip = document.getElementById("js-chip-estreno");
  if (chip) {
    if (e.hayEstreno) {
      chip.textContent = e.estrenoHoy ? "Hoy entramos a La Nave" : e.estrenoCuando + " entramos";
      chip.hidden = false;
    } else { chip.hidden = true; }
  }
  document.querySelectorAll("[data-estreno]").forEach((el) => {
    if (!e.hayEstreno) { el.hidden = true; return; }
    const molde = el.getAttribute("data-estreno") || "{cuando} entramos a La Nave.";
    el.textContent = molde
      .replace("{cuando}", e.estrenoCuando)
      .replace("{entramos}", e.estrenoHoy ? "entramos" : "entramos");
    el.hidden = false;
  });
  const sello = document.querySelector("[data-estreno-sello]");
  if (sello && e.hayEstreno) sello.textContent = e.estrenoHoy ? "Hoy se revela" : e.estrenoCuando + " se revela";
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
      if (e.hayCierre) {
        chipCierre.innerHTML = "cierra en <strong>" + e.dias + " " + (e.dias === 1 ? "día" : "días") + "</strong>";
      } else {
        chipCierre.remove();
      }
    }
    if (heroFill) heroFill.style.width = e.pct + "%";
    pintaEstreno(e);
  }

  pinta();
  alCambiar(pinta);
}
