/* ════════════════════════════════════════════════════════════
   CONFIGURACIÓN — este es el único archivo que editas para
   cambiar datos del negocio. Los colores y el diseño están en
   css/estilos.css.
   ════════════════════════════════════════════════════════════ */
window.CONFIG = {

  /* Nombre que aparece arriba en la página */
  negocio: "Grupo Peñafiel",

  /* WhatsApp que recibe los mensajes. Con lada de país (52 = México).
     Si solo escribes los 10 dígitos, la web agrega el 52 sola. */
  whatsapp: "525665470369",

  /* Primera línea del mensaje. Después van los productos. */
  saludo: "Hola, me interesan estos productos de tu web:",

  /* Enlaces de tu Google Sheets publicado como CSV (una pestaña cada uno).
     Si cambias de Sheet, pega aquí los enlaces nuevos. */
  hojas: {
    marcas:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4E7_jE7ryFWegwGmobYx1VKK5dWNOoZyAwreWEpb6vKtjdlIg3mec1_N37GGJnZcVAm2ogUl7Hndf/pub?gid=0&single=true&output=csv",
    productos:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4E7_jE7ryFWegwGmobYx1VKK5dWNOoZyAwreWEpb6vKtjdlIg3mec1_N37GGJnZcVAm2ogUl7Hndf/pub?gid=1164525736&single=true&output=csv"
  },

  /* Carpeta donde están los logos. Los nombres de archivo salen de la
     columna "Logo" de la pestaña Marcas. */
  carpetaLogos: "logos/",

  /* true = debajo de cada producto se ve el precio y las piezas de la caja.
     false = solo se ve el precio al público. */
  mostrarCaja: true,

  /* Lo que se muestra cuando un producto no tiene precio en el Sheet */
  textoPrecioFaltante: "Consultar precio",

  /* Palabras que deben quedar siempre en mayúsculas al limpiar los nombres
     (el Sheet viene todo en mayúsculas). Agrega aquí las que falten. */
  siglas: ["PET", "RB", "RC", "VNR", "VR", "S&C"],

  /* Color de cada marca (el acento de su sección y de sus botones).
     La clave es el nombre de la marca tal como está en el Sheet. */
  colorBase: "#f2b33d",
  colores: {
    "AGUAFIEL": "#4aa8e0",
    "SNAPPLE": "#e5483f",
    "CLAMATO": "#d63b57",
    "DR PEPPER": "#c4414f",
    "ORANGE CRUSH": "#f58a1f",
    "ENERGETIZANTE": "#e8d03a",
    "RC COLA": "#e8453c",
    "SCHWEPPES": "#f2c230",
    "AGUA MINERAL": "#62c8d8",
    "PEÑAFIEL TWIST": "#76c64f",
    "PEÑAFIEL SABORES": "#f0709a",
    "PEÑAFIEL ADAS": "#f5ac3d"
  }
};
