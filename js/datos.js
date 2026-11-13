/* ============================================================
   DATOS — lectura y validación de Google Sheets.
   ============================================================ */
(function () {
  "use strict";
  var C = window.CONFIG;

  function urlHoja(hoja) {
    return "https://docs.google.com/spreadsheets/d/" + encodeURIComponent(C.sheetId) +
      "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(hoja);
  }
  function parsearCSV(texto) {
    var filas=[],fila=[],celda="",comillas=false;
    texto=String(texto||"").replace(/^\uFEFF/,"");
    for(var i=0;i<texto.length;i++){
      var c=texto[i];
      if(comillas){
        if(c==='"'&&texto[i+1]==='"'){celda+='"';i++;}
        else if(c==='"')comillas=false;
        else celda+=c;
      }else if(c==='"')comillas=true;
      else if(c===","){fila.push(celda);celda="";}
      else if(c==="\n"||c==="\r"){
        if(c==="\r"&&texto[i+1]==="\n")i++;
        fila.push(celda);celda="";if(fila.some(function(x){return x.trim()!=="";}))filas.push(fila);fila=[];
      }else celda+=c;
    }
    if(celda!==""||fila.length){fila.push(celda);if(fila.some(function(x){return x.trim()!=="";}))filas.push(fila);}
    return filas;
  }
  function leerHoja(hoja) {
    var control=new AbortController();
    var reloj=setTimeout(function(){control.abort();},15000);
    return fetch(urlHoja(hoja),{signal:control.signal,cache:"no-store"})
      .then(function(r){
        if(!r.ok)throw new Error("Google Sheets respondió HTTP "+r.status+" al leer la pestaña «"+hoja+"».");
        return r.text();
      }).then(function(texto){
        clearTimeout(reloj);
        if(!texto||/<!doctype html|<html|accounts\.google\.com/i.test(texto.slice(0,500)))
          throw new Error("Google no entregó los datos de «"+hoja+"». Comparte el archivo como «Cualquier persona con el enlace» y verifica que la pestaña se llame exactamente «"+hoja+"».");
        var filas=parsearCSV(texto);
        if(!filas.length)throw new Error("La pestaña «"+hoja+"» está vacía o no se pudo interpretar.");
        var cabecera=filas.shift().map(function(c){return c.trim();});
        return filas.map(function(f){var o={};cabecera.forEach(function(c,i){o[c]=(f[i]||"").trim();});return o;});
      }).catch(function(e){
        clearTimeout(reloj);
        if(e.name==="AbortError")throw new Error("Se agotó el tiempo al consultar la pestaña «"+hoja+"». Revisa tu conexión.");
        if(e instanceof TypeError)throw new Error("No se pudo conectar con Google Sheets. Comprueba tu conexión y que la hoja esté publicada/compartida para lectura.");
        throw e;
      });
  }
  function cargarDatos(){
    if(!C||!C.sheetId) return Promise.reject(new Error("Falta el ID de Google Sheets en js/config.js."));
    return Promise.all([leerHoja(C.hojaMarcas),leerHoja(C.hojaProductos)]).then(function(r){
      var marcas=r[0],productos=r[1];
      if(!marcas.length)throw new Error("La pestaña Marcas no contiene registros.");
      if(!productos.length)throw new Error("La pestaña Productos no contiene registros.");
      if(!Object.prototype.hasOwnProperty.call(marcas[0],"Marca"))throw new Error("En la pestaña Marcas falta el encabezado «Marca». Encabezados encontrados: "+Object.keys(marcas[0]).join(", "));
      if(!Object.prototype.hasOwnProperty.call(productos[0],"Marca")||!Object.prototype.hasOwnProperty.call(productos[0],"Producto"))
        throw new Error("En la pestaña Productos deben existir los encabezados «Marca» y «Producto». Encabezados encontrados: "+Object.keys(productos[0]).join(", "));
      return window.Agrupar.armar(marcas,productos,{carpetaLogos:C.carpetaLogos,nombreOriginal:C.nombreOriginal});
    });
  }
  window.Datos={cargarDatos:cargarDatos,parsearCSV:parsearCSV};
})();