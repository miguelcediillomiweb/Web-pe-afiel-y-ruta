// Carrito de interés: nunca calcula ni muestra precios o totales.
window.CarritoTienda = (() => {
  const items = new Map();
  const escapeHTML = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function render() {
    const rows = [...items.values()];
    document.getElementById("cart-count").textContent = rows.reduce((s,p)=>s+p.cantidad,0);
    const host = document.getElementById("cart-lines");
    if (!rows.length) { host.innerHTML = '<p class="empty-cart">Todavía no agregas productos.</p>'; return; }
    host.innerHTML = rows.map(p=>`<article class="cart-line"><div class="cart-line__info"><h3>${escapeHTML(p.marca)} · ${escapeHTML(p.sabor)}</h3><p>${escapeHTML(p.tamano)}</p><div class="qty"><button aria-label="Quitar una unidad" data-cart="minus" data-id="${escapeHTML(p.id)}">−</button><b>${p.cantidad}</b><button aria-label="Agregar una unidad" data-cart="plus" data-id="${escapeHTML(p.id)}">+</button></div></div><button class="remove-item" data-cart="remove" data-id="${escapeHTML(p.id)}" aria-label="Eliminar producto">×</button></article>`).join("");
  }
  function agregar(producto) {
    const id = String(producto.id || [producto.marca,producto.sabor,producto.tamano].join("|"));
    const actual = items.get(id);
    items.set(id,{...producto,id,cantidad:actual?actual.cantidad+1:1});
    render();
    document.dispatchEvent(new CustomEvent("tienda:toast",{detail:"Agregado a tu selección"}));
  }
  function cambiar(id,action) {
    const p=items.get(id); if(!p)return;
    if(action==="remove") items.delete(id);
    else { p.cantidad += action==="plus" ? 1 : -1; if(p.cantidad<=0)items.delete(id); }
    render();
  }
  function mensajeWhatsApp() {
    if(!items.size)return "";
    const rows=[...items.values()];
    return ["Hola, me interesa consultar estos productos:","",...rows.map(p=>`• ${p.marca} — ${p.sabor} — ${p.tamano} x${p.cantidad}`),"","¿Me pueden compartir información, precio y disponibilidad?"].join("\n");
  }
  document.getElementById("cart-lines").addEventListener("click",e=>{
    const b=e.target.closest("[data-cart]"); if(b)cambiar(b.dataset.id,b.dataset.cart);
  });
  render();
  return {agregar,render,mensajeWhatsApp};
})();