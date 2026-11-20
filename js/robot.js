/* ASISTENTE FLOTANTE — aparece a los 30 s; recoge la consulta y la entrega por WhatsApp. */
(function () {
  var C=window.CONFIG||{}, FOTO="img/robot%20red%20bull.webp";
  function url(mensaje){return "https://wa.me/"+(C.whatsapp||"")+"?text="+encodeURIComponent(mensaje);}
  function ocupado(){
    var carga=document.getElementById("pantalla-carga"), anuncio=document.getElementById("anuncio");
    return document.hidden || document.body.classList.contains("sin-scroll") ||
      (carga&&!carga.hidden) || (anuncio&&!anuncio.hidden) ||
      document.body.classList.contains("en-marca");
  }
  var flota=document.createElement("div"); flota.className="robot";
  flota.innerHTML=
    '<section class="robot__panel" hidden aria-label="Asistente de ventas">'+
      '<header class="chat-header"><span>Asistente Peñafiel</span><button class="robot__cerrar" type="button" aria-label="Cerrar">×</button></header>'+
      '<div class="chat-window"><ul class="message-list" aria-live="polite">'+
        '<li class="mensaje mensaje--asistente">¡Hola! 👋 Soy tu asistente de ventas de Ruta 1371. ¿Qué producto o información te interesa conocer? 🥤</li>'+
      '</ul></div>'+
      '<form class="chat-input"><input class="message-input" type="text" maxlength="500" autocomplete="off" placeholder="Escribe tu consulta aquí..." aria-label="Tu consulta">'+
      '<button class="send-button" type="submit">Enviar por WhatsApp</button></form>'+
      '<p class="robot__nota">Tu mensaje se abrirá en WhatsApp para que tu asesor pueda atenderte.</p>'+
    '</section>'+
    '<button class="robot__boton" type="button" aria-label="Abrir asistente de ventas"><span class="robot__nube">¿Te ayudo? 👋</span><img src="'+FOTO+'" alt=""></button>';
  document.body.appendChild(flota);
  var panel=flota.querySelector(".robot__panel"), form=flota.querySelector(".chat-input"),
      input=flota.querySelector(".message-input"), lista=flota.querySelector(".message-list");
  var reloj=null, abierto=false, conversacion=[];
  function programar(ms){clearTimeout(reloj);reloj=setTimeout(ciclo,ms);}
  function ocultar(){flota.classList.remove("robot--visible","robot--nube");programar(60000);}
  function ciclo(){
    if(abierto)return;
    if(ocupado()){programar(6000);return;}
    flota.classList.add("robot--visible");
    setTimeout(function(){if(!abierto)flota.classList.add("robot--nube");},650);
    reloj=setTimeout(function(){if(!abierto)ocultar();},12000);
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
    var mensaje="¡Hola! 👋 Vengo del catálogo web de Grupo Peñafiel 🥤. Me interesa conocer más sobre lo siguiente:\n\n"+
      conversacion.map(function(x){return "• "+x;}).join("\n")+
      "\n\n¿Me puedes apoyar con información, disponibilidad y atención en mi visita? ¡Gracias! 😊";
    var a=document.createElement("a");a.href=url(mensaje);a.target="_blank";a.rel="noopener";a.style.display="none";
    document.body.appendChild(a);a.click();a.remove();
    burbuja("Listo 😊 Abrí WhatsApp con tu consulta para que tu asesor pueda atenderte.","mensaje--asistente");
  });
  flota.querySelector(".robot__boton").addEventListener("click",function(){if(abierto)cerrar();else abrir();});
  flota.querySelector(".robot__cerrar").addEventListener("click",cerrar);
  programar(30000);
  var boton=document.getElementById("contacto-boton"),nube=document.getElementById("contacto-nube");
  if(boton)boton.href=url("¡Hola! 👋 Me interesa recibir información de los productos de Grupo Peñafiel. ¿Me puedes apoyar? 😊");
  if(nube){
    function ver(){nube.classList.add("contacto__nube--ver");setTimeout(function(){nube.classList.remove("contacto__nube--ver");},3500);}
    setTimeout(ver,2000);setInterval(ver,9000);
  }
})();