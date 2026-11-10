// Ventanas emergentes de marca y detalle. El modal de marca respeta 4 segundos de carga.
window.ModalesTienda = (() => {
  const $ = id => document.getElementById(id);
  let marcaActual = "";
  let timer = null;
  let fraseTimer = null;
  let frases = {};
  const safe = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = n => new Intl.NumberFormat(TIENDA_CONFIG.locale,{style:"currency",currency:TIENDA_CONFIG.currency}).format(Number(n)||0);
  async function cargarFrases() {
    try { const r=await fetch("data/frases-marcas.json",{cache:"no-store"}); if(r.ok)frases=await r.json(); } catch(e) { frases={}; }
  }
  function listaFrases(marca) {
    const exact=frases[marca] || frases.default || ["Estamos preparando tu selección…"];
    return Array.isArray(exact)&&exact.length?exact:["Estamos preparando tu selección…"];
  }
  function abrirMarca(marca) {
    marcaActual=marca;
    $("modal-brand-title").textContent=marca;
    $("brand-modal-backdrop").hidden=false;
    $("brand-modal").hidden=false;
    $("brand-loading").hidden=false;
    $("brand-products").hidden=true;
    document.body.classList.add("modal-open");
    iniciarCarga(marca);
  }
  function iniciarCarga(marca) {
    clearTimeout(timer); clearInterval(fraseTimer);
    const frasesMarca=listaFrases(marca); let i=0;
    $("loading-phrase").textContent=frasesMarca[0];
    fraseTimer=setInterval(()=>{i=(i+1)%frasesMarca.length;$("loading-phrase").textContent=frasesMarca[i];},900);
    timer=setTimeout(()=>{
      clearInterval(fraseTimer);
      mostrarProductos(marca);
    },TIENDA_CONFIG.loadingMilliseconds);
  }
  function mostrarProductos(marca) {
    const grupos=ProductosTienda.agruparPorSabor(marca);
    $("brand-loading").hidden=true;
    $("brand-products").hidden=false;
    if(!grupos.length){$("brand-products").innerHTML='<p class="no-products">Todavía no hay productos cargados para esta marca.</p>';return;}
    $("brand-products").innerHTML=grupos.map((g,index)=>`
      <article class="flavor-card">
        <div class="flavor-card__head"><div><p class="eyebrow">SABOR</p><h3>${safe(g.sabor)}</h3></div><span class="variant-count">${g.presentaciones.length} ${g.presentaciones.length===1?"presentación":"presentaciones"}</span></div>
        <div class="variant-list">${g.presentaciones.map((p,j)=>`
          <button class="variant-option" data-detail="${safe(p.id || [p.marca,p.sabor,p.tamano].join("|"))}" data-index="${index}" data-variant="${j}">
            <span>${safe(p.tamano)}</span><b>${p.precio!==undefined&&p.precio!==""?money(p.precio):"Consultar"}</b><i>↗</i>
          </button>`).join("")}</div>
      </article>`).join("");
  }
  function cerrarMarca() {
    clearTimeout(timer);clearInterval(fraseTimer);
    $("brand-modal").hidden=true;$("brand-modal-backdrop").hidden=true;
    $("detail-modal").hidden=true;$("detail-backdrop").hidden=true;
    document.body.classList.remove("modal-open");
  }
  function abrirDetalle(producto) {
    const host=$("detail-content");
    const image=producto.imagen? `<img src="${safe(producto.imagen)}" alt="${safe(producto.sabor)}">` : '<div class="detail-placeholder">✦</div>';
    host.innerHTML=`<div class="detail-layout"><div class="detail-image">${image}</div><div class="detail-copy"><p class="eyebrow">${safe(producto.marca)}</p><h2 id="detail-title">${safe(producto.sabor)}</h2><p class="detail-size">${safe(producto.tamano)}</p><p class="detail-description">${safe(producto.descripcion||"Una presentación para disfrutar cuando quieras.")}</p><strong class="detail-price">${producto.precio!==undefined&&producto.precio!==""?money(producto.precio):"Precio por confirmar"}</strong><button class="gold-button full" id="detail-add">Agregar a mi pedido</button></div></div>`;
    $("detail-backdrop").hidden=false;$("detail-modal").hidden=false;
    $("detail-add").addEventListener("click",()=>{CarritoTienda.agregar(producto);cerrarDetalle();});
  }
  function cerrarDetalle(){$("detail-backdrop").hidden=true;$("detail-modal").hidden=true;}
  $("brand-modal-close").addEventListener("click",cerrarMarca);
  $("brand-modal-exit").addEventListener("click",cerrarMarca);
  $("brand-modal-backdrop").addEventListener("click",cerrarMarca);
  $("brand-products").addEventListener("click",e=>{
    const b=e.target.closest("[data-detail]");if(!b)return;
    const index=Number(b.dataset.index),variant=Number(b.dataset.variant);
    const product=ProductosTienda.agruparPorSabor(marcaActual)[index]?.presentaciones[variant];
    if(product)abrirDetalle(product);
  });
  $("detail-close").addEventListener("click",cerrarDetalle);
  $("detail-backdrop").addEventListener("click",cerrarDetalle);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("detail-modal").hidden)cerrarDetalle();else if(!$("brand-modal").hidden)cerrarMarca();}});
  cargarFrases();
  return {abrirMarca,cerrarMarca};
})();