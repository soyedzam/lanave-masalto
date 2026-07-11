/* LA NAVE · corte de campaña — EDITAR AQUÍ Y SOLO AQUÍ.
   Al actualizar el corte semanal: cambia `tomados` y `fechaCorte`, guarda y publica.
   Todo lo demás (disponibles, días, ritmo, % de avance) se calcula solo. */

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
  urlDisplay: "masalto.org/lanave"
};
