/* ASISTENTE FLOTANTE — aparece ocasionalmente a izquierda o derecha. */
(function () {
  "use strict";
  var C=window.CONFIG||{}, FOTO="img/robot%20red%20bull.webp";
  var KEY_NOMBRE="ruta1371_nombre_negocio_v1";
  function nombreCliente(){
    try{return (localStorage.getItem(KEY_NOMBRE)||"").trim();}catch(e){return "";}
  }
  function saludo(){
    var nombre=nombreCliente();
    return nombre ? "¡Hola, "+nombre+"! 👋😊" : "¡Hola! 👋😊";
  }
  function url(mensaje){return "https://wa.me/"+(C.whatsapp||"")+"?text="+encodeURIComponent(mensaje);}
  function mensajeBase(consulta){
    return saludo()+"\n\nVengo del catálogo web de Grupo Peñafiel 🥤. Me interesa conocer más sobre lo siguiente:\n\n• "+
      (consulta||"Indícanos en qué podemos ayudarte")+
      "\n\n¿Me puedes apoyar con información sobre mi problemática? 🙌\n\n¡Muchas gracias! 😊";
  }
  function ocupado(){
    var carga=document.getElementById("pantalla-carga"), anuncio=document.getElementById("anuncio");
    return document.hidden || document.body.classList.contains("sin-scroll") ||
      document.body.classList.contains("bienvenida-activa") ||
      (carga&&!carga.hidden) || (anuncio&&!anuncio.hidden) ||
      document.body.classList.contains("en-marca");
  }
  var flota=document.createElement("div"); flota.className="robot";
  flota.innerHTML=
    '<section class="robot__panel" hidden aria-label="Asistente de ventas">'+
      '<header class="chat-header"><span>Asistente Peñafiel</span><button class="robot__cerrar" type="button" aria-label="Cerrar">×</button></header>'+
      '<div class="chat-window"><ul class="message-list" aria-live="polite">'+
        '<li class="mensaje mensaje--asistente">¡Hola! 👋😊 Soy tu asistente de ventas de Ruta 1371. ¿En qué podemos ayudarte hoy? 🥤</li>'+
      '</ul></div>'+
      '<form class="chat-input"><input class="message-input" type="text" maxlength="500" autocomplete="off" placeholder="Cuéntanos en qué podemos ayudarte..." aria-label="Tu consulta">'+
      '<button class="send-button" type="submit">Enviar por WhatsApp</button></form>'+
      '<p class="robot__nota">Tu mensaje se abrirá en WhatsApp para que tu asesor pueda atenderte.</p>'+
    '</section>'+
    '<button class="robot__boton" type="button" aria-label="Abrir asistente de ventas"><span class="robot__nube">¿Te ayudo? 👋</span><img src="'+FOTO+'" alt=""></button>';
  document.body.appendChild(flota);
  var panel=flota.querySelector(".robot__panel"), form=flota.querySelector(".chat-input"),
      input=flota.querySelector(".message-input"), lista=flota.querySelector(".message-list");
  var reloj=null, abierto=false, conversacion=[];
  function programar(ms){clearTimeout(reloj);reloj=setTimeout(ciclo,ms);}
  function elegirLado(){
    var izquierda = Math.random() < 0.5;
    flota.classList.toggle("robot--izquierda", izquierda);
    flota.dataset.lado = izquierda ? "izquierda" : "derecha";
  }
  function ocultar(){
    flota.classList.remove("robot--visible","robot--nube");
    programar(45000+Math.floor(Math.random()*45000));
  }
  function ciclo(){
    if(abierto)return;
    if(ocupado()){programar(7000);return;}
    elegirLado();
    flota.classList.add("robot--visible");
    setTimeout(function(){if(!abierto)flota.classList.add("robot--nube");},650);
    reloj=setTimeout(function(){if(!abierto)ocultar();},11000);
  }
  function abrir(){
    abierto=true;clearTimeout(reloj);panel.hidden=false;
    flota.classList.add("robot--visible","robot--panel");flota.classList.remove("robot--nube");
    setTimeout(function(){input.focus();},80);
  }
  function cerrar(){
    abierto=false;panel.hidden=true;flota.classList.remove("robot--panel");
    clearTimeout(reloj);reloj=setTimeout(ocultar,1200);
  }
  function burbuja(texto,clase){
    var li=document.createElement("li");li.className="mensaje "+clase;li.textContent=texto;
    lista.appendChild(li);lista.parentNode.scrollTop=lista.parentNode.scrollHeight;
  }
  form.addEventListener("submit",function(e){
    e.preventDefault();var texto=input.value.trim();if(!texto)return;
    conversacion.push(texto);burbuja(texto,"mensaje--usuario");input.value="";
    var mensaje=mensajeBase(conversacion.join("; "));
    var a=document.createElement("a");a.href=url(mensaje);a.target="_blank";a.rel="noopener";a.style.display="none";
    document.body.appendChild(a);a.click();a.remove();
    burbuja("¡Listo! 😊 Abrí WhatsApp con tu consulta para que tu asesor pueda atenderte. 🙌","mensaje--asistente");
  });
  flota.querySelector(".robot__boton").addEventListener("click",function(){if(abierto)cerrar();else abrir();});
  flota.querySelector(".robot__cerrar").addEventListener("click",cerrar);
  programar(30000);

  var boton=document.getElementById("contacto-boton"),nube=document.getElementById("contacto-nube");
  function actualizarContacto(){
    if(!boton)return;
    var listaProductos=window.Pedido&&window.Pedido.lista?window.Pedido.lista():[];
    if(listaProductos.length&&window.Whatsapp){
      boton.href=window.Whatsapp.url(listaProductos);
    }else{
      boton.href=url(mensajeBase(""));
    }
  }
  if(boton){
    actualizarContacto();
    boton.addEventListener("click",function(){actualizarContacto();});
    if(window.Pedido&&window.Pedido.alCambiar)window.Pedido.alCambiar(actualizarContacto);
  }
  if(nube){
    function ver(){nube.classList.add("contacto__nube--ver");setTimeout(function(){nube.classList.remove("contacto__nube--ver");},3500);}
    setTimeout(ver,2000);setInterval(ver,9000);
  }
})();
