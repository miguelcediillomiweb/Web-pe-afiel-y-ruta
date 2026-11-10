// Controlador de la página: listado de marcas, búsqueda y conexión de módulos.
(() => {
  const $=id=>document.getElementById(id);
  const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let marcas=[];
  function renderMarcas(query="") {
    const q=query.trim().toLocaleLowerCase("es-MX");
    const visibles=marcas.filter(m=>m.toLocaleLowerCase("es-MX").includes(q));
    $("brand-total").textContent=`${visibles.length} marca${visibles.length===1?"":"s"}`;
    $("brand-grid").innerHTML=visibles.length?visibles.map((m,i)=>`
      <button class="brand-card" data-brand="${safe(m)}" style="--card-index:${i}">
        <span class="brand-card__index">${String(i+1).padStart(2,"0")}</span>
        <span class="brand-card__monogram">${safe(m.slice(0,1).toUpperCase())}</span>
        <span class="brand-card__name">${safe(m)}</span>
        <span class="brand-card__cta">Ver productos <b>↗</b></span>
      </button>`).join(""):'<p class="empty-brands">No encontramos marcas con ese nombre.</p>';
  }
  $("brand-grid").addEventListener("click",e=>{
    const card=e.target.closest("[data-brand]");if(card)ModalesTienda.abrirMarca(card.dataset.brand);
  });
  $("brand-search").addEventListener("input",e=>renderMarcas(e.target.value));
  $("cart-open").addEventListener("click",()=>{
    $("cart-drawer").classList.add("is-open");$("cart-backdrop").hidden=false;$("cart-drawer").setAttribute("aria-hidden","false");
  });
  function closeCart(){$("cart-drawer").classList.remove("is-open");$("cart-backdrop").hidden=true;$("cart-drawer").setAttribute("aria-hidden","true");}
  $("cart-close").addEventListener("click",closeCart);$("cart-backdrop").addEventListener("click",closeCart);
  $("send-whatsapp").addEventListener("click",()=>{
    const message=CarritoTienda.mensajeWhatsApp();
    if(!message){toast("Agrega productos antes de enviar tu consulta.");return;}
    if(TIENDA_CONFIG.whatsapp==="5210000000000"){toast("Falta configurar el WhatsApp en js/config.js.");return;}
    window.open("https://wa.me/"+TIENDA_CONFIG.whatsapp+"?text="+encodeURIComponent(message),"_blank","noopener");
  });
  function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2200);}
  document.addEventListener("tienda:toast",e=>toast(e.detail));
  $("year").textContent=new Date().getFullYear();
  ProductosTienda.cargar().then(data=>{marcas=ProductosTienda.marcas();renderMarcas();if(!data.length){$("brand-grid").innerHTML='<div class="catalog-empty"><strong>Catálogo listo para importar</strong><p>La estructura ya está preparada. Falta incorporar los registros de la hoja de productos.</p></div>';}}).catch(()=>{$("brand-grid").innerHTML='<p class="empty-brands">No se pudo cargar el catálogo. Revisa data/productos.json.</p>';});
})();