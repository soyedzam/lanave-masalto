/* LA NAVE · travesía cinematográfica — el scroll construye la nave.
   La escena SVG vive en el HTML con su ESTADO FINAL visible (sin JS o con
   movimiento reducido se ve la nave completa). Con movimiento permitido,
   este módulo la "des-construye" al inicio y la levanta acto por acto:
   I terreno · II estructura · III cubierta · IV vida.

   Cada elemento animable declara:
     data-anim="draw|fade|rise"   qué le pasa
     data-ini / data-fin          tramo [0..1] del progreso de la sección

   El trazo usa la longitud real (getTotalLength) vía atributos SVG —
   nada de dasharray en px por CSS, que rasteriza punteado y cuesta caro.
   Las medidas de la sección se cachean: cero lecturas de layout por frame. */

import { medir } from "./medir.js";

const ACTOS = [0, 0.21, 0.49, 0.73, 0.87]; // umbrales de los 5 subtítulos

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function seg(p, ini, fin) {
  return clamp01((p - ini) / (fin - ini));
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function longitudDe(el) {
  try {
    if (typeof el.getTotalLength === "function") return el.getTotalLength();
  } catch (e) { /* elemento sin geometría medible */ }
  return 0;
}

function aplicar(a, t) {
  if (a.tipo === "draw") {
    a.el.setAttribute("stroke-dashoffset", String((1 - t) * a.len));
  } else if (a.tipo === "fade") {
    a.el.style.opacity = String(t * a.op);
  } else if (a.tipo === "rise") {
    const e = easeOut(t);
    a.el.style.opacity = String(Math.min(1, t * 1.6) * a.op);
    a.el.style.transform = "translateY(" + ((1 - e) * 24).toFixed(1) + "px)";
  }
}

export function iniciarTravesia() {
  const seccion = document.getElementById("travesia");
  if (!seccion) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const captions = Array.from(seccion.querySelectorAll(".t-caption"));

  if (reduceMotion) {
    /* sin scrub: queda el modo estático por defecto —
       escena completa + subtítulos apilados y legibles */
    return;
  }

  /* modo cine: la sección crece y el escenario se ancla */
  seccion.classList.add("es-cine");

  const animados = Array.from(seccion.querySelectorAll("[data-anim]")).map((el) => {
    const tipo = el.dataset.anim;
    const a = {
      el,
      tipo,
      ini: Number(el.dataset.ini) || 0,
      fin: Number(el.dataset.fin) || 1,
      op: Number(el.dataset.op) || Number(el.getAttribute("opacity")) || 1,
      len: 0
    };
    if (tipo === "draw") {
      a.len = longitudDe(el) || 1;
      el.setAttribute("stroke-dasharray", String(a.len));
    }
    return a;
  });

  /* estado inicial: todo por construir */
  animados.forEach((a) => aplicar(a, 0));

  const linea = seccion.querySelector(".t-linea i");
  let actoActivo = -1;
  let finMedido = false;

  /* medidas cacheadas: se leen solo al inicio y al redimensionar */
  let topSeccion = 0;
  let recorrido = 1;

  function mide() {
    topSeccion = seccion.offsetTop;
    recorrido = Math.max(1, seccion.offsetHeight - window.innerHeight);
  }

  function pintaCaption(idx) {
    if (idx === actoActivo) return;
    actoActivo = idx;
    captions.forEach((c, i) => c.classList.toggle("es-activa", i === idx));
  }

  let ultimo = -1;
  let pedido = false;

  function cuadro() {
    pedido = false;
    const p = clamp01((window.scrollY - topSeccion) / recorrido);
    if (Math.abs(p - ultimo) < 0.0005) return;
    ultimo = p;

    animados.forEach((a) => aplicar(a, seg(p, a.ini, a.fin)));

    if (linea) linea.style.transform = "scaleX(" + p.toFixed(4) + ")";

    let idx = 0;
    for (let i = ACTOS.length - 1; i >= 0; i--) {
      if (p >= ACTOS[i]) { idx = i; break; }
    }
    pintaCaption(idx);

    if (p > 0.985 && !finMedido) {
      finMedido = true;
      medir("travesia_completa");
    }
  }

  function alScroll() {
    if (!pedido) {
      pedido = true;
      requestAnimationFrame(cuadro);
    }
  }

  function alResize() {
    mide();
    ultimo = -1;
    alScroll();
  }

  window.addEventListener("scroll", alScroll, { passive: true });
  window.addEventListener("resize", alResize, { passive: true });
  mide();
  cuadro();
}
