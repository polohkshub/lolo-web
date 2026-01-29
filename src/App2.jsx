import React, { useState, useEffect } from 'react';
// Iconos como emojis simples
const Download = () => <span>📥</span>;
const Upload = () => <span>📤</span>;
const Trash2 = () => <span>🗑️</span>;
const Plus = () => <span>➕</span>;
const Search = () => <span>🔍</span>;
const ShoppingCart = () => <span>🛒</span>;
const DollarSign = () => <span>💰</span>;
const Package = () => <span>📦</span>;
const BarChart3 = () => <span>📊</span>;
const X = () => <span>❌</span>;
const Edit = () => <span>✏️</span>;

const LOLOApp = () => {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [tabActiva, setTabActiva] = useState('productos');
  
  const [formProd, setFormProd] = useState({
    producto: '', costo: '', envio: '', ct_ganancia: '80',
    stock: '', proveedor: '', rubro: ''
  });
  const [productoEditando, setProductoEditando] = useState(null);
  const [busquedaProd, setBusquedaProd] = useState('');
  
  const [ventaRapida, setVentaRapida] = useState({
    cliente: '', producto: '', cantidad: '', precio: '', formaPago: 'Contado'
  });
  const [sugerencias, setSugerencias] = useState([]);
  
  const [ventaKiosco, setVentaKiosco] = useState({
    cliente: '', formaPago: 'Contado'
  });
  const [itemKiosco, setItemKiosco] = useState({
    producto: '', cantidad: '', precio: ''
  });
  const [sugerenciasKiosco, setSugerenciasKiosco] = useState([]);
  
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);

  // Cargar datos del localStorage
  useEffect(() => {
    const prodGuardados = localStorage.getItem('lolo_productos');
    const ventasGuardadas = localStorage.getItem('lolo_ventas');
    
    if (prodGuardados) setProductos(JSON.parse(prodGuardados));
    if (ventasGuardadas) setVentas(JSON.parse(ventasGuardadas));
  }, []);

  // Guardar productos
  useEffect(() => {
    if (productos.length > 0) {
      localStorage.setItem('lolo_productos', JSON.stringify(productos));
    }
  }, [productos]);

  // Guardar ventas
  useEffect(() => {
    if (ventas.length > 0) {
      localStorage.setItem('lolo_ventas', JSON.stringify(ventas));
    }
  }, [ventas]);

  // Funciones de cálculo
  const calcularPrecioVenta = (costo, envio, pctGanancia) => {
    const c = parseFloat(costo) || 0;
    const e = parseFloat(envio) || 0;
    const p = parseFloat(pctGanancia) || 80;
    
    const ganancia = c * (p / 100);
    const precioVenta = c + ganancia + e;
    
    return { 
      precioVenta: isNaN(precioVenta) ? 0 : precioVenta, 
      ganancia: isNaN(ganancia) ? 0 : ganancia 
    };
  };

  // Funciones de productos
  const guardarProducto = () => {
    if (!formProd.producto) {
      alert('⚠️ Ingrese nombre del producto');
      return;
    }
    
    const { precioVenta, ganancia } = calcularPrecioVenta(
      formProd.costo, formProd.envio, formProd.ct_ganancia
    );
    
    const producto = {
      id: productoEditando ? productoEditando.id : Date.now(),
      producto: formProd.producto,
      costo: parseFloat(formProd.costo) || 0,
      envio: parseFloat(formProd.envio) || 0,
      precio_venta: precioVenta,
      ganancia: ganancia,
      ct_ganancia: parseFloat(formProd.ct_ganancia) || 80,
      proveedor: formProd.proveedor,
      rubro: formProd.rubro,
      stock: parseInt(formProd.stock) || 0
    };
    
    if (productoEditando) {
      setProductos(productos.map(p => p.id === productoEditando.id ? producto : p));
      alert('✅ Producto actualizado');
    } else {
      setProductos([...productos, producto]);
      alert('✅ Producto agregado');
    }
    
    limpiarFormProd();
  };

  const limpiarFormProd = () => {
    setFormProd({
      producto: '', costo: '', envio: '', ct_ganancia: '80',
      stock: '', proveedor: '', rubro: ''
    });
    setProductoEditando(null);
  };

  const editarProducto = (prod) => {
    setFormProd({
      producto: prod.producto,
      costo: prod.costo.toString(),
      envio: prod.envio.toString(),
      ct_ganancia: prod.ct_ganancia.toString(),
      stock: prod.stock.toString(),
      proveedor: prod.proveedor,
      rubro: prod.rubro
    });
    setProductoEditando(prod);
    window.scrollTo(0, 0);
  };

  const eliminarProducto = (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      setProductos(productos.filter(p => p.id !== id));
      alert('✅ Producto eliminado');
    }
  };

  // Búsqueda predictiva
  const buscarProductoPredictivo = (texto, setter) => {
    if (texto.length < 2) {
      setter([]);
      return;
    }
    
    const coincidencias = productos
      .filter(p => p.producto.toLowerCase().includes(texto.toLowerCase()))
      .slice(0, 5);
    
    setter(coincidencias);
  };

  // Venta rápida
  const registrarVentaRapida = () => {
    if (!ventaRapida.cliente) {
      alert('⚠️ Ingrese nombre del cliente');
      return;
    }
    
    const prod = productos.find(p => p.producto === ventaRapida.producto);
    if (!prod) {
      alert('⚠️ Producto no encontrado');
      return;
    }
    
    const cantidad = parseInt(ventaRapida.cantidad);
    if (cantidad <= 0 || cantidad > prod.stock) {
      alert(`⚠️ Stock insuficiente. Disponible: ${prod.stock}`);
      return;
    }
    
    const precio = parseFloat(ventaRapida.precio);
    const total = cantidad * precio;
    
    const venta = {
      id: Date.now(),
      fecha: new Date().toLocaleString('es-AR'),
      cliente: ventaRapida.cliente,
      producto: ventaRapida.producto,
      cantidad: cantidad,
      precio: precio,
      total: total,
      formaPago: ventaRapida.formaPago
    };
    
    setVentas([...ventas, venta]);
    
    setProductos(productos.map(p => 
      p.producto === ventaRapida.producto 
        ? {...p, stock: p.stock - cantidad}
        : p
    ));
    
    alert(`✅ Venta registrada\n💰 Total: $${total.toFixed(2)}\n📦 Stock restante: ${prod.stock - cantidad}`);
    
    setVentaRapida({
      cliente: '', producto: '', cantidad: '', precio: '', formaPago: 'Contado'
    });
    setSugerencias([]);
  };

  // Carrito
  const agregarAlCarrito = () => {
    if (!itemKiosco.producto) {
      alert('⚠️ Seleccione un producto');
      return;
    }
    
    const prod = productos.find(p => p.producto === itemKiosco.producto);
    const cantidad = parseInt(itemKiosco.cantidad);
    
    if (cantidad <= 0 || cantidad > prod.stock) {
      alert(`⚠️ Stock insuficiente. Disponible: ${prod.stock}`);
      return;
    }
    
    const precio = parseFloat(itemKiosco.precio);
    const subtotal = cantidad * precio;
    
    setCarrito([...carrito, {
      producto: itemKiosco.producto,
      cantidad: cantidad,
      precio: precio,
      subtotal: subtotal
    }]);
    
    setItemKiosco({ producto: '', cantidad: '', precio: '' });
    setSugerenciasKiosco([]);
  };

  const quitarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const finalizarVentaCarrito = () => {
    if (carrito.length === 0) {
      alert('⚠️ El carrito está vacío');
      return;
    }
    
    if (!ventaKiosco.cliente) {
      alert('⚠️ Ingrese nombre del cliente');
      return;
    }
    
    const fecha = new Date().toLocaleString('es-AR');
    const nuevasVentas = carrito.map(item => ({
      id: Date.now() + Math.random(),
      fecha: fecha,
      cliente: ventaKiosco.cliente,
      producto: item.producto,
      cantidad: item.cantidad,
      precio: item.precio,
      total: item.subtotal,
      formaPago: ventaKiosco.formaPago
    }));
    
    setVentas([...ventas, ...nuevasVentas]);
    
    carrito.forEach(item => {
      setProductos(prevProds => prevProds.map(p =>
        p.producto === item.producto
          ? {...p, stock: p.stock - item.cantidad}
          : p
      ));
    });
    
    const totalVenta = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    
    alert(`✅ VENTA FINALIZADA\n\n💰 Total: $${totalVenta.toFixed(2)}\n📦 ${carrito.length} productos vendidos\n👤 Cliente: ${ventaKiosco.cliente}`);
    
    setCarrito([]);
    setVentaKiosco({ cliente: '', formaPago: 'Contado' });
  };

  // Reportes
  const buscarVentas = () => {
    const filtradas = ventas.filter(v => {
      const fechaParts = v.fecha.split(',')[0].split('/');
      const fecha = new Date(fechaParts[2], fechaParts[1] - 1, fechaParts[0]);
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59);
      
      return fecha >= desde && fecha <= hasta;
    });
    
    setVentasFiltradas(filtradas);
  };

  // Exportar
  const exportarProductos = () => {
    const headers = ['producto', 'costo', 'envio', 'precio_venta', 'ganancia', 'ct_ganancia', 'proveedor', 'rubro', 'stock'];
    const csv = [
      headers.join(','),
      ...productos.map(p => headers.map(h => p[h]).join(','))
    ].join('\n');
    
    descargarCSV(csv, 'productos.csv');
  };

  const exportarCierreDia = () => {
    const hoy = new Date().toLocaleDateString('es-AR');
    const ventasHoy = ventas.filter(v => v.fecha.includes(hoy));
    
    if (ventasHoy.length === 0) {
      alert('📊 No hay ventas para hoy');
      return;
    }
    
    const headers = ['Fecha', 'Cliente', 'Producto', 'Cantidad', 'Precio', 'Total', 'Forma_Pago'];
    const csv = [
      headers.join(','),
      ...ventasHoy.map(v => [v.fecha, v.cliente, v.producto, v.cantidad, v.precio, v.total, v.formaPago].join(','))
    ].join('\n');
    
    const fecha = new Date().toISOString().split('T')[0];
    descargarCSV(csv, `cierre_${fecha}.csv`);
  };

  const descargarCSV = (contenido, nombre) => {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nombre;
    link.click();
  };

  // Importar
  const importarProductos = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').slice(1);
        
        const nuevosProductos = lines
          .filter(line => line.trim())
          .map(line => {
            const [producto, costo, envio, , , ct_ganancia, proveedor, rubro, stock] = line.split(',');
            
            const { precioVenta, ganancia } = calcularPrecioVenta(costo, envio, ct_ganancia);
            
            return {
              id: Date.now() + Math.random(),
              producto: producto?.trim() || '',
              costo: parseFloat(costo) || 0,
              envio: parseFloat(envio) || 0,
              precio_venta: precioVenta,
              ganancia: ganancia,
              ct_ganancia: parseFloat(ct_ganancia) || 80,
              proveedor: proveedor?.trim() || '',
              rubro: rubro?.trim() || '',
              stock: parseInt(stock) || 0
            };
          });
        
        setProductos([...productos, ...nuevosProductos]);
        alert('✅ Productos importados correctamente');
      } catch (error) {
        alert('❌ Error al importar: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // Cálculos en tiempo real
  const precioCalcResult = calcularPrecioVenta(
    formProd.costo, formProd.envio, formProd.ct_ganancia
  );
  const precioCalc = precioCalcResult?.precioVenta || 0;
  const gananciaCalc = precioCalcResult?.ganancia || 0;
  
  const totalVentaRapida = (parseFloat(ventaRapida.cantidad) || 0) * (parseFloat(ventaRapida.precio) || 0);
  const totalCarrito = carrito.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
  const calcularTotalesSeguro = () => {
    if (!ventasFiltradas || ventasFiltradas.length === 0) {
      return { transferencia: 0, contado: 0, total: 0 };
    }
    
    const transferencia = ventasFiltradas
      .filter(v => v.formaPago === 'Transferencia')
      .reduce((sum, v) => sum + (v.total || 0), 0);
    
    const contado = ventasFiltradas
      .filter(v => v.formaPago === 'Contado')
      .reduce((sum, v) => sum + (v.total || 0), 0);
    
    return { transferencia, contado, total: transferencia + contado };
  };
  
  const totales = calcularTotalesSeguro();
  
  const productosFiltrados = productos.filter(p =>
    p.producto.toLowerCase().includes(busquedaProd.toLowerCase()) ||
    (p.rubro || '').toLowerCase().includes(busquedaProd.toLowerCase()) ||
    (p.proveedor || '').toLowerCase().includes(busquedaProd.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-purple-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🛍️</div>
            <div>
              <h1 className="text-3xl font-bold text-purple-800">LOLO - Sobre Ruedas</h1>
              <p className="text-sm text-gray-600">Sistema de Gestión v5.0 ☁️</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-2">
            {[
              { id: 'productos', icon: Package, label: 'PRODUCTOS' },
              { id: 'venta-rapida', icon: DollarSign, label: 'VENTA RÁPIDA' },
              { id: 'kiosco', icon: ShoppingCart, label: 'PUNTO DE VENTA' },
              { id: 'reportes', icon: BarChart3, label: 'REPORTES' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-4 transition whitespace-nowrap ${
                  tabActiva === tab.id
                    ? 'border-purple-500 text-purple-700 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* TAB PRODUCTOS */}
        {tabActiva === 'productos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4">
                {productoEditando ? '📝 Editar Producto' : '➕ Agregar Producto'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['producto', 'costo', 'envio', 'ct_ganancia', 'stock', 'proveedor', 'rubro'].map(campo => (
                  <div key={campo}>
                    <label className="block text-sm font-semibold mb-1 capitalize">
                      {campo === 'ct_ganancia' ? '% Ganancia' : campo.replace('_', ' ')}:
                    </label>
                    <input
                      type={['costo', 'envio', 'ct_ganancia', 'stock'].includes(campo) ? 'number' : 'text'}
                      value={formProd[campo]}
                      onChange={(e) => setFormProd({...formProd, [campo]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <span className="text-sm font-semibold">Precio Venta: </span>
                <span className="text-lg font-bold text-green-600">${precioCalc.toFixed(2)}</span>
                <span className="ml-4 text-sm font-semibold">Ganancia: </span>
                <span className="text-lg font-bold text-blue-600">${gananciaCalc.toFixed(2)}</span>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={guardarProducto} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-semibold flex items-center gap-2">
                  <Plus size={20} />
                  {productoEditando ? 'Actualizar' : 'Agregar'}
                </button>
                
                {productoEditando && (
                  <button onClick={limpiarFormProd} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold">
                    Cancelar
                  </button>
                )}
                
                <label className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2 cursor-pointer">
                  <Upload size={20} />
                  Importar CSV
                  <input type="file" accept=".csv" onChange={importarProductos} className="hidden" />
                </label>
                
                <button onClick={exportarProductos} disabled={productos.length === 0} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded font-semibold flex items-center gap-2">
                  <Download size={20} />
                  Exportar CSV
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2">
                <Search size={20} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="🔍 Buscar producto, rubro o proveedor..."
                  value={busquedaProd}
                  onChange={(e) => setBusquedaProd(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-purple-600 text-white">
                    <tr>
                      <th className="px-2 py-2">Producto</th>
                      <th className="px-2 py-2">Costo</th>
                      <th className="px-2 py-2">Envío</th>
                      <th className="px-2 py-2">P.Venta</th>
                      <th className="px-2 py-2">Ganancia</th>
                      <th className="px-2 py-2">%</th>
                      <th className="px-2 py-2">Proveedor</th>
                      <th className="px-2 py-2">Rubro</th>
                      <th className="px-2 py-2">Stock</th>
                      <th className="px-2 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length === 0 ? (
                      <tr><td colSpan="10" className="px-4 py-8 text-center text-gray-500">No hay productos 👆</td></tr>
                    ) : (
                      productosFiltrados.map((p, i) => (
                        <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-2 py-2 font-semibold">{p.producto}</td>
                          <td className="px-2 py-2 text-center">${p.costo.toFixed(2)}</td>
                          <td className="px-2 py-2 text-center">${p.envio.toFixed(2)}</td>
                          <td className="px-2 py-2 text-center font-bold text-green-600">${p.precio_venta.toFixed(2)}</td>
                          <td className="px-2 py-2 text-center text-blue-600">${p.ganancia.toFixed(2)}</td>
                          <td className="px-2 py-2 text-center">{p.ct_ganancia.toFixed(0)}%</td>
                          <td className="px-2 py-2">{p.proveedor}</td>
                          <td className="px-2 py-2">{p.rubro}</td>
                          <td className="px-2 py-2 text-center font-bold">{p.stock}</td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => editarProducto(p)} className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => eliminarProducto(p.id)} className="bg-red-500 hover:bg-red-600 text-white p-1 rounded">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB VENTA RÁPIDA */}
        {tabActiva === 'venta-rapida' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-6">💰 VENTA RÁPIDA</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Cliente:</label>
                  <input type="text" value={ventaRapida.cliente} onChange={(e) => setVentaRapida({...ventaRapida, cliente: e.target.value})} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Forma de Pago:</label>
                  <select value={ventaRapida.formaPago} onChange={(e) => setVentaRapida({...ventaRapida, formaPago: e.target.value})} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option>Contado</option>
                    <option>Transferencia</option>
                  </select>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold mb-1">Producto:</label>
                  <input type="text" value={ventaRapida.producto} onChange={(e) => { setVentaRapida({...ventaRapida, producto: e.target.value}); buscarProductoPredictivo(e.target.value, setSugerencias); }} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {sugerencias.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
                      {sugerencias.map(p => (
                        <div key={p.id} onClick={() => { setVentaRapida({...ventaRapida, producto: p.producto, precio: p.precio_venta.toString()}); setSugerencias([]); }} className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm">
                          {p.producto} - ${p.precio_venta.toFixed(2)} (Stock: {p.stock})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Cantidad:</label>
                  <input type="number" value={ventaRapida.cantidad} onChange={(e) => setVentaRapida({...ventaRapida, cantidad: e.target.value})} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Precio:</label>
                  <input type="number" value={ventaRapida.precio} onChange={(e) => setVentaRapida({...ventaRapida, precio: e.target.value})} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Stock:</label>
                  <div className="px-3 py-2 bg-gray-100 rounded font-bold text-orange-600">
                    {productos.find(p => p.producto === ventaRapida.producto)?.stock || 0}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xl font-semibold">TOTAL: </span>
                  <span className="text-3xl font-bold text-green-600">${totalVentaRapida.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={registrarVentaRapida} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2">
                    <DollarSign size={24} />
                    VENDER
                  </button>
                  <button onClick={() => { setVentaRapida({ cliente: '', producto: '', cantidad: '', precio: '', formaPago: 'Contado' }); setSugerencias([]); }} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold">
                    🧹 Limpiar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">📋 Últimas 10 Ventas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-2 py-2">Fecha</th>
                      <th className="px-2 py-2">Cliente</th>
                      <th className="px-2 py-2">Producto</th>
                      <th className="px-2 py-2">Cant</th>
                      <th className="px-2 py-2">Total</th>
                      <th className="px-2 py-2">Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.slice(-10).reverse().map((v, i) => (
                      <tr key={v.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-2 py-2 text-xs">{v.fecha}</td>
                        <td className="px-2 py-2">{v.cliente}</td>
                        <td className="px-2 py-2">{v.producto}</td>
                        <td className="px-2 py-2 text-center">{v.cantidad}</td>
                        <td className="px-2 py-2 text-center font-bold text-green-600">${v.total.toFixed(2)}</td>
                        <td className="px-2 py-2 text-center text-xs">{v.formaPago}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'kiosco' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">🛒 PUNTO DE VENTA</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Cliente:</label>
                  <input type="text" value={ventaKiosco.cliente} onChange={(e) => setVentaKiosco({...ventaKiosco, cliente: e.target.value})} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-yellow-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Forma de Pago:</label>
                  <select value={ventaKiosco.formaPago} onChange={(e) => setVentaKiosco({...ventaKiosco, formaPago: e.target.value})} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-yellow-500 focus:outline-none">
                    <option>Contado</option>
                    <option>Transferencia</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">➕ Agregar al carrito</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="relative md:col-span-2">
                    <input type="text" placeholder="Buscar producto..." value={itemKiosco.producto} onChange={(e) => { setItemKiosco({...itemKiosco, producto: e.target.value}); buscarProductoPredictivo(e.target.value, setSugerenciasKiosco); }} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    {sugerenciasKiosco.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
                        {sugerenciasKiosco.map(p => (
                          <div key={p.id} onClick={() => { setItemKiosco({ producto: p.producto, precio: p.precio_venta.toString(), cantidad: itemKiosco.cantidad }); setSugerenciasKiosco([]); }} className="px-3 py-2 hover:bg-green-100 cursor-pointer text-sm">
                            {p.producto} - ${p.precio_venta.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <input type="number" placeholder="Cantidad" value={itemKiosco.cantidad} onChange={(e) => setItemKiosco({...itemKiosco, cantidad: e.target.value})} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
                  </div>
                  
                  <div>
                    <input type="number" placeholder="Precio" value={itemKiosco.precio} onChange={(e) => setItemKiosco({...itemKiosco, precio: e.target.value})} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
                  </div>
                </div>
                
                <button onClick={agregarAlCarrito} className="mt-3 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2">
                  <ShoppingCart size={20} />
                  AGREGAR
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">🛒 CARRITO</h3>
              
              <table className="w-full text-sm mb-6">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-2 py-2">Producto</th>
                    <th className="px-2 py-2">Cant</th>
                    <th className="px-2 py-2">Precio</th>
                    <th className="px-2 py-2">Subtotal</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Carrito vacío</td></tr>
                  ) : (
                    carrito.map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-2 py-2">{item.producto}</td>
                        <td className="px-2 py-2 text-center">{item.cantidad}</td>
                        <td className="px-2 py-2 text-center">${item.precio.toFixed(2)}</td>
                        <td className="px-2 py-2 text-center font-bold text-green-600">${item.subtotal.toFixed(2)}</td>
                        <td className="px-2 py-2 text-center">
                          <button onClick={() => quitarDelCarrito(i)} className="bg-red-500 hover:bg-red-600 text-white p-1 rounded">
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-yellow-50 p-4 rounded-lg">
                <div>
                  <span className="text-2xl font-semibold">TOTAL: </span>
                  <span className="text-4xl font-bold text-green-600">${totalCarrito.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={finalizarVentaCarrito} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-xl">
                    ✅ FINALIZAR
                  </button>
                  <button onClick={() => { setCarrito([]); setVentaKiosco({ cliente: '', formaPago: 'Contado' }); }} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-lg font-bold">
                    🧹 LIMPIAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB REPORTES */}
        {tabActiva === 'reportes' && (
          <div className="space-y-6">
            <div className="bg-cyan-50 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-cyan-800 mb-4">📅 FILTROS</h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Desde:</label>
                  <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Hasta:</label>
                  <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                </div>
                
                <button onClick={buscarVentas} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 self-end">
                  <Search size={20} />
                  BUSCAR
                </button>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">📤 EXPORTAR</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={exportarCierreDia} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                  <Download size={20} />
                  📊 CIERRE HOY
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">📊 RESULTADOS</h3>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-cyan-600 text-white">
                    <tr>
                      <th className="px-2 py-2">Fecha</th>
                      <th className="px-2 py-2">Cliente</th>
                      <th className="px-2 py-2">Producto</th>
                      <th className="px-2 py-2">Cant</th>
                      <th className="px-2 py-2">Total</th>
                      <th className="px-2 py-2">Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasFiltradas.length === 0 ? (
                      <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No hay ventas en este rango</td></tr>
                    ) : (
                      ventasFiltradas.map((v, i) => (
                        <tr key={v.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-2 py-2 text-xs">{v.fecha}</td>
                          <td className="px-2 py-2">{v.cliente}</td>
                          <td className="px-2 py-2">{v.producto}</td>
                          <td className="px-2 py-2 text-center">{v.cantidad}</td>
                          <td className="px-2 py-2 text-center font-bold text-green-600">${v.total.toFixed(2)}</td>
                          <td className="px-2 py-2 text-center text-xs">{v.formaPago}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm font-semibold text-gray-700">💳 Transferencia:</div>
                    <div className="text-2xl font-bold text-blue-600">${totales.transferencia.toFixed(2)}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold text-gray-700">💵 Contado:</div>
                    <div className="text-2xl font-bold text-green-600">${totales.contado.toFixed(2)}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold text-gray-700">💰 TOTAL:</div>
                    <div className="text-3xl font-bold text-purple-600">${totales.total.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LOLOApp;