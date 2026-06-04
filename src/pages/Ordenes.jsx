import { useState, useEffect } from "react";
import Master from "../components/Master";
import api from "../api/client";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import "../assets/css/botones.css";
import "../assets/css/reservas.css";
import "../assets/css/ordenes.css";

function Ordenes() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mesas, setMesas] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [activeFilter, setActiveFilter] = useState("todos");

  // 👉 Nuevo
  const [selectedPago, setSelectedPago] = useState(null);
  const [pagoRecibido, setPagoRecibido] = useState("");

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && selectedReserva) {
        setSelectedReserva(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedReserva]);

  // Filtros
  const filters = [
    { key: "todos", label: "Todos", status: [1, 2, 3] },
    { key: "pendiente", label: "Pendiente", status: 1 },
    { key: "en-proceso", label: "En Proceso", status: 2 },
    { key: "completado", label: "Completado", status: 3 }
  ];

  useEffect(() => {
    fetchPedidos();
    fetchMesas();
    fetchProducts();
  }, []);

  const fetchPedidos = async () => {
    try {
      const [ordenesRes, carritosRes] = await Promise.all([
        api.get("api/cocina/ordenes"),
        api.get("api/cocina/carrito")
      ]);

      const ordenesUnificadas = ordenesRes.data.map(o => ({
        id_pedido: o.id_orden,
        tipo: "orden",
        status: o.status_comida,
        hora_comida: o.hora_comida,
        productos: o.productos,
        reserva: o.reserva || null
      }));

      const carritosUnificados = carritosRes.data.map(c => ({
        id_pedido: c.id_carrito,
        tipo: "carrito",
        status: c.status_carrito,
        hora_comida: c.hora_comida,
        productos: c.productos,
        usuario: c.usuario || null
      }));

      const pedidosCombinados = [...ordenesUnificadas, ...carritosUnificados];
      setPedidos(pedidosCombinados);
      setFilteredPedidos(pedidosCombinados);
    } catch (err) {
      console.error("Error al cargar pedidos", err);
      setError("No se pudieron cargar los pedidos. Intenta más tarde.");
      toast.error("Error al cargar pedidos");
    }
  };

  const fetchMesas = async () => {
    try {
      const response = await api.get("api/mesas");
      setMesas(response.data);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar las mesas.");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("api/productos");
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar los productos.");
    }
  };

  const getMesaNombre = (id_mesa) => {
    const mesa = mesas.find(m => m.id === id_mesa);
    return mesa ? mesa.nombre : "Mesa #" + id_mesa;
  };

  const getProductData = (idproducto) => {
    return products.find(p => p.idproducto === idproducto) || {};
  };

  const handleEstadoChange = async (id_orden, nuevoEstado) => {
    try {
      await api.put(`api/cocina/ordenes/${id_orden}`, { estado_orden: nuevoEstado });
      setPedidos(prev =>
        prev.map(p =>
          p.id_pedido === id_orden && p.tipo === "orden"
            ? { ...p, status: nuevoEstado }
            : p
        )
      );
      toast.success("Estado de la orden actualizado");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el estado");
    }
  };

  const handleEstadoChangeCarrito = async (id_carrito, nuevoEstado) => {
    try {
      await api.put(`api/cocina/carrito/${id_carrito}`, { estado_carrito: nuevoEstado });
      setPedidos(prev =>
        prev.map(p =>
          p.id_pedido === id_carrito && p.tipo === "carrito"
            ? { ...p, status: nuevoEstado }
            : p
        )
      );
      toast.success("Estado del carrito actualizado");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el estado del carrito");
    }
  };

  useEffect(() => {
    let result = pedidos;

    if (searchTerm) {
      result = result.filter(p =>
        p.id_pedido.toString().includes(searchTerm) ||
        (p.productos && p.productos.some(prod =>
          getProductData(prod.idproducto).nombre?.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    const activeFilterObj = filters.find(f => f.key === activeFilter);
    if (activeFilterObj && activeFilterObj.status) {
      if (Array.isArray(activeFilterObj.status)) {
        result = result.filter(p => activeFilterObj.status.includes(p.status));
      } else {
        result = result.filter(p => p.status === activeFilterObj.status);
      }
    }

    setFilteredPedidos(result);
  }, [searchTerm, activeFilter, pedidos, products]);

  const getEstadoText = (status) => {
    switch(status) {
      case 1: return "Pendiente";
      case 2: return "En Proceso";
      case 3: return "Completado";
      default: return "Pendiente";
    }
  };

  const getEstadoColor = (status) => {
    switch(status) {
      case 1: return "#dc3545";
      case 2: return "#ffc107";
      case 3: return "#198754";
      default: return "#dc3545";
    }
  };

  // 👉 NUEVA FUNCIÓN PARA PAGAR
  const handlePagarPedido = async () => {
    try {
      const res = await api.put(
        `api/orden/${selectedPago.id_pedido}/pago`,
        {
          monto_pagado: pagoRecibido,
          metodo_pago: "Efectivo"
        }
      );

      toast.success("Pago realizado correctamente");

      // Actualizar UI
      setPedidos(prev =>
        prev.map(p =>
          p.id_pedido === selectedPago.id_pedido
            ? {
                ...p,
                productos: p.productos.map(prod => ({
                  ...prod,
                  status_pagado: 1
                }))
              }
            : p
        )
      );

      setSelectedPago(null);
      setPagoRecibido("");

    } catch (err) {
      console.error(err);
      toast.error("Error al registrar el pago");
    }
  };

  return (
    <Master
      titulo={<h1><strong>Pedidos de Cocina</strong></h1>}
      contenido={
        <div className="container py-3" style={{ minHeight: "100vh" }}>
          {error && <div className="alert alert-danger text-center">{error}</div>}

          {/* Barra de búsqueda */}
          <div className="row mb-3">
            <div className="col-md-12">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar por id o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="row mb-3">
            <div className="col-12 d-flex flex-wrap gap-2">
              {filters.map(filter => (
                <button
                  key={filter.key}
                  className={`btn btn-sm ${activeFilter === filter.key ? 'button-filtrado' : 'button-filtrado:hover'}`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjetas */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3">
            {filteredPedidos.length > 0 ? (
              filteredPedidos.map(p => (
                <div key={p.id_pedido} className="col">
                  <div className="card h-100 shadow-sm border-0 compact-order-card">
                    <div className="card-header py-2 d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold">
                        {p.tipo === "orden" ? "Id_Orden" : "Id_Carrito"} # {p.id_pedido}
                      </h6>

                      <div className="d-flex align-items-center gap-1">
                        <span 
                          className="badge"
                          style={{ 
                            backgroundColor: getEstadoColor(p.status),
                            color: p.status === 2 ? '#000' : '#fff',
                            fontSize: '0.7rem'
                          }}
                        >
                          {getEstadoText(p.status)}
                        </span>

                        <span className="badge bg-info text-dark" style={{ fontSize: '0.65rem' }}>
                          {p.tipo === 'orden' ? 'Orden' : 'Carrito'}
                        </span>
                      </div>
                    </div>

                    <div className="card-body p-2">

                      {/* Reserva asociada */}
                      {p.tipo === "orden" && p.reserva && (
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">
                            <strong>Reserva:</strong> {p.reserva.hora_reserva}
                          </small>
                          <button
                            className="btn btn-sm btn-outline-primary py-0 px-2"
                            onClick={() => setSelectedReserva(p.reserva)}
                            style={{ fontSize: '0.7rem' }}
                          >
                            Ver
                          </button>
                        </div>
                      )}

                      {/* Usuario (Carrito) */}
                      {p.tipo === "carrito" && p.usuario && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <strong>Usuario:</strong> {p.usuario.nombre} ({p.usuario.email})
                          </small>
                        </div>
                      )}

                      {/* Lista de productos */}
                      <div className="productos-list">
                        {p.productos.map((prodItem, idx) => {
                          const prod = getProductData(prodItem.idproducto);
                          return (
                            <div key={idx} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                              <span className="small">{prod.nombre || `Producto #${prodItem.idproducto}`}</span>
                              <span className="badge bg-secondary small">{prodItem.cantidad}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Select de estado */}
                      <div className="mt-2">
                        <select
                          className="form-select form-select-sm"
                          value={p.status}
                          onChange={async (e) => {
                            const nuevoEstado = parseInt(e.target.value);
                            if(p.tipo === "orden"){
                              await handleEstadoChange(p.id_pedido, nuevoEstado);
                            } else if (p.tipo === "carrito") {
                              await handleEstadoChangeCarrito(p.id_pedido, nuevoEstado);
                            }
                          }}
                        >
                          <option value={1}>Pendiente</option>
                          <option value={2}>En Proceso</option>
                          <option value={3}>Completado</option>
                        </select>
                      </div>

                      {/* 👉 BOTÓN PAGAR (solo cuando el estado es completado) */}
                      {p.productos.some(prod => prod.status_pagado === 3) && (
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-success btn-sm mt-2 w-75"
                          onClick={() => {

                            // Filtrar solo productos pendientes de pago
                            const productosPendientes = p.productos.filter(
                              prod => prod.status_pagado === 3
                            );

                            // Total solo de productos no pagados
                            const total = productosPendientes.reduce((acc, prod) => {
                              const pr = getProductData(prod.idproducto);
                              return acc + (pr.precio * prod.cantidad);
                            }, 0);

                            setSelectedPago({
                              ...p,
                              productos: productosPendientes,
                              total
                            });
                          }}
                        >
                          Pagar
                        </button>
                      </div>
                    )}



                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5 text-muted">
                No se encontraron pedidos.
              </div>
            )}
          </div>

          {/* Modal Reserva */}
          <Modal
            show={!!selectedReserva}
            onHide={() => setSelectedReserva(null)}
            backdrop="static"
            keyboard
            centered
            
          >
            <Modal.Header closeButton>
              <Modal.Title>Reserva asociada</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedReserva && (
                <>
                  <p><strong>Cliente:</strong> {selectedReserva.cliente_reserva}</p>
                  <p><strong>Mesa:</strong> {getMesaNombre(selectedReserva.id_mesa)}</p>
                  <p><strong>Fecha:</strong> {selectedReserva.fecha_reserva}</p>
                  <p><strong>Hora:</strong> {selectedReserva.hora_reserva}</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedReserva(null)}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* 👉 MODAL DE PAGO */}
          <Modal
            show={!!selectedPago}
            onHide={() => {
              setSelectedPago(null);
              setPagoRecibido("");
            }}
            centered
            backdrop="static"
            keyboard={true}

          >
            <Modal.Header closeButton>
              <Modal.Title>Pagar Pedido #{selectedPago?.id_pedido}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {selectedPago && (
                <>
                  <p><strong>Total a pagar:</strong> ${selectedPago.total}</p>

                  <label className="form-label mt-2">Cantidad recibida</label>
                  <input
                    type="number"
                    className="form-control"
                    value={pagoRecibido}
                    onChange={(e) => setPagoRecibido(e.target.value)}
                  />

                  {pagoRecibido && (
                    <p className="mt-3">
                      <strong>Cambio:</strong>{" "}
                      ${Math.max(0, pagoRecibido - selectedPago.total)}
                    </p>
                  )}
                </>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedPago(null)}>
                Cancelar
              </Button>

              <Button
                variant="success"
                disabled={!pagoRecibido || pagoRecibido < selectedPago?.total}
                onClick={handlePagarPedido}
              >
                Confirmar Pago
              </Button>
            </Modal.Footer>
          </Modal>

        </div>
      }
    />
  );
}

export default Ordenes;
