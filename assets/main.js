/* LA NAVE · lógica de página: avance calculado, contadores y CTA de WhatsApp. */
(function () {
  "use strict";

  var cfg = window.LANAVE || {};
  var MS_DIA = 86400000;

  function fechaLocal(iso) {
    // Fecha "civil" (sin zona): evita corrimientos de un día por UTC.
    var p = (iso || "").split("-").map(Number);
    return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
  }

  function hoyLocal() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function formatoCorte(iso) {
    var meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                 "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    var f = fechaLocal(iso);
    return f.getDate() + " de " + meses[f.getMonth()] + " de " + f.getFullYear();
  }

  // — Derivados del corte —
  var meta = cfg.meta || 258;
  var tomados = Math.max(0, Math.min(meta, cfg.tomados || 0));
  var disponibles = meta - tomados;
  var dias = Math.max(0, Math.round((fechaLocal(cfg.cierre) - hoyLocal()) / MS_DIA));
  var ritmo = dias > 0 ? Math.ceil(disponibles / dias) : disponibles;
  var pct = Math.round((tomados / meta) * 1000) / 10;

  var valores = {
    "js-tomados": tomados,
    "js-disponibles": disponibles,
    "js-dias": dias,
    "js-ritmo": ritmo
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pinta(id, valor) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(valor);
  }

  function animaConteo(el, hasta) {
    var inicio = null;
    var DURACION = 1100;
    function paso(ts) {
      if (!inicio) inicio = ts;
      var t = Math.min(1, (ts - inicio) / DURACION);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(hasta * eased));
      if (t < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  // — Texto de avance y corte —
  var progressText = document.getElementById("js-progress-text");
  if (progressText) {
    progressText.textContent = tomados + " de " + meta + " lugares · " + pct + "%";
  }
  var progressWrap = document.getElementById("js-progress-wrap");
  if (progressWrap) {
    progressWrap.setAttribute("aria-label",
      "Avance del Fondo Fundadores: " + tomados + " de " + meta + " lugares, " + pct + " por ciento");
  }
  var corte = document.getElementById("js-corte");
  if (corte && cfg.fechaCorte) {
    corte.textContent = "Al corte del " + formatoCorte(cfg.fechaCorte) +
      " · días y ritmo se calculan al momento.";
  }

  // — Contadores + barra: animan al entrar en pantalla —
  var avance = document.getElementById("avance");
  var fill = document.getElementById("js-progress");

  function dispara() {
    Object.keys(valores).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (reduceMotion) { el.textContent = String(valores[id]); }
      else { animaConteo(el, valores[id]); }
    });
    if (fill) fill.style.width = pct + "%";
  }

  if (avance && "IntersectionObserver" in window) {
    var visto = false;
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !visto) {
          visto = true;
          dispara();
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 }).observe(avance);
  } else {
    dispara();
  }

  // — Reveal de secciones —
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // — CTA de WhatsApp (config-driven) —
  var urlDisplay = cfg.urlDisplay || "";
  ["js-url-display", "js-url-display-final"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && urlDisplay) el.textContent = urlDisplay;
  });

  var numero = String(cfg.whatsapp || "").replace(/\D/g, "");
  if (numero) {
    var waHref = "https://wa.me/" + numero +
      "?text=" + encodeURIComponent(cfg.mensajeWhatsApp || "Quiero tomar mi lugar en La Nave.");
    var waCta = document.getElementById("js-wa-cta");
    var waFinal = document.getElementById("js-wa-cta-final");
    var alt = document.getElementById("js-cta-alt");
    if (waCta) {
      waCta.href = waHref;
      waCta.hidden = false;
      waCta.target = "_blank";
      waCta.rel = "noopener";
    }
    if (waFinal) {
      waFinal.href = waHref;
      waFinal.target = "_blank";
      waFinal.rel = "noopener";
      waFinal.textContent = "Toma tu lugar por WhatsApp";
    }
    if (alt) {
      alt.textContent = "También puedes registrarte en los dos cultos dominicales o con tu líder de grupo.";
    }
  }
})();
