/* ASISTENTE FLOTANTE — el robot guía al contacto; el formulario se abre desde el botón inferior. */
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
  function url(mensaje){
    return "https://wa.me/"+(C.whatsapp||"")+"?text="+encodeURIComponent(mensaje);
  }
  function mensajeBase(consulta){
    return saludo()+"\n\nVengo del catálogo web de Grupo Peñafiel 🥤. Me gustaría recibir información sobre lo siguiente:\n\n"+
      consulta+"\n\n¿Me puedes apoyar con información, por favor? 🙌\n\n¡Muchas gracias! 😊";
  }
  function ocupado(){
    var carga=document.getElementById("pantalla-carga"), anuncio=document.getElementById("anuncio");
    return document.hidden || document.body.classList.contains("sin-scroll") ||
      document.body.classList.contains("bienvenida-activa") ||
      (carga&&!carga.hidden) || (anuncio&&!anuncio.hidden) ||
      document.body.classList.contains("en-marca");
  }

  var flota=document.createElement("div"); flota.className="robot";
  flota.innerHTML='<button class="robot__boton" type="button" aria-label="Ir a contacto con tu asesor"><span class="robot__nube">¿Te ayudo? 👋</span><img src="'+FOTO+'" alt=""></button>';
  document.body.appendChild(flota);
  var reloj=null;
  function programar(ms){clearTimeout(reloj);reloj=setTimeout(ciclo,ms);}
  function elegirLado(){
    var izquierda=Math.random()<0.5;
    flota.classList.toggle("robot--izquierda",izquierda);
  }
  function ocultar(){
    flota.classList.remove("robot--visible","robot--nube");
    programar(45000+Math.floor(Math.random()*45000));
  }
  function ciclo(){
    if(ocupado()){programar(7000);return;}
    elegirLado();
    flota.classList.add("robot--visible");
    setTimeout(function(){if(flota.classList.contains("robot--visible"))flota.classList.add("robot--nube");},650);
    reloj=setTimeout(ocultar,11000);
  }

  var boton=document.getElementById("contacto-boton");
  var contacto=document.getElementById("contacto");
  var fila=document.querySelector(".contacto__fila");
  var nube=document.getElementById("contacto-nube");
  var panel=document.createElement("section");
  panel.className="robot__panel contacto__consulta";
  panel.hidden=true;
  panel.setAttribute("aria-label","Escribe tu consulta para tu asesor");
  panel.innerHTML=
    '<header class="chat-header"><span>Asistente Peñafiel 🥤</span><button class="robot__cerrar" type="button" aria-label="Cerrar">×</button></header>'+
    '<div class="chat-window"><p class="mensaje mensaje--asistente">¡Hola! 👋😊 Cuéntanos qué información necesitas sobre nuestros productos y con gusto te atenderemos.</p></div>'+
    '<form class="chat-input"><textarea class="message-input" maxlength="700" rows="3" required placeholder="Escribe aquí tu consulta..." aria-label="Tu consulta"></textarea>'+
    '<button class="send-button" type="submit">Enviar por WhatsApp</button></form>'+
    '<p class="robot__nota">Tu consulta se abrirá en WhatsApp para que puedas enviársela a tu asesor.</p>';
  if(fila)fila.appendChild(panel);
  var form=panel.querySelector(".chat-input"), input=panel.querySelector(".message-input");
  function abrirConsulta(){
    if(!panel.hidden){input.focus();return;}
    panel.hidden=false;
    if(boton)boton.setAttribute("aria-expanded","true");
    panel.scrollIntoView({behavior:"smooth",block:"center"});
    setTimeout(function(){input.focus({preventScroll:true});},350);
  }
  function cerrarConsulta(){
    panel.hidden=true;
    if(boton)boton.setAttribute("aria-expanded","false");
  }
  panel.querySelector(".robot__cerrar").addEventListener("click",cerrarConsulta);
  if(boton)boton.addEventListener("click",abrirConsulta);
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var texto=input.value.trim();
    if(!texto)return;
    var enlace=document.createElement("a");
    enlace.href=url(mensajeBase(texto));
    enlace.target="_blank";enlace.rel="noopener";
    document.body.appendChild(enlace);enlace.click();enlace.remove();
  });

  flota.querySelector(".robot__boton").addEventListener("click",function(){
    if(!contacto||!boton)return;
    contacto.scrollIntoView({behavior:"smooth",block:"center"});
    boton.classList.remove("contacto__boton--destello");
    void boton.offsetWidth;
    boton.classList.add("contacto__boton--destello");
    setTimeout(function(){boton.classList.remove("contacto__boton--destello");},3600);
  });
  programar(30000);

  if(nube){
    function ver(){nube.classList.add("contacto__nube--ver");setTimeout(function(){nube.classList.remove("contacto__nube--ver");},3500);}
    setTimeout(ver,2000);setInterval(ver,9000);
  }
})();