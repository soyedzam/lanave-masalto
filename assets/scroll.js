/* LA NAVE · scroll ultra-suave (Lenis) + barra de progreso.
   Lenis desplaza la ventana de forma nativa y suavizada, así que la travesía
   (que lee window.scrollY) y los IntersectionObserver siguen funcionando —
   solo que ahora todo se siente sedoso. Con movimiento reducido: scroll normal. */

import Lenis from "./vendor/lenis.js";

export function iniciarScroll() {
  const barra = document.getElementById("js-progreso");
  const raiz = document.documentElement;

  function progreso() {
    if (!barra) return;
    const max = raiz.scrollHeight - raiz.clientHeight;
    const p = max > 0 ? raiz.scrollTop / max : 0;
    barra.style.transform = "scaleX(" + p.toFixed(4) + ")";
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", progreso, { passive: true });
    progreso();
    return;
  }

  const lenis = new Lenis({
    lerp: 0.085,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5
  });

  lenis.on("scroll", progreso);

  function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* enlaces internos: salto suave con Lenis (los CTA de WhatsApp no aplican) */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const dest = document.querySelector(id);
      if (dest) {
        e.preventDefault();
        lenis.scrollTo(dest);
      }
    });
  });

  progreso();
}
