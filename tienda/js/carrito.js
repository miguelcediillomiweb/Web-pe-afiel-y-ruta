// Carrito independiente del catálogo y de las ventanas emergentes.
window.CarritoTienda = (() => {
  const items = new Map();
  const money = n => new Intl.NumberFormat(TIENDA_CONFIG.locale,{style:"currency",currency:TIENDA_CONFIG.currency}).format(Number(n)||0);
  const escapeHTML = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function render() {
    const rows = [...items.values()];
    const count = rows.reduce((s,p)=>s+p.cantidad,0);
    const total = rows.reduce((s,p)=>s+(Number(p.precio)||0)*p.cantidad,0);
    document.getElementById("cart-count").textContent = count;
    document.getElementById("cart-total").textContent = money(total);
    const host = document.getElementById("cart-lines");
    if (!rows.length) { host.innerHTML = '<p class="empty-cart">Todavía no agregas productos.</p>'; return; }
    host.innerHTML = rows.map(p=>`<article class="cart-line"><div><h3>${escapeHTML(p.marca)} · ${escapeHTML(p.sabor)}</h3><p>${escapeHTML(p.tamano)}</p><div class="qty"><button data-cart="minus" data-id="${escapeHTML(p.id)}">−</button><b>${p.cantidad}</b><button data-cart="plus" data-id="${escapeHTML(p.id)}">+</button></div></div><strong>${money((Number(p.precio)||0)*p.cantidad)}</strong></article>`).join("");
  }
  function agregar(producto) {
    const id = String(producto.id || [producto.marca,producto.sabor,producto.tamano].join("|"));
    const actual = items.get(id);
    items.set(id,{...producto,id,cantidad:actual?actual.cantidad+1:1});
    render();
    document.dispatchEvent(new CustomEvent("tienda:toast",{detail:"Producto agregado a tu pedido"}));
  }
  function cambiar(id,delta) {
    const p=items.get(id); if(!p)return;
    p.cantidad+=delta; if(p.cantidad<=0)items.delete(id); render();
  }
  function mensajeWhatsApp() {
    if(!items.size)return "";
    const rows=[...items.values()];
    const total=rows.reduce((s,p)=>s+(Number(p.precio)||0)*p.cantidad,0);
    return ["Hola, quiero consultar disponibilidad de estos productos:","",...rows.map(p=>`• ${p.marca} — ${p.sabor} — ${p.tamano} x${p.cantidad}`),"",`Total estimado: ${money(total)}`,"¿Me confirman disponibilidad y precio final?"].join("\n");
  }
  document.getElementById("cart-lines").addEventListener("click",e=>{
    const b=e.target.closest("[data-cart]"); if(b)cambiar(b.dataset.id,b.dataset.cart==="plus"?1:-1);
  });
  render();
  return {agregar,render,mensajeWhatsApp};
})();