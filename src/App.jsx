import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
  const [tabActiva, setTabActiva] = useState('precios');;
  const [busquedaPrecios, setBusquedaPrecios] = useState('');
  
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

  useEffect(() => {
    cargarDesdeFirebase();
  }, []);

  const cargarDesdeFirebase = async () => {
    try {
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      const productosData = productosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(productosData);

      const ventasSnapshot = await getDocs(collection(db, 'ventas'));
      const ventasData = ventasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVentas(ventasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

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

  const guardarProducto = async () => {
    if (!formProd.producto) {
      alert('⚠️ Ingrese nombre del producto');
      return;
    }
    
    const { precioVenta, ganancia } = calcularPrecioVenta(
      formProd.costo, formProd.envio, formProd.ct_ganancia
    );
    
    const producto = {
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
    
    try {
      if (productoEditando) {
        await updateDoc(doc(db, 'productos', productoEditando.id), producto);
        setProductos(productos.map(p => p.id === productoEditando.id ? {...producto, id: productoEditando.id} : p));
        alert('✅ Producto actualizado en la nube');
      } else {
        const docRef = await addDoc(collection(db, 'productos'), producto);
        setProductos([...productos, {...producto, id: docRef.id}]);
        alert('✅ Producto agregado a la nube');
      }
      
      limpiarFormProd();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar en la nube');
    }
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

  const eliminarProducto = async (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'productos', id));
        setProductos(productos.filter(p => p.id !== id));
        alert('✅ Producto eliminado de la nube');
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar');
      }
    }
  };

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

  const registrarVentaRapida = async () => {
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
    
    let precio = parseFloat(ventaRapida.precio);

    // Aplicar 20% descuento si es Contado
    if (ventaRapida.formaPago === 'Contado') {
      precio = precio * 1; // 20% descuento
    }

const total = cantidad * precio;
    
    const venta = {
      fecha: new Date().toLocaleString('es-AR'),
      cliente: ventaRapida.cliente,
      producto: ventaRapida.producto,
      cantidad: cantidad,
      precio: precio,
      total: total,
      formaPago: ventaRapida.formaPago
    };
    
    try {
      const docRef = await addDoc(collection(db, 'ventas'), venta);
      setVentas([...ventas, {...venta, id: docRef.id}]);
      
      const nuevoStock = prod.stock - cantidad;
      await updateDoc(doc(db, 'productos', prod.id), { stock: nuevoStock });
      setProductos(productos.map(p => 
        p.id === prod.id ? {...p, stock: nuevoStock} : p
      ));
      
      alert(`✅ Venta en la nube\n💰 Total: $${total.toFixed(2)}\n📦 Stock: ${nuevoStock}`);
      
      setVentaRapida({
        cliente: '', producto: '', cantidad: '', precio: '', formaPago: 'Contado'
      });
      setSugerencias([]);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al registrar venta');
    }
  };

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
    
    let precio = parseFloat(itemKiosco.precio);

    // Aplicar 20% descuento si es Contado
    if (ventaKiosco.formaPago === 'Contado') {
       precio = precio * 1;
    }

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

  const finalizarVentaCarrito = async () => {
    if (carrito.length === 0) {
      alert('⚠️ El carrito está vacío');
      return;
    }
    
    if (!ventaKiosco.cliente) {
      alert('⚠️ Ingrese nombre del cliente');
      return;
    }
    
    const fecha = new Date().toLocaleString('es-AR');
    
    try {
      const nuevasVentas = [];
      
      for (const item of carrito) {
        const venta = {
          fecha: fecha,
          cliente: ventaKiosco.cliente,
          producto: item.producto,
          cantidad: item.cantidad,
          precio: item.precio,
          total: item.subtotal,
          formaPago: ventaKiosco.formaPago
        };
        
        const docRef = await addDoc(collection(db, 'ventas'), venta);
        nuevasVentas.push({...venta, id: docRef.id});
        
        const prod = productos.find(p => p.producto === item.producto);
        const nuevoStock = prod.stock - item.cantidad;
        await updateDoc(doc(db, 'productos', prod.id), { stock: nuevoStock });
        
        setProductos(prevProds => prevProds.map(p =>
          p.id === prod.id ? {...p, stock: nuevoStock} : p
        ));
      }
      
      setVentas([...ventas, ...nuevasVentas]);
      
      const totalVenta = carrito.reduce((sum, item) => sum + item.subtotal, 0);
      
      alert(`✅ VENTA EN LA NUBE\n\n💰 Total: $${totalVenta.toFixed(2)}\n📦 ${carrito.length} productos\n👤 ${ventaKiosco.cliente}`);
      
      setCarrito([]);
      setVentaKiosco({ cliente: '', formaPago: 'Contado' });
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al finalizar venta');
    }
  };

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

  const importarProductos = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const text = event.target.result;
      const lines = text.split('\n').slice(1); // Salta el header
      
      let importados = 0;
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        // CAMBIO: Ahora usa punto y coma (;) en vez de coma
        const [producto, costo, envio, , , ct_ganancia, proveedor, rubro, stock] = line.split(';');
        
        if (!producto || !producto.trim()) continue;
        
        const { precioVenta, ganancia } = calcularPrecioVenta(costo, envio, ct_ganancia);
        
        const nuevoProd = {
          producto: producto.trim(),
          costo: parseFloat(costo) || 0,
          envio: parseFloat(envio) || 0,
          precio_venta: precioVenta,
          ganancia: ganancia,
          ct_ganancia: parseFloat(ct_ganancia) || 80,
          proveedor: proveedor?.trim() || '',
          rubro: rubro?.trim() || '',
          stock: parseInt(stock) || 0
        };
        
        const docRef = await addDoc(collection(db, 'productos'), nuevoProd);
        setProductos(prev => [...prev, {...nuevoProd, id: docRef.id}]);
        importados++;
      }
      
      alert(`✅ ${importados} productos importados a la nube`);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al importar: ' + error.message);
    }
  };
  reader.readAsText(file, 'UTF-8'); // Importante para caracteres especiales
};
const eliminarVenta = async (venta) => {
  if (!window.confirm(`¿Anular esta venta?\n\nCliente: ${venta.cliente}\nProducto: ${venta.producto}\nTotal: $${venta.total.toFixed(2)}\n\n⚠️ Se devolverá el stock`)) {
    return;
  }
  
  try {
    // Borrar de Firebase
    await deleteDoc(doc(db, 'ventas', venta.id));
    
    // Devolver stock
    const prod = productos.find(p => p.producto === venta.producto);
    if (prod) {
      const nuevoStock = prod.stock + venta.cantidad;
      await updateDoc(doc(db, 'productos', prod.id), { stock: nuevoStock });
      setProductos(productos.map(p => 
        p.id === prod.id ? {...p, stock: nuevoStock} : p
      ));
    }
    
    // Actualizar lista de ventas
    setVentas(ventas.filter(v => v.id !== venta.id));
    setVentasFiltradas(ventasFiltradas.filter(v => v.id !== venta.id));
    
    alert('✅ Venta anulada y stock devuelto');
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al anular venta');
  }
};  
  const precioCalcResult = calcularPrecioVenta(
    formProd.costo, formProd.envio, formProd.ct_ganancia
  );
  const precioCalc = precioCalcResult?.precioVenta || 0;
  const gananciaCalc = precioCalcResult?.ganancia || 0;
  
  const totalVentaRapida = (parseFloat(ventaRapida.cantidad) || 0) * (parseFloat(ventaRapida.precio) || 0);
  const totalCarrito = carrito.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
  const calcularTotalesSeguro = () => {
    if (!ventasFiltradas || ventasFiltradas.length === 0) {
      return { tarjeta: 0, contado: 0, total: 0 };
    }
    
    const tarjeta = ventasFiltradas
      .filter(v => v.formaPago === 'Tarjeta' || v.formaPago === 'tarjeta')
      .reduce((sum, v) => sum + (v.total || 0), 0);
    
    const contado = ventasFiltradas
      .filter(v => v.formaPago === 'Contado')
      .reduce((sum, v) => sum + (v.total || 0), 0);
    
    return { tarjeta, contado, total: tarjeta + contado };
  };
  
  const totales = calcularTotalesSeguro();
  
  const productosFiltrados = productos.filter(p =>
    p.producto.toLowerCase().includes(busquedaProd.toLowerCase()) ||
    (p.rubro || '').toLowerCase().includes(busquedaProd.toLowerCase()) ||
    (p.proveedor || '').toLowerCase().includes(busquedaProd.toLowerCase())
  );
return (
    <div className="app-container">
      <div className="header">
        <div className="header-content">
          <div className="logo">🛍️</div>
          <div>
            <h1 className="title">LOLO - Sobre Ruedas</h1>
            <p className="subtitle">Sistema con Firebase ☁️🔥</p>
          </div>
        </div>
      </div>

     <div className="tabs">
  <button onClick={() => setTabActiva('precios')} className={`tab ${tabActiva === 'precios' ? 'active' : ''}`}>
    <Search /> PRECIOS RÁPIDOS
  </button>
  <button onClick={() => setTabActiva('productos')} className={`tab ${tabActiva === 'productos' ? 'active' : ''}`}>
    <Package /> PRODUCTOS
  </button>
  <button onClick={() => setTabActiva('venta-rapida')} className={`tab ${tabActiva === 'venta-rapida' ? 'active' : ''}`}>
    <DollarSign /> VENTA RÁPIDA
  </button>
  <button onClick={() => setTabActiva('kiosco')} className={`tab ${tabActiva === 'kiosco' ? 'active' : ''}`}>
    <ShoppingCart /> PUNTO DE VENTA
  </button>
  <button onClick={() => setTabActiva('reportes')} className={`tab ${tabActiva === 'reportes' ? 'active' : ''}`}>
    <BarChart3 /> REPORTES
  </button>
</div>

      <div className="content">
  {tabActiva === 'precios' && (
  <div>
    <div className="card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <h2 className="card-title" style={{color: 'white', fontSize: '1.5rem'}}>🔍 BUSCADOR DE PRECIOS</h2>
      
      <div className="search-box" style={{marginTop: '1rem', background: 'white'}}>
                <Search />
               <input
  type="text"
  placeholder="Escribe las primeras letras del producto..."
  value={busquedaPrecios}
  onChange={(e) => setBusquedaPrecios(e.target.value.toUpperCase())}
  style={{
    fontSize: '1.25rem',
    padding: '1rem',
    outline: 'none',
    border: 'none'
  }}
  autoFocus
/>
              </div>
            </div>
            
            <div className="card">
              {busquedaPrecios.length === 0 ? (
                <div className="empty-state" style={{padding: '3rem', fontSize: '1.125rem'}}>
                  👆 Escribe las primeras letras para buscar productos
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead className="bg-purple">
                      <tr>
                        <th style={{fontSize: '1.125rem', padding: '1rem'}}>PRODUCTO</th>
                        <th className="text-center" style={{fontSize: '1.125rem', padding: '1rem'}}>💵 CONTADO (20% OFF)</th>
                        <th className="text-center" style={{fontSize: '1.125rem', padding: '1rem'}}>💳 TARJETA</th>
                      </tr>
                  </thead>
                    <tbody>
                      {productos
                        .filter(p => p.producto.toUpperCase().startsWith(busquedaPrecios))
                        .sort((a, b) => a.producto.localeCompare(b.producto))
                        .map((p) => (
                          <tr key={p.id}>
                            <td style={{fontSize: '1.25rem', padding: '1rem', fontWeight: 600}}>{p.producto}</td>
                            <td className="text-center" style={{fontSize: '1.5rem', padding: '1rem', fontWeight: 'bold', color: '#10b981'}}>
                              ${(p.precio_venta * 0.8).toFixed(2)}
                            </td>
                            <td className="text-center" style={{fontSize: '1.5rem', padding: '1rem', fontWeight: 'bold', color: '#3b82f6'}}>
                              ${p.precio_venta.toFixed(2)}
                            </td>
                            </tr>
                        ))}
                      {productos.filter(p => p.producto.toUpperCase().startsWith(busquedaPrecios)).length === 0 && (
                        <tr>
                          <td colSpan="3" className="empty-state" style={{padding: '2rem'}}>
                            No se encontraron productos que empiecen con "{busquedaPrecios}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {tabActiva === 'productos' && (
          <div>
            <div className="card">
              <h2 className="card-title">{productoEditando ? '📝 Editar' : '➕ Agregar'}</h2>
              
              <div className="form-grid">
                {['producto', 'costo', 'envio', 'ct_ganancia', 'stock', 'proveedor', 'rubro'].map(campo => (
                  <div key={campo} className="form-field">
                    <label>{campo === 'ct_ganancia' ? '% Ganancia' : campo.charAt(0).toUpperCase() + campo.slice(1)}:</label>
                    <input
                      type={['costo', 'envio', 'ct_ganancia', 'stock'].includes(campo) ? 'number' : 'text'}
                      value={formProd[campo]}
                      onChange={(e) => setFormProd({...formProd, [campo]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
              
              <div style={{marginTop: '1rem'}}>
                <span style={{fontSize: '0.875rem', fontWeight: 600}}>Precio: </span>
                <span className="text-green font-bold" style={{fontSize: '1.125rem'}}>${precioCalc.toFixed(2)}</span>
                <span style={{marginLeft: '2rem', fontSize: '0.875rem', fontWeight: 600}}>Ganancia: </span>
                <span className="text-blue font-bold" style={{fontSize: '1.125rem'}}>${gananciaCalc.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-3 flex-wrap mt-6">
                <button onClick={guardarProducto} className="btn btn-green">
                  <Plus /> {productoEditando ? 'Actualizar' : 'Agregar'}
                </button>
                
                {productoEditando && (
                  <button onClick={limpiarFormProd} className="btn btn-gray">Cancelar</button>
                )}
                
                <label className="btn btn-purple" style={{cursor: 'pointer'}}>
                  <Upload /> Importar CSV
                  <input type="file" accept=".csv" onChange={importarProductos} style={{display: 'none'}} />
                </label>
                
                <button onClick={exportarProductos} disabled={productos.length === 0} className="btn btn-blue">
                  <Download /> Exportar
                </button>
              </div>
            </div>
            
            <div className="search-box">
              <Search />
              <input
                type="text"
                placeholder="🔍 Buscar..."
                value={busquedaProd}
                onChange={(e) => setBusquedaProd(e.target.value)}
              />
            </div>
            
            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Costo</th>
                      <th className="text-center">Envío</th>
                      <th className="text-center">P.Venta</th>
                      <th className="text-center">Gan</th>
                      <th className="text-center">%</th>
                      <th>Proveedor</th>
                      <th className="text-center">Stock</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length === 0 ? (
                      <tr><td colSpan="9" className="empty-state">No hay productos</td></tr>
                    ) : (
                      productosFiltrados.map((p) => (
                        <tr key={p.id}>
                          <td className="font-bold">{p.producto}</td>
                          <td className="text-center">${p.costo.toFixed(2)}</td>
                          <td className="text-center">${p.envio.toFixed(2)}</td>
                          <td className="text-center text-green font-bold">${p.precio_venta.toFixed(2)}</td>
                          <td className="text-center text-blue">${p.ganancia.toFixed(2)}</td>
                          <td className="text-center">{p.ct_ganancia.toFixed(0)}%</td>
                          <td>{p.proveedor}</td>
                          <td className="text-center font-bold">{p.stock}</td>
                          <td className="text-center">
                            <div className="flex gap-3" style={{justifyContent: 'center'}}>
                              <button onClick={() => editarProducto(p)} className="btn btn-blue" style={{padding: '0.25rem 0.5rem'}}>
                                <Edit />
                              </button>
                              <button onClick={() => eliminarProducto(p.id)} className="btn btn-red" style={{padding: '0.25rem 0.5rem'}}>
                                <Trash2 />
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

        {tabActiva === 'venta-rapida' && (
          <div>
            <div className="card bg-blue">
              <h2 className="card-title">💰 VENTA RÁPIDA</h2>
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Cliente:</label>
                  <input type="text" value={ventaRapida.cliente} onChange={(e) => setVentaRapida({...ventaRapida, cliente: e.target.value})} />
                </div>
                
                <div className="form-field">
                  <label>Pago:</label>
                 <select value={ventaRapida.formaPago} onChange={(e) => setVentaRapida({...ventaRapida, formaPago: e.target.value})}>
                   <option>Contado</option>
                   <option>Tarjeta</option>
                 </select>
                </div>
                
                <div className="form-field autocomplete">
                  <label>Producto:</label>
                  <input type="text" value={ventaRapida.producto} onChange={(e) => { setVentaRapida({...ventaRapida, producto: e.target.value}); buscarProductoPredictivo(e.target.value, setSugerencias); }} />
                  {sugerencias.length > 0 && (
                    <div className="suggestions">
                      {sugerencias.map(p => (
                        <div key={p.id} onClick={() => { 
                                          const precioFinal = ventaRapida.formaPago === 'Contado' 
                                            ? (p.precio_venta * 0.8).toFixed(2) 
                                            : p.precio_venta.toFixed(2);
                                          setVentaRapida({...ventaRapida, producto: p.producto, precio: precioFinal}); 
                                          setSugerencias([]); 
                                        }} className="suggestion-item">
                          {p.producto} - ${p.precio_venta.toFixed(2)} (Stock: {p.stock})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="form-field">
                  <label>Cantidad:</label>
                  <input type="number" value={ventaRapida.cantidad} onChange={(e) => setVentaRapida({...ventaRapida, cantidad: e.target.value})} />
                </div>
                
                <div className="form-field">
                  <label>Precio:</label>
                  <input type="number" value={ventaRapida.precio} onChange={(e) => setVentaRapida({...ventaRapida, precio: e.target.value})} />
                </div>
                
                <div className="form-field">
                  <label>Stock:</label>
                  <div className="stock-badge">
                    {productos.find(p => p.producto === ventaRapida.producto)?.stock || 0}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between flex-wrap mt-6">
                <div>
                  <span style={{fontSize: '1.25rem', fontWeight: 600}}>TOTAL: </span>
                  <span className="total-display">${totalVentaRapida.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={registrarVentaRapida} className="btn btn-green" style={{fontSize: '1.125rem', padding: '0.75rem 2rem'}}>
                    <DollarSign /> VENDER
                  </button>
                  <button onClick={() => { setVentaRapida({ cliente: '', producto: '', cantidad: '', precio: '', formaPago: 'Contado' }); setSugerencias([]); }} className="btn btn-orange">
                    🧹 Limpiar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="card-title">📋 Últimas 10</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Producto</th>
                      <th className="text-center">Cant</th>
                      <th className="text-center">Total</th>
                      <th className="text-center">Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.slice(-10).reverse().map((v) => (
                      <tr key={v.id}>
                        <td style={{fontSize: '0.75rem'}}>{v.fecha}</td>
                        <td>{v.cliente}</td>
                        <td>{v.producto}</td>
                        <td className="text-center">{v.cantidad}</td>
                        <td className="text-center text-green font-bold">${v.total.toFixed(2)}</td>
                        <td className="text-center" style={{fontSize: '0.75rem'}}>{v.formaPago}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
{tabActiva === 'kiosco' && (
          <div>
            <div className="card bg-yellow">
              <h2 className="card-title">🛒 PUNTO DE VENTA</h2>
              
              <div className="form-grid" style={{marginBottom: '1.5rem'}}>
                <div className="form-field">
                  <label>Cliente:</label>
                  <input type="text" value={ventaKiosco.cliente} onChange={(e) => setVentaKiosco({...ventaKiosco, cliente: e.target.value})} />
                </div>
                
                <div className="form-field">
                  <label>Pago:</label>
                  <select value={ventaKiosco.formaPago} onChange={(e) => setVentaKiosco({...ventaKiosco, formaPago: e.target.value})}>
                    <option>Contado</option>
                    <option>Tarjeta</option>
                  </select>
                </div>
              </div>
              
              <div className="card bg-green">
                <h3 style={{fontWeight: 'bold', marginBottom: '0.75rem'}}>➕ Agregar</h3>
                <div className="form-grid">
                  <div className="form-field autocomplete" style={{gridColumn: 'span 2'}}>
                    <input type="text" placeholder="Buscar..." value={itemKiosco.producto} onChange={(e) => { setItemKiosco({...itemKiosco, producto: e.target.value}); buscarProductoPredictivo(e.target.value, setSugerenciasKiosco); }} />
                    {sugerenciasKiosco.length > 0 && (
                      <div className="suggestions">
                        {sugerenciasKiosco.map(p => (
                          <div key={p.id} onClick={() => { 
                                            const precioFinal = ventaKiosco.formaPago === 'Contado' 
                                              ? (p.precio_venta * 0.8).toFixed(2) 
                                              : p.precio_venta.toFixed(2);
                                              setItemKiosco({ producto: p.producto, precio: precioFinal, cantidad: itemKiosco.cantidad }); 
                                              setSugerenciasKiosco([]); 
                                            }} className="suggestion-item">
                            {p.producto} - ${p.precio_venta.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <input type="number" placeholder="Cantidad" value={itemKiosco.cantidad} onChange={(e) => setItemKiosco({...itemKiosco, cantidad: e.target.value})} />
                  </div>
                  
                  <div className="form-field">
                    <input type="number" placeholder="Precio" value={itemKiosco.precio} onChange={(e) => setItemKiosco({...itemKiosco, precio: e.target.value})} />
                  </div>
                </div>
                
                <button onClick={agregarAlCarrito} className="btn btn-green" style={{marginTop: '0.75rem'}}>
                  <ShoppingCart /> AGREGAR
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3 className="card-title">🛒 CARRITO</h3>
              
              <div className="table-container" style={{marginBottom: '1.5rem'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cant</th>
                      <th className="text-center">Precio</th>
                      <th className="text-center">Subtotal</th>
                      <th className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.length === 0 ? (
                      <tr><td colSpan="5" className="empty-state">Vacío</td></tr>
                    ) : (
                      carrito.map((item, i) => (
                        <tr key={i}>
                          <td>{item.producto}</td>
                          <td className="text-center">{item.cantidad}</td>
                          <td className="text-center">${item.precio.toFixed(2)}</td>
                          <td className="text-center text-green font-bold">${item.subtotal.toFixed(2)}</td>
                          <td className="text-center">
                            <button onClick={() => quitarDelCarrito(i)} className="btn btn-red" style={{padding: '0.25rem 0.5rem'}}>
                              <X />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="card bg-yellow">
                <div className="flex items-center justify-between flex-wrap">
                  <div>
                    <span style={{fontSize: '1.5rem', fontWeight: 600}}>TOTAL: </span>
                    <span style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#10b981'}}>${totalCarrito.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={finalizarVentaCarrito} className="btn btn-green" style={{fontSize: '1.25rem', padding: '1rem 2rem'}}>
                      ✅ FINALIZAR
                    </button>
                    <button onClick={() => { setCarrito([]); setVentaKiosco({ cliente: '', formaPago: 'Contado' }); }} className="btn btn-orange" style={{padding: '1rem 1.5rem'}}>
                      🧹 LIMPIAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'reportes' && (
          <div>
            <div className="card bg-cyan">
              <h2 className="card-title">📅 FILTROS</h2>
              
              <div className="flex gap-3 flex-wrap">
                <div className="form-field" style={{flex: 1, minWidth: '200px'}}>
                  <label>Desde:</label>
                  <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                </div>
                
                <div className="form-field" style={{flex: 1, minWidth: '200px'}}>
                  <label>Hasta:</label>
                  <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
                </div>
                
                <button onClick={buscarVentas} className="btn btn-blue" style={{alignSelf: 'flex-end'}}>
                  <Search /> BUSCAR
                </button>
              </div>
            </div>
            
            <div className="card bg-purple">
              <h2 className="card-title">📤 EXPORTAR</h2>
              <button onClick={exportarCierreDia} className="btn btn-purple">
                <Download /> 📊 CIERRE HOY
              </button>
            </div>
            
            <div className="card">
              <h3 className="card-title">📊 RESULTADOS</h3>
              
              <div className="table-container" style={{marginBottom: '1.5rem'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Producto</th>
                      <th className="text-center">Cant</th>
                      <th className="text-center">Total</th>
                      <th className="text-center">Pago</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasFiltradas.length === 0 ? (
                      <tr><td colSpan="7" className="empty-state">Sin ventas</td></tr>
                    ) : (
                    ventasFiltradas.map((v) => (
                       <tr key={v.id}>
                       <td style={{fontSize: '0.75rem'}}>{v.fecha}</td>
                       <td>{v.cliente}</td>
                       <td>{v.producto}</td>
                       <td className="text-center">{v.cantidad}</td>
                       <td className="text-center text-green font-bold">${v.total.toFixed(2)}</td>
                       <td className="text-center" style={{fontSize: '0.75rem'}}>{v.formaPago}</td>
                       <td className="text-center">
                         <button onClick={() => eliminarVenta(v)} className="btn btn-red" style={{padding: '0.25rem 0.5rem'}}>
                            <Trash2 />
                         </button>
                       </td>
                     </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="totals-box">
                <div className="totals-grid">
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: 600, color: '#6b7280'}}>💳 Tarjeta:</div>
                    <div className="text-blue" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>${totales.tarjeta.toFixed(2)}</div>
                  </div>
                  
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: 600, color: '#6b7280'}}>💵 Contado:</div>
                    <div className="text-green" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>${totales.contado.toFixed(2)}</div>
                  </div>
                  
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: 600, color: '#6b7280'}}>💰 TOTAL:</div>
                    <div style={{fontSize: '1.875rem', fontWeight: 'bold', color: '#9333ea'}}>${totales.total.toFixed(2)}</div>
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
