/* LA NAVE · extras de firma — cursor de marca (aura) + easter egg (Konami).
   Capa de deleite pura. El cursor NATIVO nunca se oculta (usabilidad primero):
   el aura solo lo acompaña. Todo respeta reduced-motion y modo lite; sin JS o
   en táctil/gama baja, no pasa nada y la página queda idéntica. */

const mm = (q) => window.matchMedia(q).matches;

/* — Aura que sigue al cursor (suave, no reemplaza al puntero) — */
function cursorAura() {
  const aura = document.createElement("div");
  aura.className = "cursor-aura";
  aura.setAttribute("aria-hidden", "true");
  document.body.appendChild(aura);

  let x = window.innerWidth / 2, y = window.innerHeight / 2, ax = x, ay = y, visible = false;
  const INTERACTIVOS = "a, button, summary, .g-item, [data-tilt]";

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    x = e.clientX; y = e.clientY;
    if (!visible) { visible = true; aura.classList.add("es-visible"); }
  }, { passive: true });
  window.addEventListener("pointerdown", () => aura.classList.add("es-press"));
  window.addEventListener("pointerup", () => aura.classList.remove("es-press"));
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest && e.target.closest(INTERACTIVOS)) aura.classList.add("es-activo");
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest && e.target.closest(INTERACTIVOS)) aura.classList.remove("es-activo");
  });

  function raf() {
    ax += (x - ax) * 0.18;
    ay += (y - ay) * 0.18;
    aura.style.transform = "translate3d(" + ax.toFixed(1) + "px," + ay.toFixed(1) + "px,0) translate(-50%,-50%)";
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* — Easter egg: código Konami → La Nave se levanta — */
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

function easterEgg() {
  let i = 0;
  window.addEventListener("keydown", (e) => {
    const ae = document.activeElement;
    if (ae && /^(input|textarea|select)$/i.test(ae.tagName)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    if (k === KONAMI[i]) {
      i++;
      if (i === KONAMI.length) { i = 0; lanzar(); }
    } else {
      i = (k === KONAMI[0]) ? 1 : 0;
    }
  });
}

function lanzar() {
  if (document.querySelector(".egg")) return;
  const egg = document.createElement("div");
  egg.className = "egg";
  egg.setAttribute("aria-hidden", "true");

  let embers = "";
  for (let n = 0; n < 44; n++) {
    const left = (Math.random() * 100).toFixed(1);
    const size = (2 + Math.random() * 4).toFixed(1);
    const dur = (2.4 + Math.random() * 2.6).toFixed(2);
    const delay = (Math.random() * 1.3).toFixed(2);
    embers += '<i style="left:' + left + '%;width:' + size + 'px;height:' + size +
      'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's"></i>';
  }
  egg.innerHTML = '<div class="egg-embers">' + embers + '</div><p class="egg-msg">La&nbsp;Nave se levanta.</p>';
  document.body.appendChild(egg);
  requestAnimationFrame(() => egg.classList.add("es-vivo"));
  setTimeout(() => {
    egg.classList.remove("es-vivo");
    setTimeout(() => egg.remove(), 800);
  }, 3400);
}

export function iniciarExtras() {
  if (mm("(prefers-reduced-motion: reduce)")) return;
  if (document.documentElement.classList.contains("es-lite")) return;
  easterEgg();
  if (mm("(pointer: fine)")) cursorAura();
}
