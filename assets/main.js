/* LA NAVE · orquestador — une datos, travesía, muro, cuenta y medición. */

import { estado, sincronizar } from "./datos.js";
import { medir, medirAlVer } from "./medir.js";
import { iniciarTravesia } from "./travesia.js";
import { iniciarMuro } from "./muro.js";
import { iniciarCuentaRegresiva, iniciarContadores, iniciarChips } from "./cuenta.js";
import { iniciarVideo } from "./video.js";
import { iniciarHero } from "./hero.js";
import { iniciarScroll } from "./scroll.js";
import { iniciarGaleria } from "./galeria.js";
import { iniciarVsl } from "./vsl.js";
import { iniciarInteracciones } from "./interacciones.js";

const cfg = window.LANAVE || {};
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* — Reveal de secciones — */
function iniciarReveals() {
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }
}

/* — CTA de WhatsApp (config-driven) en todos los botones — */
function iniciarConversion() {
  const urlDisplay = cfg.urlDisplay || "";
  ["js-url-display", "js-url-display-final"].forEach((id) => {
    const el = document.getElementById(id);
    if (el && urlDisplay) el.textContent = urlDisplay;
  });

  const numero = String(cfg.whatsapp || "").replace(/\D/g, "");
  if (numero) {
    const waHref = "https://wa.me/" + numero +
      "?text=" + encodeURIComponent(cfg.mensajeWhatsApp || "Quiero tomar mi lugar en La Nave.");

    const waCta = document.getElementById("js-wa-cta");
    if (waCta) {
      waCta.href = waHref;
      waCta.hidden = false;
      waCta.target = "_blank";
      waCta.rel = "noopener";
    }
    ["js-wa-cta-final", "js-muro-cta", "js-zarpe-cta"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.href = waHref;
        el.target = "_blank";
        el.rel = "noopener";
      }
    });
    const final = document.getElementById("js-wa-cta-final");
    if (final) final.textContent = "Toma tu lugar por WhatsApp";
    const alt = document.getElementById("js-cta-alt");
    if (alt) alt.textContent = "También puedes registrarte en los dos cultos dominicales o con tu líder de grupo.";
  }

  /* medición de cada CTA (anónima) */
  document.querySelectorAll("[data-cta]").forEach((el) => {
    el.addEventListener("click", () => {
      medir("cta", { origen: el.dataset.cta, whatsapp: Boolean(numero) });
    });
  });
}

/* — Compartir: hoja nativa del teléfono o WhatsApp — */
function iniciarCompartir() {
  const btn = document.getElementById("js-compartir");
  if (!btn) return;

  const texto = cfg.compartir || "Toma tu lugar en La Nave 👉 masalto.org/lanave";

  btn.addEventListener("click", async () => {
    medir("compartir");
    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
        return;
      } catch (e) {
        /* usuario canceló: no pasa nada */
        return;
      }
    }
    window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank", "noopener");
  });
}

/* — Barra de zarpe: aparece tras el hero, se retira en el cierre — */
function iniciarZarpe() {
  const barra = document.getElementById("js-zarpe");
  const hero = document.getElementById("inicio");
  const final = document.getElementById("final");
  if (!barra || !hero || !("IntersectionObserver" in window)) return;

  let cerrada = false;
  let heroVisible = true;
  let finalVisible = false;

  function pinta() {
    barra.classList.toggle("es-visible", !cerrada && !heroVisible && !finalVisible);
  }

  new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { heroVisible = en.isIntersecting; });
    pinta();
  }, { threshold: 0.05 }).observe(hero);

  new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { finalVisible = en.isIntersecting; });
    pinta();
  }, { threshold: 0.15 }).observe(final);

  const cerrar = document.getElementById("js-zarpe-cerrar");
  if (cerrar) {
    cerrar.addEventListener("click", () => {
      cerrada = true;
      medir("zarpe_cerrada");
      pinta();
    });
  }
}

/* — FAQ: qué pregunta abre la comunidad — */
function iniciarFaq() {
  document.querySelectorAll(".faq-item").forEach((det) => {
    det.addEventListener("toggle", () => {
      if (det.open) {
        const s = det.querySelector("summary");
        medir("faq", { pregunta: s ? s.textContent.trim().slice(0, 60) : "" });
      }
    });
  });
}

/* — Arranque — */
iniciarReveals();
iniciarConversion();
iniciarCompartir();
iniciarTravesia();
iniciarMuro();
iniciarContadores();
iniciarChips();
iniciarCuentaRegresiva();
iniciarZarpe();
iniciarFaq();
iniciarVideo();
iniciarHero();
iniciarScroll();
iniciarGaleria();
iniciarVsl();
iniciarInteracciones();

medir("carga", { tomados: estado().tomados });
medirAlVer(document.getElementById("tomar"), "pasos_vistos");
sincronizar();
