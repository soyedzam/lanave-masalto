/* LA NAVE · galería bento + lightbox — fotos y videos reales, self-hosted.
   Fuente de la verdad: assets/galeria.json (edítalo para actualizar la galería
   sin tocar el HTML). El bento en index.html es el RESPALDO no-JS / SEO: si el
   fetch del manifiesto falla, se conserva tal cual. Cada .g-item declara
   data-full (imagen) o data-video (mp4) y data-cap; el lightbox abre imagen o
   reproduce video, con prev/next/esc/clic-fuera. */

import { medir } from "./medir.js";

const CLASE_TAMANO = { big: "g-big", tall: "g-tall", wide: "g-wide" };

/** Construye un botón .g-item con DOM (sin innerHTML): foto o video. */
function crearItem(it) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = ["g-item", it.tipo === "video" ? "g-video" : "", CLASE_TAMANO[it.size] || ""]
    .filter(Boolean).join(" ");
  const cap = it.cap || "";
  btn.dataset.cap = cap;

  const img = document.createElement("img");
  img.loading = "lazy";
  img.decoding = "async";
  img.alt = it.alt || cap;

  const marca = document.createElement("span");
  marca.setAttribute("aria-hidden", "true");

  if (it.tipo === "video") {
    btn.dataset.video = it.src;
    img.src = it.poster || "";
    marca.className = "g-play";
  } else {
    btn.dataset.full = it.src;
    img.src = it.src;
    marca.className = "g-lupa";
  }
  btn.append(img, marca);
  return btn;
}

/** Reemplaza el contenido del bento con los items del manifiesto. */
function construir(grid, items) {
  const frag = document.createDocumentFragment();
  items.forEach((it) => frag.appendChild(crearItem(it)));
  grid.replaceChildren(frag);
}

/** Cablea el lightbox sobre los .g-item presentes (del JSON o del HTML). */
function cablear(grid, lb) {
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

export function iniciarGaleria() {
  const grid = document.getElementById("js-galeria");
  const lb = document.getElementById("js-lightbox");
  if (!grid || !lb) return;

  const src = grid.dataset.src;
  if (!src) { cablear(grid, lb); return; }

  fetch(src)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
    .then((items) => { if (Array.isArray(items) && items.length) construir(grid, items); })
    .catch(() => { /* se conserva el bento del HTML como respaldo */ })
    .finally(() => cablear(grid, lb));
}
