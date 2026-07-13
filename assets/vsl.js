/* LA NAVE · VSL — el video de la visión carga solo al clic (lazy facade).
   El póster + botón viven en el DOM; el iframe pesado de YouTube (nocookie)
   se inyecta apenas el usuario decide verlo, así el LCP y el performance no
   pagan el costo del embed. Sin JS: el póster queda como imagen legible. */

import { medir } from "./medir.js";

export function iniciarVsl() {
  const btn = document.getElementById("js-vsl");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const id = btn.dataset.video;
    if (!id) return;

    const frame = document.createElement("div");
    frame.className = "vsl-frame";

    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + id +
      "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
    iframe.title = "La visión de La Nave — Pastor Joel y Rodrigo Cedeño";
    iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
    iframe.setAttribute("allowfullscreen", "");
    iframe.loading = "lazy";

    frame.appendChild(iframe);
    btn.replaceWith(frame);
    medir("vsl_play", { id });
  }, { once: true });
}
