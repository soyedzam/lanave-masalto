/* LA NAVE · corte de campaña — EDITAR AQUÍ Y SOLO AQUÍ.
   Al actualizar el corte semanal: cambia `tomados` y `fechaCorte`, guarda y publica.
   Todo lo demás (disponibles, días, ritmo, %, muro, cuenta regresiva) se calcula solo. */

window.LANAVE = {
  // — Corte de avance (actualizar con cada corte real) —
  tomados: 37,
  fechaCorte: "2026-07-11",

  // — Constantes de campaña —
  meta: 258,
  cierre: "2026-07-31",

  // — Conversión —
  // Número de WhatsApp del equipo en formato internacional, solo dígitos.
  // Ejemplo: "5219991234567". Vacío = los CTA llevan a la sección de pasos.
  whatsapp: "",
  mensajeWhatsApp: "Hola 👋 Quiero tomar mi lugar en La Nave.",

  // — URL que se muestra como referencia en la página —
  urlDisplay: "masalto.org/lanave",

  // — Texto del botón «Compártelo» (WhatsApp / hoja de compartir del teléfono) —
  compartir: "Más Alto: La Nave es el primer espacio propio de nuestra comunidad. 258 lugares la levantan — toma el tuyo 👉 masalto.org/lanave",

  // — Avance automático (opcional) —
  // URL de un JSON público con el corte vivo: {"tomados": 37, "fechaCorte": "2026-07-11"}
  // (Cloudflare Worker, Google Sheet publicado como JSON, etc.)
  // Vacío = manda el corte de arriba. Si la URL falla, también manda el de arriba.
  estadoRemoto: "",

  // — Medición (opcional) —
  // URL de un endpoint que reciba eventos anónimos del embudo (POST JSON).
  // Vacío = medición apagada. Nunca se envían datos personales.
  medicion: ""
};
