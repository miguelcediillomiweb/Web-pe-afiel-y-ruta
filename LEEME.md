# Web de bebidas · Grupo Peñafiel — guía de carpetas

Cada cosa va en su carpeta. Si algo no se ve, revisa que el **nombre del archivo
sea exactamente igual** (minúsculas, sin espacios, con guion).

## 1. Dónde va cada imagen y video

| Qué es | Carpeta y nombre | Cómo debe ser |
|---|---|---|
| Video del banner principal | `video/banner.mp4` | MP4, horizontal (1280×720), 10–20 s, menos de 8 MB. Se reproduce solo, en bucle y sin sonido |
| Placa con todos los productos | `img/placa-productos.png` | PNG con fondo transparente, unos 900 px de ancho |
| Logos de las 12 marcas | `img/logos/` | PNG con fondo transparente, unos 400 px de ancho (nombres abajo) |
| Pósters de la pantalla de carga | `img/carga/` | JPG vertical (1080×1920), menos de 300 KB. El nombre se escribe en la columna **Cartel** de la hoja |
| 5 imágenes del anuncio "Tendencia" | `img/tendencia/` | JPG, unos 800 px de ancho: `tendencia-1.jpg` … `tendencia-5.jpg` |
| Camión del reloj | `img/camion.png` | Ya está puesto |

### Nombres de los 12 logos (carpeta `img/logos/`)
`aguafiel.png` · `snapple.png` · `clamato.png` · `dr-pepper.png` · `orange-crush.png` ·
`energetizante.png` · `rc-cola.png` · `schweppes.png` · `agua-mineral.png` ·
`penafiel-twist.png` · `penafiel-sabores.png` · `penafiel-adas.png`

## 2. Google Sheets (hoja "Grupo peñafiel")
- Pestaña **Marcas**: `Logo` (nombre del archivo del logo), `Eslogan` (la frase de la pantalla de carga),
  `Cartel` (nombre del póster que está en `img/carga/`, por ejemplo `penafiel-adas.jpg`).
- Pestaña **Productos**: marca, producto, precios, piezas por caja y presentación.
- La hoja debe estar compartida como **"cualquier persona con el enlace"**.

## 3. Qué archivo cambiar para…
| Quiero cambiar… | Archivo |
|---|---|
| Ruta 1371, textos del banner y del pie, fecha de "Última actualización" | `js/config.js` |
| Número de WhatsApp y el mensaje de saludo | `js/config.js` |
| Orden de las marcas | `js/config.js` (`ordenMarcas`) |
| Segundos del carrusel y de la pantalla de carga | `js/config.js` |
| Nombres de las imágenes del anuncio, texto y cada cuánto sale (120 s = 2 min) | `js/config.js` |
| Colores y tipografías de toda la web | `css/base.css` |
| Banner principal, reloj, camión | `css/hero.css`, `css/reloj.css`, `css/escena.css` |
| Carrusel, marcas, pie | `css/carrusel.css`, `css/marcas.css`, `css/pie.css` |
| Tarjetas de productos | `css/productos.css` |
| Pantalla de carga, anuncio, lista | `css/carga.css`, `css/anuncio.css`, `css/lista.css` |

## 4. Estructura completa
```
index.html
LEEME.md
css/    base · hero · reloj · escena · carrusel · marcas · pie · carga · productos · pedido · anuncio · lista
js/     config · agrupar · datos · reloj · escena · marcas · carrusel · pedido · carga · productos
        · whatsapp · lista · barra · anuncio · app
img/    camion.png · placa-productos.png · logos/ · carga/ · tendencia/
video/  banner.mp4
```
