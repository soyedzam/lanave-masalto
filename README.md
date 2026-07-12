# La Nave · Fondo Fundadores — Web v2.0

Experiencia de campaña de **Comunidad Más Alto** (Mérida, Yucatán).
Sitio estático: HTML + CSS + JS vanilla (módulos ES), sin build, sin dependencias.
Peso total ~120 KB (≈20 KB gzip el crítico).

## La experiencia

1. **Hero** — chips vivos: lugares tomados + días al cierre.
2. **La travesía** — el scroll construye La Nave en 4 actos (terreno → estructura
   18×18 → cubierta climatizada → la vida adentro). Escena SVG tipo plano; con
   `prefers-reduced-motion` o sin JS se muestra la nave terminada y los textos apilados.
3. **El Muro de los 258** — 258 celdas dibujan la fachada (hastial 2·6·10·14 +
   12 filas de 18 + fila de puerta 5+5; la puerta queda abierta). Se enciende de
   abajo hacia arriba con el conteo real. Sin nombres: solo datos del corte.
4. **Contadores + barra con hitos** (50/75/90%) + cuenta regresiva viva (d hh:mm:ss).
5. **Barra de zarpe** — cierre + countdown + CTA, fija tras el hero.
6. Fondo Fundadores · 3 pasos · compartir (hoja nativa/WhatsApp) · FAQ · cierre.

## Actualizar el corte de avance (lo único que se toca)

Editar [`assets/config.js`](assets/config.js):

```js
tomados: 37,              // ← lugares tomados al corte
fechaCorte: "2026-07-11", // ← fecha del corte
```

Guardar, commit y push a `main` — GitHub Pages publica solo.
Disponibles, %, días, ritmo/día, muro, hitos y countdown **se calculan solos**.

## Activar el CTA de WhatsApp

```js
whatsapp: "5219991234567",   // número del equipo, solo dígitos
```

Con número: todos los CTA (header, hero, travesía, muro, pasos, zarpe, cierre)
abren WhatsApp con mensaje precargado. Sin número: llevan a la sección de pasos.

## Avance automático (opcional · muro sin redeploy)

```js
estadoRemoto: "https://…/corte.json",
```

Contrato del JSON: `{"tomados": 37, "fechaCorte": "2026-07-11"}` (CORS abierto,
`GET`). Sirve un Cloudflare Worker/KV o un Google Sheet publicado. Si la URL
falla o tarda >2.5 s, manda el corte local de `config.js` — nunca rompe la página.

## Medición (opcional · anónima)

```js
medicion: "https://…/eventos",
```

`POST` JSON por `sendBeacon`: `{evento, datos, pagina, t}`. Eventos: `carga`,
`travesia_completa`, `muro_visto`, `muro_celda`, `cta` (origen), `compartir`,
`faq`, `pasos_vistos`, `zarpe_cerrada`. **Cero datos personales, cero cookies.**
Sin endpoint, la medición está apagada.

## Videos (self-hosted, sin YouTube)

Los 3 clips (720p, H.264, ~2 MB c/u) viven en `assets/video/` y se encadenan
en loop en la sección "La Nave en movimiento". Autoplay **mudo** al entrar en
pantalla (política de navegadores), pausa al salir, botón de sonido para
presentaciones. Con `prefers-reduced-motion`: sin autoplay, controles nativos.

Para cambiar/añadir clips: reemplaza los `.mp4` en `assets/video/` y ajusta el
arreglo `CLIPS` en [`assets/video.js`](assets/video.js). Mantén 16:9 y peso bajo
(&lt;3 MB por clip). El póster (`assets/video-poster.jpg`) es el primer frame.

## Arquitectura

```
index.html            estructura + escena SVG de la travesía (estado final inline)
assets/
├── config.js         ← lo único editable (corte, WhatsApp, remoto, medición)
├── datos.js          estado derivado + sincronización remota con fallback
├── travesia.js       scroll-scrub de la escena (draw/fade/rise por tramos)
├── muro.js           genera las 258 celdas-fachada y su encendido
├── cuenta.js         countdown, contadores, barra, hitos, chips
├── medir.js          embudo anónimo (no-op sin endpoint)
├── main.js           orquestador (reveals, CTAs, compartir, zarpe, FAQ)
├── styles.css        base v1 (tokens, bandas, tarjetas, FAQ)
└── experiencia.css   travesía, muro, zarpe, chips
```

## Dominio

- **Hoy:** https://soyedzam.github.io/lanave-masalto/
- **Meta:** `lanave.comunidadmasalto.org` → CNAME `lanave` → `soyedzam.github.io`
  en el DNS de `comunidadmasalto.org`, fijar custom domain en Settings → Pages
  (o archivo `CNAME`). Al cutover, actualizar `og:url`/`og:image` en `index.html`.

## Reglas de marca aplicadas

- Lugares, no pesos — la página no muestra cifras en dinero (ni el código las conoce).
- Carbón `#2B2A26` manda · naranja `#F29100` solo chispa · bronce `#B8862F` lo fino.
- Cormorant Garamond (display) + Inter (texto).
- La Nave endosa a Más Alto — lockup con el logo arriba/primero.
- Nada inventado: sin ticker falso de actividad, sin nombres sin consentimiento.

*Diseño y estrategia: Soul Lens Estudios · Powered by Startup Explorers.*
