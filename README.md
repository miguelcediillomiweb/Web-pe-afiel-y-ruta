# Web Peñafiel y Ruta — tienda de bebidas

La tienda vive dentro de `/tienda/` y mantiene su código aislado del resto del sitio.

## Estructura
- `index.html`: entrada que dirige a la tienda.
- `tienda/index.html`: página de la tienda.
- `tienda/css/`: estilos separados por responsabilidad.
- `tienda/js/`: lógica separada por responsabilidad.
- `tienda/data/productos.json`: catálogo editable, una fila por presentación.
- `tienda/data/frases-marcas.json`: frases de carga por marca.

## Agrupación del catálogo
Los productos se agrupan automáticamente por marca y sabor. Cada combinación marca+sabor se muestra en una sola tarjeta; sus tamaños aparecen como opciones dentro de esa tarjeta. Por ejemplo, una naranjada con cinco tamaños ocupa una sola tarjeta.

## Ventana emergente
Al elegir una marca, se abre un modal con una pantalla de carga de 4 segundos. Después muestra los productos de esa marca. Las frases son editables en `data/frases-marcas.json`. La X y el botón Cerrar permiten salir sin abandonar la página.

## Actualizar productos
Editar `data/productos.json`. Cada presentación debe tener:
`id, marca, sabor, tamano, precio, imagen, descripcion`.
No dupliques tarjetas manualmente: el sistema agrupa por `marca+sabor`.

## Publicación
GitHub Pages debe configurarse desde Settings → Pages → Deploy from a branch → main → /(root).

## Pendiente de completar
El enlace de Google Sheets facilitado no se pudo leer desde esta conexión. El archivo `productos.json` queda preparado, pero vacío para no inventar productos, precios ni marcas. Cuando se facilite el XLSX/CSV o un enlace publicado accesible, se importará el catálogo real.
