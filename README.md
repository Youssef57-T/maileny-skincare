# Maileny Skincare — Landing page

Página de una sola sección (HTML, CSS y JavaScript sin dependencias). Estilo neumórfico en rosa pastel.

## Cómo actualizar el contenido

Todo el contenido está en **`js/content.js`**. Ábrelo con cualquier editor de texto (Bloc de notas, VS Code) y cambia lo que está entre comillas.

| Quiero cambiar… | Busca en `content.js` |
|---|---|
| Número de WhatsApp | `contacto.whatsapp` (ej. `"18095551234"`) |
| Horario | `contacto.horario` |
| Promoción del mes | `promo` (pon `activa: false` para ocultarla) |
| Servicios | `servicios` (añade o borra bloques `{ ... },`) |
| Texto de “Sobre mí” | `sobreMi.parrafos` |
| Testimonios | `testimonios` |
| Preguntas frecuentes | `preguntas` |
| Fecha final de la promoción | `promo.hasta` (ej. `"2026-11-30"`; se oculta sola después) |

### Fotos
1. Guarda la foto en `assets/img/` (JPG, idealmente de menos de 400 KB).
2. Escribe su nombre en el campo `foto`, por ejemplo `foto: "limpieza-facial.jpg"`.
3. Si `foto` está vacío, se muestra un marco decorativo.

## Vista previa local
```
python -m http.server 4410
```
Luego abre http://localhost:4410

## Publicación
El sitio está en **https://maileny-skincare-bice.vercel.app/** (Vercel).
Cada cambio que se sube a la rama `main` de GitHub se publica solo. También se puede publicar desde esta carpeta con `npx vercel deploy --prod`.

Si algún día se usa un dominio propio (se añade en Vercel → Settings → Domains), cambia la dirección en `index.html` (`canonical`, `og:url`, `og:image`), `robots.txt` y `sitemap.xml`.

## Herramientas (opcionales)
- `python tools/make-images.py` — regenera `logo.webp` y la imagen para redes `og.jpg` a partir de `logo.png`.
- `node tools/mobile-check.mjs` — revisa la página en anchos de móvil (320–768 px): sin scroll horizontal, botones de al menos 44 px, sin errores, y el menú móvil. Necesita `python -m http.server 4410` corriendo en esta carpeta.

## Archivos
- `index.html` — estructura de la página
- `css/styles.css` — diseño (colores en `:root`)
- `js/content.js` — **contenido editable**
- `js/main.js` — funcionamiento (menú, galería, testimonios, WhatsApp)
- `assets/img/logo.png` — logotipo (extraído con `tools/extract-logo.py`); `logo.webp` y `og.jpg` se generan con `tools/make-images.py`
- `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest` — archivos para buscadores y la publicación
