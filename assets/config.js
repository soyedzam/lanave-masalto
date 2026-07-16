/* LA NAVE · corte de campaña — EDITAR AQUÍ Y SOLO AQUÍ.
   Al actualizar el corte semanal: cambia `tomados` y `fechaCorte`, guarda y publica.
   Todo lo demás (disponibles, días, ritmo, %, muro, cuenta regresiva) se calcula solo. */

window.LANAVE = {
  // — Corte de avance (actualizar con cada corte real) —
  tomados: 39,
  fechaCorte: "2026-07-14",

  // — Constantes de campaña —
  meta: 258,
  cierre: "2026-07-31",

  // — Precio por ladrillo (se muestra en el sitio; editar aquí) —
  precio: 3850,

  // — Conversión —
  // Número de WhatsApp del equipo en formato internacional, solo dígitos.
  // MX móvil: 52 + 10 dígitos, con el "1" de móvil → 521XXXXXXXXXX.
  // Si al probar el botón NO abre el chat, quita el "1" (deja 52 + 10 dígitos).
  whatsapp: "5219991300726", // Rodrigo Cedeño · líder de la causa · +52 999 130 0726
  mensajeWhatsApp: "Hola 👋 Quiero tomar mi lugar en La Nave.",

  // — URL que se muestra como referencia en la página —
  urlDisplay: "masalto.org/lanave",

  // — Texto del botón «Compártelo» (WhatsApp / hoja de compartir del teléfono) —
  compartir: "Más Alto: La Nave es el primer espacio propio de nuestra comunidad. 258 ladrillos la levantan — toma el tuyo 👉 masalto.org/lanave",

  // — Avance automático (opcional) —
  // URL de un JSON público con el corte vivo: {"tomados": 37, "fechaCorte": "2026-07-11"}
  // (Cloudflare Worker, Google Sheet publicado como JSON, etc.)
  // Vacío = manda el corte de arriba. Si la URL falla, también manda el de arriba.
  estadoRemoto: "",

  // — Medición (opcional) —
  // URL de un endpoint que reciba eventos anónimos del embudo (POST JSON).
  // Vacío = medición apagada. Nunca se envían datos personales.
  medicion: "",

  // — Galería viva (opcional) —
  // Pozo de fotos en Cloudinary: subes una foto con el tag y aparece sola en
  // la galería (~60s), sin tocar código ni publicar. Los videos siguen en
  // assets/galeria.json. Vacío = manda assets/galeria.json y nada cambia.
  //
  // El pozo es "realidades": lo comparten todas las marcas del portafolio.
  // Por eso el tag lleva el código de la entidad — CMA (Comunidad Más Alto)
  // en el Registro de Entidades — y así no se cruza con kids, arka o un
  // cliente. Convención del pozo: carpeta [cod]/[proyecto]/ + tag [cod]-[proyecto].
  //
  // Para ENCENDERLO, pon cloud: "realidades" cuando ya estén las dos cosas:
  //   1) en Settings > Security, "Resource list" DESTILDADO (viene restringido:
  //      si sigue tildado el endpoint da 401 y la galería cae a galeria.json),
  //   2) las fotos subidas con el tag de abajo.
  // Al subir, opcionales: context "caption" (pie), "alt" (accesible),
  // "orden" (posición); tag "destacada" = celda grande en el bento.
  galeria: {
    cloud: "",
    tag: "cma-lanave"
  }
};
