/* LA NAVE · hero como experiencia — profundidad 3D reactiva al cursor.
   Cada capa con [data-parallax="N"] se desplaza N px según la posición del
   puntero (suavizado con lerp). Usa la propiedad CSS `translate` (independiente
   de `transform`), así no pelea con las animaciones de kenburns/deriva.
   En táctil: deriva suave automática. Con movimiento reducido: nada. */

const AMORTIGUA = 0.065; // suavizado del seguimiento
const DERIVA_MS = 7000;  // ciclo de la deriva automática (táctil)

export function iniciarHero() {
  const hero = document.getElementById("inicio");
  if (!hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const capas = Array.from(hero.querySelectorAll("[data-parallax]")).map((el) => ({
    el,
    depth: parseFloat(el.dataset.parallax) || 0,
    tx: 0,
    ty: 0
  }));
  if (!capas.length) return;

  let objX = 0;
  let objY = 0; // objetivo normalizado -0.5..0.5
  let finoPuntero = false;

  function alMover(e) {
    const r = hero.getBoundingClientRect();
    objX = (e.clientX - r.left) / r.width - 0.5;
    objY = (e.clientY - r.top) / r.height - 0.5;
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    finoPuntero = true;
    hero.addEventListener("pointermove", alMover, { passive: true });
    hero.addEventListener("pointerleave", () => { objX = 0; objY = 0; });
  }

  let inicio = null;
  function cuadro(ts) {
    if (!finoPuntero) {
      // deriva suave automática en táctil / sin puntero fino
      if (inicio === null) inicio = ts;
      const t = ((ts - inicio) % DERIVA_MS) / DERIVA_MS;
      objX = Math.sin(t * Math.PI * 2) * 0.22;
      objY = Math.cos(t * Math.PI * 2) * 0.14;
    }
    capas.forEach((c) => {
      c.tx += (objX * c.depth - c.tx) * AMORTIGUA;
      c.ty += (objY * c.depth - c.ty) * AMORTIGUA;
      c.el.style.setProperty("--px", c.tx.toFixed(2) + "px");
      c.el.style.setProperty("--py", c.ty.toFixed(2) + "px");
    });
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
}
