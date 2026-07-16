/* LA NAVE · galería bento + lightbox — fotos y videos reales.
   Las fotos salen del pozo de Cloudinary cuando está configurado en config.js
   (subir una foto la publica, sin tocar código); los videos y el respaldo viven
   en assets/galeria.json. El bento en index.html es el último respaldo no-JS /
   SEO: si todo falla, se conserva tal cual. Cada .g-item declara data-full
   (imagen) o data-video (mp4) o data-youtube y data-cap; el lightbox abre
   imagen o reproduce video, con prev/next/esc/clic-fuera. */

import { medir } from "./medir.js";
import { traerFotos } from "./cloudinary.js";

const CLASE_TAMANO = { big: "g-big", tall: "g-tall", wide: "g-wide" };

/** Construye un botón .g-item con DOM (sin innerHTML): foto o video. */
function crearItem(it) {
  const btn = document.createElement("button");
  btn.type = "button";
  const esReproducible = it.tipo === "video" || it.tipo === "youtube";
  btn.className = ["g-item", esReproducible ? "g-video" : "", CLASE_TAMANO[it.size] || ""]
    .filter(Boolean).join(" ");
  const cap = it.cap || "";
  btn.dataset.cap = cap;

  const img = document.createElement("img");
  img.loading = "lazy";
  img.decoding = "async";
  img.alt = it.alt || cap;

  const marca = document.createElement("span");
  marca.setAttribute("aria-hidden", "true");

  if (it.tipo === "youtube") {
    btn.dataset.youtube = it.id;
    img.src = it.poster || "";
    marca.className = "g-play";
  } else if (it.tipo === "video") {
    btn.dataset.video = it.src;
    img.src = it.poster || "";
    marca.className = "g-play";
  } else {
    btn.dataset.full = it.full || it.src;
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
    if (it.dataset.youtube) {
      const f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + it.dataset.youtube +
        "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
      f.title = texto || "Video de La Nave";
      f.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
      f.setAttribute("allowfullscreen", "");
      f.className = "lb-video";
      f.style.width = "min(92vw, 960px)";
      f.style.aspectRatio = "16 / 9";
      f.style.height = "auto";
      f.style.border = "0";
      medio.appendChild(f);
    } else if (it.dataset.video) {
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

/** El manifiesto del repo: fotos + videos, y respaldo si Cloudinary no contesta. */
async function traerManifiesto(src) {
  if (!src) return [];
  try {
    const r = await fetch(src);
    if (!r.ok) return [];
    const items = await r.json();
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/** Con el pozo encendido las fotos vienen de Cloudinary y los videos del
    manifiesto; sin él, manda el manifiesto entero. */
async function componer(src, cfg) {
  const [fotos, manifiesto] = await Promise.all([traerFotos(cfg), traerManifiesto(src)]);
  if (!fotos.length) return manifiesto;
  const videos = manifiesto.filter((it) => it.tipo === "video" || it.tipo === "youtube");
  return [...fotos, ...videos];
}

export async function iniciarGaleria() {
  const grid = document.getElementById("js-galeria");
  const lb = document.getElementById("js-lightbox");
  if (!grid || !lb) return;

  const cfg = (window.LANAVE && window.LANAVE.galeria) || {};
  const items = await componer(grid.dataset.src, cfg);
  // Sin items utilizables se conserva el bento del HTML como respaldo.
  if (items.length) construir(grid, items);
  cablear(grid, lb);
}
