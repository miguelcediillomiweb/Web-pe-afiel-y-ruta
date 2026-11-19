/* ============================================================
   CONFIGURACIÓN — aquí se cambia lo que cambia seguido.
   No hace falta tocar ningún otro archivo para esto.
   ============================================================ */
window.CONFIG = {
  /* Google Sheets (debe estar compartido como "cualquier persona con el enlace") */
  sheetId: "1Sx-vyhqTJKcNEs6nHqrlLoQ59Dle3zF6jKgg-KJnSXk",
  hojaMarcas: "Marcas",
  hojaProductos: "Productos",

  /* ---------- Notificaciones (OneSignal): pega aquí tu App ID ---------- */
  onesignalAppId: "",
  onesignalSegundos: 25,

  /* WhatsApp: lada del país + número, sin espacios ni signos (52 = México) */
  whatsapp: "525665470369",
  mensajeInicio: "¡Hola! 👋😊 Visité tu web de Grupo Peñafiel 🥤✨ y me interesan estos productos. ¿Me das más informes, por favor? 🚚",

  /* Carpetas y archivos de imágenes y video */
  carpetaLogos: "img/logos/",
  carpetaCarga: "img/carga/",
  carpetaProductos: "img/productos/",

  /* ---------- Líneas de productos ---------- 
     La línea sin empieza ni contiene recibe todo lo que no entró a las demás. */
  lineas: {
    "orange-crush": [
      { nombre: "Crush", logo: "crush.png", empieza: ["CRUSH"] },
      { nombre: "Orange", logo: "orange-crush.png" }
    ],
    "energetizante": [
      { nombre: "Venom", logo: "energetizante2.png", empieza: ["VENOM"] },
      { nombre: "Red Bull", logo: "energetizante.png", empieza: ["RB"] }
    ],
    "schweppes": [
      { nombre: "Schweppes", logo: "schweppes.png" },
      { nombre: "Mineral", logo: "schmin.png", contiene: ["AGUA MINERAL"] },
      { nombre: "Ginger Ale", logo: "ginger-ale.png", contiene: ["GINGER ALE"] },
      { nombre: "Mocktails", logo: "schsin.png", contiene: ["MOCKTAILS"] }
    ],
    "penafiel-adas": [
      { nombre: "Adas", logo: "penafiel-adas.png" },
      { nombre: "Adas sin azúcar", logo: "adas sin.png", contiene: ["LIGHT"] }
    ],
    "penafiel-sabores": [
      { nombre: "Sabores", logo: "penafiel-sabores.png" },
      { nombre: "Sabores sin azúcar", logo: "sabor sin.png", contiene: ["LIGHT"] }
    ],
    "penafiel-twist": [
      { nombre: "Twist", logo: "penafiel-twist.png" },
      { nombre: "Coco", logo: "coco.png", contiene: ["COCO"] }
    ],
    "agua-mineral": [
      { nombre: "Soft Seltzer", logo: "soft.png", contiene: ["SOFT SELTZER"] },
      { nombre: "Mineral", logo: "agua-mineral.png" }
    ],
  },
  videoBanner: "video/banner.mp4",
  imagenPlaca: "img/placa-productos.png",

  /* Pantalla de carga al abrir una marca (segundos) — siguiente paso */
  cargaSegundos: 3.5,

  /* Nombre de la tarjeta cuando el producto no trae sabor (ej. "DR PEPPER 600 ml") */
  nombreOriginal: "Original",

  /* ---------- Banner principal ---------- */
  tituloBienvenida: "Bienvenidos a la web de Grupo Peñafiel",
  ruta: "Ruta 1371",                       /* si cambia la ruta, se cambia aquí */
  mensajeGracias: "Gracias por visitarnos",

  /* ---------- Anuncio emergente "Tendencia" ----------
     Son solo 5 imágenes. Se suben a la carpeta img/tendencia/ y aquí se
     escriben sus nombres (si subes menos o más, ajusta la lista).
     Cada vez que aparece muestra la siguiente imagen. */
  carpetaAnuncios: "img/tendencia/",
  anuncios: ["tendencia 1.jpg", "tendencia 2.jpg", "tendencia 3.jpg", "tendencia 4.jpg", "tendencia 5.jpg"],
  textoAnuncio: "Prueba los nuevos productos tendencia en Peñafiel",
  anuncioSegundos: 5,          /* cuánto dura abierto (con cuenta de 5 a 1) */
  anuncioRetraso: 1.2,         /* segundos que espera después de abrir la web */
  anuncioCadaSegundos: 120,    /* se vuelve a mostrar cada 2 minutos de navegar */
  /* ---------- Clima de la escena (Open-Meteo, gratis y sin clave) ---------- */
  clima: { latitud: 19.71, longitud: -98.97, cadaMinutos: 15 },

  /* ---------- Carrusel de logos ---------- */
  carruselSegundos: 2.5,
  ultimaActualizacion: "septiembre 2026",  /* cambiarlo cada vez que cambien los precios */

  /* ---------- Marcas ----------
     Orden de arriba hacia abajo (de la menos conocida a la más conocida).
     Se escribe el nombre de la marca como aparece en la hoja, en minúsculas y con guiones. */
  tituloMarcas: "Selecciona una marca y conócela",
  ordenMarcas: [
    "aguafiel", "snapple", "clamato", "dr-pepper", "energetizante", "schweppes",
    "orange-crush", "rc-cola", "penafiel-sabores", "penafiel-twist",
    "agua-mineral", "penafiel-adas"
  ],

  /* ---------- Pie de página ---------- */
  pieTitulo: "Sitio web de productos de Grupo Peñafiel",
  pieCreador: "Creado y diseñado por Miguel",
  pieHecho: "Hecho con todo el",
  pieDerechos: "Todos los derechos reservados"
};
