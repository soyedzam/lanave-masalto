/* LA NAVE · comprobante de la causa — lightbox de un solo documento.
   Es aparte del de la galería a propósito: aquel maneja una colección con
   prev/next y su propio índice; mezclarlos metería el recibo entre las fotos.
   Sin JS el enlace abre la imagen directamente (por eso es <a>, no <button>). */

import { medir } from "./medir.js";

export function iniciarEvidencia() {
  const lb = document.getElementById("js-lb-evidencia");
  const enlace = document.getElementById("js-ev-ver");
  const acta = document.getElementById("js-ev-acta");
  if (!lb || !enlace) return;

  const cerrarBtn = lb.querySelector(".lb-cerrar");
  const img = lb.querySelector("img[data-src]");
  let ultimoFoco = null;

  /* Se trae la imagen al primer gesto de intención, para que al abrir ya esté. */
  function cargar() {
    if (img && !img.src) img.src = img.dataset.src;
  }
  ["pointerenter", "focusin", "touchstart"].forEach((ev) => {
    if (acta) acta.addEventListener(ev, cargar, { once: true, passive: true });
  });

  function abrir(origen) {
    cargar();
    ultimoFoco = document.activeElement;
    lb.classList.add("es-abierto");
    lb.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("lb-lock");
    cerrarBtn.focus();
    medir("evidencia", { origen });
  }

  function cerrar() {
    lb.classList.remove("es-abierto");
    lb.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("lb-lock");
    /* Devolver el foco a donde estaba; si se abrió sin foco (clic en la
       tarjeta), el enlace es el ancla razonable — nunca dejarlo en <body>. */
    const destino = (ultimoFoco && ultimoFoco !== document.body) ? ultimoFoco : enlace;
    if (destino && typeof destino.focus === "function") destino.focus();
  }

  enlace.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    abrir("enlace");
  });

  /* La tarjeta entera abre el comprobante — el enlace es el destino accesible. */
  if (acta) {
    acta.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      abrir("tarjeta");
    });
  }

  cerrarBtn.addEventListener("click", cerrar);
  lb.addEventListener("click", (e) => { if (e.target === lb) cerrar(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("es-abierto")) cerrar();
  });
}
