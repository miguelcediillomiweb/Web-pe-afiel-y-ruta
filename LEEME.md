# Web de bebidas · Grupo Peñafiel — guía de carpetas

Cada cosa va en su carpeta. Si algo no se ve, revisa que el **nombre del archivo sea exactamente igual** (minúsculas, sin espacios, con guion).

## 1. Dónde va cada imagen y video

| Qué es | Carpeta y nombre | Cómo debe ser |
|---|---|---|
| Video del banner principal | `video/banner.mp4` | MP4, horizontal (1280×720), 10–20 s, menos de 8 MB. Se reproduce solo, en bucle y sin sonido |
| Placa con todos los productos | `img/placa-productos.png` | PNG con fondo transparente, unos 900 px de ancho |
| Logos de las 12 marcas | `img/logos/` | PNG con fondo transparente, unos 400 px de ancho |
| Pósters de la pantalla de carga | `img/carga/` | JPG vertical (1080×1920), menos de 300 KB |
| 5 imágenes del anuncio "Tendencia" | `img/tendencia/` | JPG, unos 800 px de ancho: `tendencia-1.jpg` … `tendencia-5.jpg` |
| Camión del reloj | `img/camion.png` | Incluido en el ZIP; subir manualmente si no aparece |

### Nombres de los 12 logos
`aguafiel.png`, `snapple.png`, `clamato.png`, `dr-pepper.png`, `orange-crush.png`, `energetizante.png`, `rc-cola.png`, `schweppes.png`, `agua-mineral.png`, `penafiel-twist.png`, `penafiel-sabores.png`, `penafiel-adas.png`.

## 2. Google Sheets (hoja "Grupo peñafiel")
- Pestaña **Marcas**: `Logo`, `Eslogan` y `Cartel`.
- Pestaña **Productos**: marca, producto, precios, piezas por caja y presentación.
- Compartir como **"cualquier persona con el enlace"**.

## 3. Archivos de configuración
- Ruta 1371, textos, WhatsApp, orden de marcas, tiempos y anuncios: `js/config.js`.
- Colores y tipografías: `css/base.css`.
- Banner, reloj y camión: `css/hero.css`, `css/reloj.css`, `css/escena.css`.
- Carrusel, marcas y pie: `css/carrusel.css`, `css/marcas.css`, `css/pie.css`.
- Productos: `css/productos.css`.
- Carga, anuncio y lista: `css/carga.css`, `css/anuncio.css`, `css/lista.css`.

## 4. Estructura
```
index.html
LEEME.md
css/ (12 archivos)
js/ (15 archivos)
img/ camion.png, placa-productos.png, logos/, carga/, tendencia/
video/ banner.mp4
```
