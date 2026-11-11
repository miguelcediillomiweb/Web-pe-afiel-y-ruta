// Control de interfaz, carga del catálogo y salida a WhatsApp.
(() => {
  const $=id=>document.getElementById(id);
  const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let marcas=[];
  function renderMarcas(query="") {
    const q=query.trim().toLocaleLowerCase("es-MX");
    const visibles=marcas.filter(m=>m.toLocaleLowerCase("es-MX").includes(q));
    $("brand-total").textContent=`${visibles.length} marca${visibles.length===1?"":"s"}`;
    $("brand-grid").innerHTML=visibles.length?visibles.map((m,i)=>`<button class="brand-card" data-brand="${safe(m)}" style="--card-index:${i}"><span class="brand-card__index">${String(i+1).padStart(2,"0")}</span><span class="brand-card__monogram">${safe(m.slice(0,1).toUpperCase())}</span><span class="brand-card__name">${safe(m)}</span><span class="brand-card__cta">Descubrir productos <b>↗</b></span></button>`).join(""):'<p class="empty-brands">No encontramos marcas con ese nombre.</p>';
  }
  $("brand-grid").addEventListener("click",e=>{const card=e.target.closest("[data-brand]");if(card)ModalesTienda.abrirMarca(card.dataset.brand);});
  $("brand-search").addEventListener("input",e=>renderMarcas(e.target.value));
  $("cart-open").addEventListener("click",()=>{$("cart-drawer").classList.add("is-open");$("cart-backdrop").hidden=false;$("cart-drawer").setAttribute("aria-hidden","false");});
  function closeCart(){$("cart-drawer").classList.remove("is-open");$("cart-backdrop").hidden=true;$("cart-drawer").setAttribute("aria-hidden","true");}
  $("cart-close").addEventListener("click",closeCart);$("cart-backdrop").addEventListener("click",closeCart);
  $("send-whatsapp").addEventListener("click",()=>{
    const message=CarritoTienda.mensajeWhatsApp();
    if(!message){toast("Agrega productos antes de enviar tu selección.");return;}
    if(!/^\d{10,15}$/.test(TIENDA_CONFIG.whatsapp)||TIENDA_CONFIG.whatsapp==="5210000000000"){toast("Configura el número de WhatsApp en js/config.js.");return;}
    window.open("https://wa.me/"+TIENDA_CONFIG.whatsapp+"?text="+encodeURIComponent(message),"_blank","noopener");
  });
  function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2400);}
  document.addEventListener("tienda:toast",e=>toast(e.detail));
  $("year").textContent=new Date().getFullYear();
  ProductosTienda.cargar().then(()=>{marcas=ProductosTienda.marcas();renderMarcas();$("catalog-status").textContent="Catálogo consultado al entrar";if(!marcas.length)$("brand-grid").innerHTML='<div class="catalog-empty"><strong>Catálogo sin marcas</strong><p>El servicio respondió, pero no se encontraron productos con marca, sabor y presentación.</p></div>';}).catch(error=>{$("brand-grid").innerHTML=`<div class="catalog-empty"><strong>No se pudo cargar el catálogo</strong><p>${safe(error.message)}<br>Revisa que Apps Script devuelva la lista de productos y que esté publicado para acceso web.</p></div>`; $("brand-total").textContent="Catálogo pendiente de conexión";$("catalog-status").textContent="Revisar conexión";});
})();