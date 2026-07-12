/* LA NAVE · galería bento + lightbox — fotos y videos reales, self-hosted.
   Cada .g-item declara data-full (imagen) o data-video (mp4) y data-cap.
   El lightbox abre imagen o reproduce video, con prev/next/esc/clic-fuera. */

import { medir } from "./medir.js";

export function iniciarGaleria() {
  const grid = document.getElementById("js-galeria");
  const lb = document.getElementById("js-lightbox");
  if (!grid || !lb) return;

  const items = Array.from(grid.querySelectorAll(".g-item"));
  const medio = lb.querySelector(".lb-medio");
  const cap = lb.querySelector(".lb-cap");
  const contador = lb.querySelector(".lb-contador");
  if (!items.length) return;

  let idx = 0;

  function bloquear(si) {
    document.documentElement.classList.toggle("lb-lock", si);
    const lenis = window.__lenis;
    if (lenis) { si ? lenis.stop() : lenis.start(); }
  }

  function mostrar(i) {
    idx = (i + items.length) % items.length;
    const it = items[idx];
    const texto = it.dataset.cap || "";
    medio.innerHTML = "";
    if (it.dataset.video) {
      const v = document.createElement("video");
      v.src = it.dataset.video;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.className = "lb-video";
      medio.appendChild(v);
    } else {
      const img = document.createElement("img");
      img.src = it.dataset.full;
      img.alt = texto;
      img.className = "lb-img";
      medio.appendChild(img);
    }
    cap.textContent = texto;
    contador.textContent = (idx + 1) + " / " + items.length;
  }

  function abrir(i) {
    mostrar(i);
    lb.classList.add("es-abierto");
    lb.setAttribute("aria-hidden", "false");
    bloquear(true);
  }

  function cerrar() {
    lb.classList.remove("es-abierto");
    lb.setAttribute("aria-hidden", "true");
    medio.innerHTML = "";
    bloquear(false);
  }

  items.forEach((it, i) => {
    it.addEventListener("click", () => { abrir(i); medir("galeria", { i }); });
  });

  lb.querySelector(".lb-cerrar").addEventListener("click", cerrar);
  lb.querySelector(".lb-prev").addEventListener("click", () => mostrar(idx - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => mostrar(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) cerrar(); });

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("es-abierto")) return;
    if (e.key === "Escape") cerrar();
    else if (e.key === "ArrowLeft") mostrar(idx - 1);
    else if (e.key === "ArrowRight") mostrar(idx + 1);
  });
}
