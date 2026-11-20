/* CARRUSEL DE MARCAS — tarjetas rotativas con todas las marcas activas. */
(function () {
  var PALETAS = {
    "aguafiel":["#42b8e8","#126caa"], "snapple":["#70a94b","#245b37"],
    "clamato":["#d84b4b","#781f2a"], "dr-pepper":["#a64b67","#4b1833"],
    "energetizante":["#367bd1","#142f67"], "schweppes":["#e6bd43","#806019"],
    "orange-crush":["#ff9b32","#b94b12"], "rc-cola":["#e33c49","#8d1427"],
    "penafiel-sabores":["#ef5545","#92251f"], "penafiel-twist":["#39b9b3","#126c72"],
    "agua-mineral":["#53b6e7","#175f9b"], "penafiel-adas":["#e85a48","#942b25"]
  };
  function iniciar(marcas) {
    var pista=document.getElementById("carrusel-pista");
    if(!pista || !marcas || !marcas.length) return;
    pista.textContent="";
    pista.className="carrusel__pista carrusel__escenario";
    var tarjetas=marcas.map(function(m,i){
      var b=document.createElement("div");
      b.className="carrusel__tarjeta";
      b.setAttribute("aria-label",m.nombre);
      var colores=PALETAS[m.slug]||["#3c91c9","#17466f"];
      b.style.setProperty("--marca-clara",colores[0]);
      b.style.setProperty("--marca-oscura",colores[1]);
      var logo=document.createElement("div"); logo.className="carrusel__logo";
      logo.appendChild(window.Marcas.crearLogo(m));
      var nombre=document.createElement("strong"); nombre.className="carrusel__nombre"; nombre.textContent=m.nombre;
      b.append(logo,nombre); pista.appendChild(b); return b;
    });
    var indice=0, pausa=false, intervalo=null;
    function posicionar(){
      var n=tarjetas.length;
      tarjetas.forEach(function(t,i){
        t.classList.remove("es-centro","es-izquierda","es-derecha");
        var delta=(i-indice+n)%n;
        if(delta===0) t.classList.add("es-centro");
        else if(delta===1 || (n>2 && delta===n-1)) t.classList.add(delta===1?"es-derecha":"es-izquierda");
        else t.classList.add("fuera");
      });
    }
    function avanzar(){ if(pausa || document.hidden || tarjetas.length<2) return; indice=(indice+1)%tarjetas.length; posicionar(); }
    posicionar();
    var ventana=pista.parentNode;
    ventana.addEventListener("pointerenter",function(){pausa=true;});
    ventana.addEventListener("pointerleave",function(){pausa=false;});
    document.addEventListener("visibilitychange",function(){if(!document.hidden) posicionar();});
    intervalo=setInterval(avanzar,Math.max(2200,(window.CONFIG.carruselSegundos||2.5)*1000));
    window.addEventListener("pagehide",function(){clearInterval(intervalo);},{once:true});
  }
  window.Carrusel={iniciar:iniciar};
})();