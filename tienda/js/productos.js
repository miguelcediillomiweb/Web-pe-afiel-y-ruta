// Carga, normalización y agrupación de productos.
// Un grupo equivale a una marca + un sabor; sus presentaciones nunca generan tarjetas separadas.
window.ProductosTienda = (() => {
  let productos = [];
  const clean = value => String(value ?? "").trim();
  const key = value => clean(value).toLocaleLowerCase("es-MX").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  async function cargar() {
    const response = await fetch("data/productos.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo leer data/productos.json");
    const data = await response.json();
    productos = Array.isArray(data) ? data.filter(p => p && p.marca && p.sabor && p.tamano) : [];
    return productos;
  }
  function marcas() {
    return [...new Set(productos.map(p => clean(p.marca)))].sort((a,b)=>a.localeCompare(b,"es"));
  }
  function porMarca(marca) {
    return productos.filter(p => key(p.marca) === key(marca));
  }
  function agruparPorSabor(marca) {
    const grupos = new Map();
    porMarca(marca).forEach(p => {
      const k = key(p.sabor);
      if (!grupos.has(k)) grupos.set(k, { marca: clean(p.marca), sabor: clean(p.sabor), presentaciones: [] });
      const grupo = grupos.get(k);
      if (!grupo.presentaciones.some(v => key(v.tamano) === key(p.tamano))) grupo.presentaciones.push(p);
    });
    return [...grupos.values()].map(g => ({
      ...g,
      presentaciones: g.presentaciones.sort((a,b) => Number(a.orden ?? 0)-Number(b.orden ?? 0) || clean(a.tamano).localeCompare(clean(b.tamano),"es",{numeric:true}))
    })).sort((a,b)=>a.sabor.localeCompare(b.sabor,"es"));
  }
  function todos() { return [...productos]; }
  return { cargar, marcas, porMarca, agruparPorSabor, todos };
})();