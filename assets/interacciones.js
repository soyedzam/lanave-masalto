/* LA NAVE · interacciones firma — magnético · tilt · spotlight.
   Capa de mejora pura: solo en punteros finos, sin movimiento reducido y fuera
   de modo lite (ahorro de datos / gama baja). Todo se limpia al salir; sin JS,
   en táctil o en gama baja, la página queda idéntica y usable. Comparte el
   lenguaje de motion (var(--ease-spring), var(--dur)). */

const mm = (q) => window.matchMedia(q).matches;

/* Detección de gama baja / ahorro de datos → se saltan los efectos pesados. */
export function esLite() {
  const c = navigator.connection || {};
  if (c.saveData) return true;
  if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 2) return true;
  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2) return true;
  return false;
}

/* Botones que se acercan sutilmente al cursor (usa `translate`, independiente
   del `transform` del hover/active, así no pelean). */
function magneticos() {
  const FUERZA = 0.28;
  const TOPE = 9; // px
  document.querySelectorAll(".btn").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const mx = Math.max(-TOPE, Math.min(TOPE, dx * FUERZA));
      const my = Math.max(-TOPE, Math.min(TOPE, dy * FUERZA));
      el.style.translate = mx.toFixed(1) + "px " + my.toFixed(1) + "px";
    });
    el.addEventListener("pointerleave", () => { el.style.translate = "0px 0px"; });
  });
}

/* Tarjetas con profundidad espacial: rotan levemente hacia el cursor. */
function tilt() {
  const MAX = 6; // grados
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    el.addEventListener("pointerenter", () => { el.style.transition = "transform 0s"; });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        "perspective(800px) rotateX(" + (-py * MAX).toFixed(2) + "deg) rotateY(" +
        (px * MAX).toFixed(2) + "deg) translateY(-5px)";
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = ""; // vuelve a la transición del CSS (spring)
      el.style.transform = "";
    });
  });
}

/* Luz que sigue al cursor en bandas oscuras — dirige la mirada al CTA. */
function spotlight() {
  document.querySelectorAll("[data-spotlight]").forEach((el) => {
    let raf = 0;
    let x = 50;
    let y = 50;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 100;
      y = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty("--sx", x.toFixed(1) + "%");
          el.style.setProperty("--sy", y.toFixed(1) + "%");
        });
      }
    });
    el.addEventListener("pointerenter", () => el.classList.add("es-lit"));
    el.addEventListener("pointerleave", () => el.classList.remove("es-lit"));
  });
}

export function iniciarInteracciones() {
  if (mm("(prefers-reduced-motion: reduce)")) return;
  if (!mm("(pointer: fine)")) return;
  if (esLite()) {
    document.documentElement.classList.add("es-lite");
    return;
  }
  magneticos();
  tilt();
  spotlight();
}
