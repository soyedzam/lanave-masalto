/* LA NAVE · secuencia de video — encadena los 3 clips en loop.
   Autoplay mudo al entrar en pantalla (política de navegadores), pausa al salir.
   Con movimiento reducido: no autoplay, controles nativos. */

import { medir } from "./medir.js";

const CLIPS = [
  "assets/video/nave-01-carpa.mp4",
  "assets/video/nave-02-hijos.mp4",
  "assets/video/nave-03-cada-lugar.mp4"
];

export function iniciarVideo() {
  const v = document.getElementById("js-video");
  if (!v) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = 0;

  function cargar(idx, reproducir) {
    i = idx;
    v.src = CLIPS[idx];
    v.load();
    if (reproducir) v.play().catch(function () {});
  }

  /* al terminar un clip, encadena el siguiente (loop de la serie) */
  v.addEventListener("ended", function () {
    cargar((i + 1) % CLIPS.length, true);
  });

  if (reduce) {
    v.controls = true;
    v.src = CLIPS[0];
    return;
  }

  v.muted = true;
  v.setAttribute("muted", "");
  v.src = CLIPS[0];

  if ("IntersectionObserver" in window) {
    let visto = false;
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          v.play().catch(function () {});
          if (!visto) { visto = true; medir("video_visto"); }
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.4 }).observe(v);
  } else {
    v.play().catch(function () {});
  }

  /* toggle de sonido (para presentaciones) */
  const btn = document.getElementById("js-video-sonido");
  if (btn) {
    btn.addEventListener("click", function () {
      v.muted = !v.muted;
      const conSonido = !v.muted;
      btn.setAttribute("aria-pressed", String(conSonido));
      btn.textContent = conSonido ? "Silenciar" : "Activar sonido";
      if (conSonido) { v.play().catch(function () {}); medir("video_sonido"); }
    });
  }
}
