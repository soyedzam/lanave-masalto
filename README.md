# La Nave · Fondo Fundadores — Web v1.0

Landing de campaña de **Comunidad Más Alto** (Mérida, Yucatán).
Sitio estático: HTML + CSS + JS vanilla, sin build, sin dependencias.

## Actualizar el corte de avance (lo único que se toca)

Editar [`assets/config.js`](assets/config.js):

```js
tomados: 37,              // ← lugares tomados al corte
fechaCorte: "2026-07-11", // ← fecha del corte
```

Guardar, commit y push a `main` — GitHub Pages publica solo.
Disponibles, %, días restantes y ritmo/día **se calculan solos**.

## Activar el CTA de WhatsApp

En `assets/config.js`, poner el número del equipo (formato internacional, solo dígitos):

```js
whatsapp: "5219991234567",
```

Con número: todos los CTA abren WhatsApp con mensaje precargado.
Sin número: los CTA llevan a la sección de pasos (registro presencial).

## Dominio

- **Hoy:** https://soyedzam.github.io/lanave-masalto/
- **Meta:** `lanave.comunidadmasalto.org` → requiere en el DNS de `comunidadmasalto.org`
  un registro **CNAME** `lanave` → `soyedzam.github.io`, y luego fijar el custom domain
  en Settings → Pages del repo (o archivo `CNAME`). Al cutover, actualizar `og:url`
  y `og:image` en `index.html` al dominio final.

## Reglas de marca aplicadas

- Lugares, no pesos — la página no muestra cifras en dinero.
- Carbón `#2B2A26` manda · naranja `#F29100` solo como chispa (CTA/acento).
- Cormorant Garamond (display) + Inter (texto).
- La Nave endosa a Más Alto — lockup con el logo arriba/primero.

*Diseño y estrategia: Soul Lens Estudios · Powered by Startup Explorers.*
