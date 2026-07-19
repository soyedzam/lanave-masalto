/* LA NAVE · estado de campaña: deriva todo del corte en config.js
   y, si hay `estadoRemoto`, lo sincroniza con fallback silencioso al corte local. */

const MS_DIA = 86400000;
const REMOTO_TIMEOUT_MS = 2500;

function fechaLocal(iso) {
  // Fecha "civil" (sin zona): evita corrimientos de un día por UTC.
  const p = String(iso || "").split("-").map(Number);
  return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
}

function hoyLocal() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function formatoFecha(iso) {
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                 "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const f = fechaLocal(iso);
  return f.getDate() + " de " + meses[f.getMonth()] + " de " + f.getFullYear();
}

function derivar(cfg) {
  const meta = cfg.meta || 250;
  const tomados = Math.max(0, Math.min(meta, Number(cfg.tomados) || 0));
  const disponibles = meta - tomados;
  const dias = Math.max(0, Math.round((fechaLocal(cfg.cierre) - hoyLocal()) / MS_DIA));
  const ritmo = dias > 0 ? Math.ceil(disponibles / dias) : disponibles;
  const pct = Math.round((tomados / meta) * 1000) / 10;
  const cierreFin = (() => {
    const f = fechaLocal(cfg.cierre);
    return new Date(f.getFullYear(), f.getMonth(), f.getDate(), 23, 59, 59);
  })();

  return {
    meta,
    tomados,
    disponibles,
    dias,
    ritmo,
    pct,
    siguiente: Math.min(tomados + 1, meta),
    completo: tomados >= meta,
    fechaCorte: cfg.fechaCorte,
    cierre: cfg.cierre,
    cierreFin
  };
}

const cfg = window.LANAVE || {};
let estadoActual = derivar(cfg);
const oyentes = [];

export function estado() {
  return estadoActual;
}

export function alCambiar(fn) {
  oyentes.push(fn);
}

function avisar() {
  oyentes.forEach((fn) => {
    try { fn(estadoActual); } catch (e) { /* un renderer roto no tumba al resto */ }
  });
}

/* — Sincronización opcional con corte remoto (muro automático) — */
export async function sincronizar() {
  const url = String(cfg.estadoRemoto || "").trim();
  if (!url) return;

  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const temporizador = ctrl ? setTimeout(() => ctrl.abort(), REMOTO_TIMEOUT_MS) : null;

  try {
    const r = await fetch(url, { signal: ctrl ? ctrl.signal : undefined, cache: "no-store" });
    if (!r.ok) return;
    const j = await r.json();
    const tomados = Number(j && j.tomados);
    if (!Number.isFinite(tomados) || tomados < 0) return;

    const nuevaCfg = {
      ...cfg,
      tomados,
      fechaCorte: typeof j.fechaCorte === "string" && j.fechaCorte ? j.fechaCorte : cfg.fechaCorte
    };
    estadoActual = derivar(nuevaCfg);
    avisar();
  } catch (e) {
    /* silencio: el corte local de config.js manda */
  } finally {
    if (temporizador) clearTimeout(temporizador);
  }
}
