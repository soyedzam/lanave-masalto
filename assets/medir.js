/* LA NAVE · medición del embudo — anónima y opcional.
   Sin endpoint en config.js la función es un no-op. Cero datos personales,
   cero cookies, cero almacenamiento: solo evento + momento + página. */

const endpoint = String((window.LANAVE || {}).medicion || "").trim();

export function medir(evento, datos) {
  if (!endpoint) return;

  const carga = JSON.stringify({
    evento: String(evento || ""),
    datos: datos || {},
    pagina: location.pathname,
    t: Date.now()
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([carga], { type: "application/json" }));
    } else {
      fetch(endpoint, { method: "POST", body: carga, keepalive: true, headers: { "Content-Type": "application/json" } });
    }
  } catch (e) {
    /* la medición jamás rompe la página */
  }
}

/* Mide una sola vez cuando el elemento entra en pantalla. */
export function medirAlVer(el, evento, umbral) {
  if (!el || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entradas, obs) => {
    entradas.forEach((en) => {
      if (en.isIntersecting) {
        medir(evento);
        obs.disconnect();
      }
    });
  }, { threshold: umbral || 0.35 });
  io.observe(el);
}
