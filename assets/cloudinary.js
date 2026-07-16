/* LA NAVE · Cloudinary — el pozo de fotos.
   Ed sube una foto con el tag de la galería y aparece sola: no hay que tocar
   código ni hacer push. El endpoint público de listado
   (res.cloudinary.com/<cloud>/image/list/<tag>.json) se refresca a los ~60s.

   Requiere que "Resource list" esté DESTILDADO en Settings > Security de la
   cuenta; si no, el endpoint responde 404 y la galería cae al manifiesto local.

   Convenciones al subir (todas opcionales):
   · context "caption" → el pie de foto        · context "alt" → alt accesible
   · context "orden"   → posición manual       · tag "destacada" → celda grande
   Sin orden, manda lo más reciente. */

const BASE = "https://res.cloudinary.com";
const ANCHO_CELDA = 800;   // el bento nunca pinta más grande que esto
const ANCHO_FULL = 1600;   // el lightbox sí

/** Ratios que disparan una celda ancha o alta en el bento. */
const RATIO_WIDE = 1.5;
const RATIO_TALL = 0.8;

/** URL de entrega: f_auto/q_auto negocian AVIF o WebP y cuidan el presupuesto. */
function url(cloud, r, ancho) {
  const t = `f_auto,q_auto,w_${ancho},c_limit`;
  return `${BASE}/${cloud}/image/upload/${t}/v${r.version}/${r.public_id}.${r.format}`;
}

/** El tamaño en el bento sale de la forma real de la foto, no de un campo extra. */
function tamano(r) {
  if (Array.isArray(r.tags) && r.tags.includes("destacada")) return "big";
  const ratio = r.width && r.height ? r.width / r.height : 1;
  if (ratio >= RATIO_WIDE) return "wide";
  if (ratio <= RATIO_TALL) return "tall";
  return "";
}

function contexto(r) {
  return (r.context && r.context.custom) || {};
}

/** Orden manual si viene en el context; si no, al final (lo rige la fecha). */
function orden(r) {
  const o = Number(contexto(r).orden);
  return Number.isFinite(o) ? o : Number.POSITIVE_INFINITY;
}

function fecha(r) {
  const t = Date.parse(r.created_at || "");
  return Number.isFinite(t) ? t : 0;
}

/** Traduce un recurso de Cloudinary al item que entiende galeria.js. */
function aItem(cloud, r) {
  const ctx = contexto(r);
  const cap = ctx.caption || "";
  return {
    tipo: "foto",
    src: url(cloud, r, ANCHO_CELDA),
    full: url(cloud, r, ANCHO_FULL),
    cap,
    alt: ctx.alt || cap,
    size: tamano(r),
  };
}

/**
 * Trae las fotos del tag. Devuelve [] ante cualquier fallo — la galería nunca
 * se queda vacía por esto: quien llama conserva su respaldo.
 * @param {{cloud: string, tag: string}} cfg
 * @returns {Promise<Array<object>>}
 */
export async function traerFotos(cfg) {
  const cloud = cfg && cfg.cloud;
  const tag = cfg && cfg.tag;
  if (!cloud || !tag) return [];

  try {
    const r = await fetch(`${BASE}/${cloud}/image/list/${tag}.json`);
    if (!r.ok) return [];
    const data = await r.json();
    const recursos = Array.isArray(data && data.resources) ? data.resources : [];
    return recursos
      .filter((x) => x && x.public_id && x.version && x.format)
      .slice()
      .sort((a, b) => orden(a) - orden(b) || fecha(b) - fecha(a))
      .map((x) => aItem(cloud, x));
  } catch {
    return [];
  }
}
