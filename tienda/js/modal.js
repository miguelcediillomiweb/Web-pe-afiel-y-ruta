// Ventanas de marca y detalle con carga visual de cuatro segundos.
window.ModalesTienda = (() => {
  const $ = id => document.getElementById(id);
  let marcaActual = "", timer = null, fraseTimer = null, frases = {};
  const safe = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  async function cargarFrases() { try { const r=await fetch("data/frases-marcas.json",{cache:"no-store"}); if(r.ok)frases=await r.json(); } catch(e) { frases={}; } }
  function listaFrases(marca) { const v=frases[marca]||frases.default||["Estamos preparando tu selección…"]; return Array.isArray(v)&&v.length?v:["Estamos preparando tu selección…"]; }
  function abrirMarca(marca) {
    marcaActual=marca; $("modal-brand-title").textContent=marca;
    $("brand-modal-backdrop").hidden=false; $("brand-modal").hidden=false;
    $("brand-loading").hidden=false; $("brand-products").hidden=true;
    document.body.classList.add("modal-open"); iniciarCarga(marca);
  }
  function iniciarCarga(marca) {
    clearTimeout(timer); clearInterval(fraseTimer);
    const list=listaFrases(marca); let i=0; $("loading-phrase").textContent=list[0];
    fraseTimer=setInterval(()=>{i=(i+1)%list.length;$("loading-phrase").textContent=list[i];},900);
    timer=setTimeout(()=>{clearInterval(fraseTimer);mostrarProductos(marca);},TIENDA_CONFIG.loadingMilliseconds);
  }
  function mostrarProductos(marca) {
    const grupos=ProductosTienda.agruparPorSabor(marca);
    $("brand-loading").hidden=true; $("brand-products").hidden=false;
    if(!grupos.length){$("brand-products").innerHTML='<p class="no-products">No hay presentaciones disponibles para esta marca.</p>';return;}
    $("brand-products").innerHTML=grupos.map((g,index)=>`
      <article class="flavor-card"><div class="flavor-card__head"><div><p class="eyebrow">SABOR</p><h3>${safe(g.sabor)}</h3></div><span class="variant-count">${g.presentaciones.length} ${g.presentaciones.length===1?"presentación":"presentaciones"}</span></div>
      <div class="variant-list">${g.presentaciones.map((p,j)=>`<button class="variant-option" data-index="${index}" data-variant="${j}"><span>${safe(p.tamano)}</span><b>Ver detalle</b><i>↗</i></button>`).join("")}</div></article>`).join("");
  }
  function cerrarMarca() { clearTimeout(timer);clearInterval(fraseTimer);$("brand-modal").hidden=true;$("brand-modal-backdrop").hidden=true;cerrarDetalle();document.body.classList.remove("modal-open"); }
  function abrirDetalle(producto) {
    const image=producto.imagen? `<img src="${safe(producto.imagen)}" alt="${safe(producto.sabor)}" loading="lazy">` : '<div class="detail-placeholder">✦</div>';
    $("detail-content").innerHTML=`<div class="detail-layout"><div class="detail-image">${image}</div><div class="detail-copy"><p class="eyebrow">${safe(producto.marca)}</p><h2 id="detail-title">${safe(producto.sabor)}</h2><p class="detail-size">${safe(producto.tamano)}</p><p class="detail-description">${safe(producto.descripcion||"Una presentación para disfrutar cuando quieras.")}</p><button class="gold-button full" id="detail-add">Agregar a mi selección</button></div></div>`;
    $("detail-backdrop").hidden=false;$("detail-modal").hidden=false;
    $("detail-add").addEventListener("click",()=>{CarritoTienda.agregar(producto);cerrarDetalle();});
  }
  function cerrarDetalle(){$("detail-backdrop").hidden=true;$("detail-modal").hidden=true;}
  $("brand-modal-close").addEventListener("click",cerrarMarca);$("brand-modal-exit").addEventListener("click",cerrarMarca);$("brand-modal-backdrop").addEventListener("click",cerrarMarca);
  $("brand-products").addEventListener("click",e=>{const b=e.target.closest("[data-index]");if(!b)return;const p=ProductosTienda.agruparPorSabor(marcaActual)[Number(b.dataset.index)]?.presentaciones[Number(b.dataset.variant)];if(p)abrirDetalle(p);});
  $("detail-close").addEventListener("click",cerrarDetalle);$("detail-backdrop").addEventListener("click",cerrarDetalle);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("detail-modal").hidden)cerrarDetalle();else if(!$("brand-modal").hidden)cerrarMarca();}});
  cargarFrases(); return {abrirMarca,cerrarMarca};
})();