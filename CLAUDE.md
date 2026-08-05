# CLAUDE.md — CMA · La Nave (Comunidad Más Alto) · CASCO WEB
> Este repo es un **casco**, no el canon. El canon vive en EL ASTILLERO.
> *La fragua produce; el taller archiva.* No se combate. Se construye.

## 1 · Dónde estás
| | |
|---|---|
| **Realidad** | `CMA` — Comunidad Más Alto (este casco es el proyecto **La Nave**) |
| **Capa** | 🌍 Comunidades → `06_COMUNIDADES/CMA_Mas-Alto/` en el hub |
| **Repo** | `soyedzam/lanave-masalto` · rama `main` |
| **Stack** | **HTML/CSS/JS estático — sin build, sin `package.json`.** No inventes uno. |
| **Vivo en** | `lanave.comunidadmasalto.org` (dominio propio + HTTPS · `CNAME` en la raíz) |
| **Páginas** | `index.html` · `avance.html` · `galeria-videos.html` · `qr.html` |

**Hub (el cerebro):** `~/Documents/2026/EL ASTILLERO`
Si no lo tienes montado, dilo y detente: sin canon no se escribe.

⚠️ Este repo aparece también anidado dentro del hub
(`06_COMUNIDADES/CMA_Mas-Alto/Trabajo/lanave-web/`, ignorado por el `.gitignore` del canon).
`[VALIDAR]` Si existen dos copias en disco, **trabaja siempre en `~/Dev/CMA/lanave-web`**
y avisa a Ed del duplicado — el código nunca vive bajo `~/Documents` (iCloud corrompe `.git`).

## 2 · El canon manda — se LEE antes de escribir, nunca de memoria
| Tarea | Doc en el hub |
|---|---|
| Nombrar archivos | `00_EMPIEZA-AQUI/ECO_OPS_DOC_Nomenclatura-Canon_260801_v1.3.md` |
| Dónde cae cada archivo (**el YAML manda**) | `_SISTEMA/SIS_GEN_DAT_Reglas-de-Archivado_260801_v1.4.yaml` |
| Voz y vocabulario | `00_EMPIEZA-AQUI/ECO_OPS_DOC_Lexico-Canon_260627_v1.0.md` |
| Códigos `[COD]` de las Realidades | `00_EMPIEZA-AQUI/SIS_GEN_IDX_Registro-de-Entidades_260731_v2.3.md` |
| **Crear una Realidad nueva** (el árbol y los 8 pasos) | `_SISTEMA/SIS_GEN_DOC_Realidad-en-Caja_260703_v1.0.md` |
| Capacitar a un chat/agente externo | `_SISTEMA/SIS_GEN_PRM_Pase-de-Abordaje-Chats_260801_v1.3.md` |

## 3 · El motor
Toda tarea web arranca en **`/webforge`** (M7 · powered by Xplorers Startups): stack canon,
ductería compartida, Leyes Pagadas y ritual de verificación. No improvises un casco nuevo.

## 4 · Qué se queda aquí y qué se va al hub
- **Aquí (casco):** HTML, CSS, JS, contenido del sitio.
- **Al hub (canon):** estrategia, copy aprobado, informes, bitácoras, briefs — con **pasaporte**
  y nombre canon `[COD]_[AREA]_[TIPO]_[Slug]_[YYMMDD]_v[X.Y].ext`.
  `AREA`: MKT · GEN · OPS · EST — `TIPO`: **lista cerrada** (DOC · MAN · PLN · PLANO · RUMBO ·
  PRM · SOP · FICHA · DAT · IDX · INF · EXP · CONV · BITACORA · PULSO · MIS · OPE · MODULO).
  **No acuñes TIPOs.** Si no cabe, usa el más cercano y escribe
  `TIPO PROPUESTO: [XXX] — requiere alta del Taller`.
- El estado (`borrador`/`vigente`) **nunca** va en el nombre: va en el pasaporte.

## 5 · Commits
- **Conventional commits, en español:** `feat(scope): …` · `fix:` · `perf:` · `chore:`
- Solo si el commit es parte de una corrida del Taller: `YYMMDD_ADR-E_Ciudad · descripción`
- Se commitea y se hace push **cuando Ed lo pide**. Si estás en `main`, avisa antes.

## 6 · Assets pesados → Drive, jamás al repo
`~/Library/CloudStorage/GoogleDrive-soyedzam@gmail.com/Mi unidad/ACTIVOS/06_COMUNIDADES/CMA_Mas-Alto/`
En `assets/` van solo las imágenes ya optimizadas que el sitio sirve.
⚠️ Drive e iCloud crean duplicados `" 2"` y restauran carpetas borradas: verifica antes y después.

## 7 · Voz — innegociable
- ❌ Nunca lenguaje de guerra ni religioso en lo público. El camino es suave, nunca predicando.
- ✅ Se construye, se cruza, se acompaña. Humano: libertad, familia, paz, comunidad.
- Nunca inventes datos, cifras ni testimonios. Lo no confirmado → `[VALIDAR]`.
- Miembros del equipo **solo por código** — jamás nombre civil.
- Datos de personas de la comunidad → jamás a GitHub.

## 8 · Propio de este casco
- **El avance de la campaña se edita en `assets/config.js`** — ahí, no en el HTML.
- Otros módulos: `assets/muro.js` · `assets/cuenta.js` · `assets/cloudinary.js`.
- 🔴 Ed tiene **Reducir Movimiento** activo en su iPhone: la narrativa debe correr siempre;
  solo el adorno respeta la preferencia, más un botón para encenderlo. Prueba con
  `reducedMotion: 'reduce'` — si el contenido desaparece con eso, está mal.

## 9 · Verificar antes de cantar victoria
No hay build: se abre el HTML y **se comprueba con navegador**, nunca solo con `curl`
(un `curl` con cache-buster da falso verde). Para QA de scroll usa **playwright-core
con `channel: chrome`** — el pane integrado captura negro y renderiza a 0×0, y todo
`.reveal` parece roto sin estarlo.

---
*CMA · La Nave · casco web · Pase de Casco v1.0 · 5·ago·2026* 🕊️
