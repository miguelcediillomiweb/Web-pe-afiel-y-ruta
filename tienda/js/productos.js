// Obtiene el catálogo al abrir la web y agrupa por marca + sabor.
// El endpoint debe devolver { correcto:true, productos:[{marca,sabor,tamano,...}] }.
window.ProductosTienda = (() => {
  let productos = [];
  const clean = value => String(value ?? "").trim();
  const key = value => clean(value).toLocaleLowerCase("es-MX").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const first = (obj, names) => {
    for (const name of names) if (obj[name] !== undefined && obj[name] !== null && String(obj[name]).trim() !== "") return obj[name];
    return "";
  };
  function normalizar(row, index) {
    const marca = first(row, ["marca","Marca","MARCA","brand","Brand"]);
    const sabor = first(row, ["sabor","Sabor","SABOR","producto","Producto","PRODUCTO","nombre","Nombre"]);
    const tamano = first(row, ["tamano","Tamaño","tamaño","Presentacion","Presentación","presentacion","presentación","Formato"]);
    if (!marca || !sabor || !tamano) return null;
    return {
      ...row,
      id: String(first(row, ["id","ID","Id","codigo","Código","SKU"]) || [marca,sabor,tamano,index].join("|")),
      marca: clean(marca), sabor: clean(sabor), tamano: clean(tamano),
      imagen: clean(first(row, ["imagen","Imagen","foto","Foto","image","Image"])),
      descripcion: clean(first(row, ["descripcion","Descripción","Descripcion","detalle","Detalle"])),
      orden: Number(first(row, ["orden","Orden"])) || 0
    };
  }
  async function cargar() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIENDA_CONFIG.requestTimeout);
    try {
      const response = await fetch(TIENDA_CONFIG.catalogApi, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("El servicio de catálogo respondió " + response.status);
      const data = await response.json();
      const rows = Array.isArray(data) ? data : Array.isArray(data.productos) ? data.productos : Array.isArray(data.data) ? data.data : [];
      productos = rows.map(normalizar).filter(Boolean);
      if (!productos.length) {
        const detalle = Array.isArray(data.hojas) ? "El servicio responde, pero solo entrega nombres de pestañas y encabezados; falta habilitar la lectura de filas." : "El servicio todavía no devuelve productos.";
        throw new Error(detalle);
      }
      return productos;
    } finally { clearTimeout(timeout); }
  }
  function marcas() { return [...new Set(productos.map(p => p.marca))].sort((a,b)=>a.localeCompare(b,"es")); }
  function porMarca(marca) { return productos.filter(p => key(p.marca) === key(marca)); }
  function agruparPorSabor(marca) {
    const grupos = new Map();
    porMarca(marca).forEach(p => {
      const k = key(p.sabor);
      if (!grupos.has(k)) grupos.set(k, { marca:p.marca, sabor:p.sabor, presentaciones:[] });
      const g = grupos.get(k);
      if (!g.presentaciones.some(v => key(v.tamano) === key(p.tamano))) g.presentaciones.push(p);
    });
    return [...grupos.values()].map(g => ({...g,presentaciones:g.presentaciones.sort((a,b)=>a.orden-b.orden || a.tamano.localeCompare(b.tamano,"es",{numeric:true}))})).sort((a,b)=>a.sabor.localeCompare(b.sabor,"es"));
  }
  return { cargar, marcas, porMarca, agruparPorSabor, todos:() => [...productos] };
})();