# Peñafiel & Ruta · Tienda digital

Catálogo premium de bebidas, adaptable a móvil y escritorio. La web funciona como catálogo y carrito de interés: **no muestra precios, no calcula totales y no procesa pagos**. El cliente envía su selección por WhatsApp para recibir información y disponibilidad.

## Estructura

```
/
├── index.html
├── tienda/
│   ├── index.html
│   ├── data/
│   │   ├── productos.json
│   │   └── frases-marcas.json
│   ├── css/
│   │   ├── tienda.css
│   │   ├── catalogo.css
│   │   ├── modal.css
│   │   └── carrito.css
│   └── js/
│       ├── config.js
│       ├── productos.js
│       ├── carrito.js
│       ├── modal.js
│       └── tienda.js
└── integracion/
    └── Code.gs
```

## Experiencia

- Portada premium azul noche y dorado.
- Catálogo organizado por marca.
- Modal de marca con pantalla de preparación de 4 segundos.
- Sabores agrupados con sus presentaciones en una misma tarjeta.
- Ficha de detalle y selección de producto.
- Carrito de interés con cantidades y opción de eliminar.
- Envío de la selección a WhatsApp.
- Sin precios, subtotales, totales ni cobro en línea.

## Conectar Google Sheets

1. Abre el Google Sheets original.
2. En **Extensiones → Apps Script**, sustituye el código por `integracion/Code.gs`.
3. Guarda y publica como **Aplicación web**, ejecutando como propietario y con acceso para cualquier persona.
4. Actualiza la implementación existente o crea una nueva versión.
5. Copia la URL terminada en `/exec` y colócala en `tienda/js/config.js`, propiedad `catalogApi`.
6. El servicio recorre todas las pestañas y publica solamente los campos de catálogo reconocidos: marca, sabor/producto, presentación, imagen, descripción e identificador. No publica columnas de precios, costos, clientes o ventas.

El lector reconoce encabezados como Marca, Sabor, Producto, Presentación, Tamaño, Formato, Imagen y Descripción. Para que un registro aparezca debe tener marca, sabor/producto y presentación. Si tu hoja utiliza otros encabezados, se ajusta el mapeo en `Code.gs`.

## Configurar WhatsApp

En `tienda/js/config.js`, sustituye `whatsapp` por el número de WhatsApp Business con código de país y lada, solo números. Ejemplo de formato: `5215512345678`.

## Publicación

La página principal está en `tienda/index.html`; el `index.html` raíz redirige a esa carpeta. Para GitHub Pages, configura la fuente de publicación en la rama `main` y carpeta raíz `/ (root)`.

## Estado de conexión

La URL de Apps Script configurada en el proyecto es la última que compartiste. La publicación del código nuevo de `integracion/Code.gs` requiere actualizar la implementación de Apps Script; subir el archivo a GitHub no cambia por sí solo el código publicado en Google.
