import { useState, useEffect } from "react";
import Master from "../components/Master";
import api from "../api/client";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import "../assets/css/botones.css";
import "../assets/css/reservas.css";

function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("1"); // Por defecto: Confirmadas
  const [error, setError] = useState(null);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [mesas, setMesas] = useState([]); 

  useEffect(() => {
    fetchReservas();
    fetchMesas();

    const handleEsc = (event) => {
      if (event.key === "Escape" && selectedOrden) {
        setSelectedOrden(null);
      }
    };   
    window.addEventListener("keydown", handleEsc);
  
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
    
  }, [selectedOrden]);

  const fetchReservas = async () => {
    try {
      const response = await api.get("api/cocina/reservas");
      setReservas(response.data);
      setFilteredReservas(response.data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las reservas.");
      toast.error("Error al cargar reservas");
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

  const getMesaNombre = (id_mesa) => {
    const mesa = mesas.find((m) => m.id === id_mesa);
    return mesa ? mesa.nombre : "Mesa #" + id_mesa;
  };

  const handleEstadoReservaChange = async (id_reserva, nuevoEstado) => {
    try {
      await api.put(`api/reservas/${id_reserva}/estado`, { status_reserva: Number(nuevoEstado) });
      setReservas(prev =>
        prev.map(r =>
          r.id_reserva === id_reserva ? { ...r, status_reserva: Number(nuevoEstado) } : r
        )
      );
      toast.success("Estado de la reserva actualizado");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el estado de la reserva");
    }
  };

  const getEstadoOrdenText = (status) => {
    switch(status) {
      case 1: return "Pendiente";
      case 2: return "En Proceso";
      case 3: return "Completado";
      case 4: return "Cancelado";
      case 5: return "Confirmado";
      default: return "Pendiente";
    }
  };

  useEffect(() => {
    let result = reservas;

    if (searchTerm) {
      result = result.filter((r) =>
        r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const status = parseInt(activeFilter);
    result = result.filter((r) => r.status_reserva === status);

    setFilteredReservas(result);
  }, [searchTerm, activeFilter, reservas]);

  return (
    <Master
      titulo={<h1 className="panel-reservas-title">Control de Reservas</h1>}
      contenido={
        <div className="panel-reservas-container">
          {error && <div className="alert alert-danger text-center">{error}</div>}

          {/* 🔍 Buscador */}
          <div className="row mb-3">
            <div className="col-12 col-md-12 mb-2 mb-md-0">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar por nombre del cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 🧭 Filtros por estado */}
          <div className="col-12 col-md-6">
            <div className="d-flex flex-wrap gap-2">
              {[
                { key: "1", label: "Confirmadas" },
                { key: "2", label: "Canceladas" },
                { key: "3", label: "En Proceso" },
                { key: "4", label: "Terminadas" },
              ].map((filter) => (
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
          <br />

          {/* 🧾 Tarjetas de Reservas */}
          <div className="panel-reservas-grid">
            {filteredReservas.length > 0 ? (
              filteredReservas.map((r) => (
                <div
                  key={r.id_reserva}
                  className={`reserva-panel-card ${
                    r.status_reserva === 1
                      ? "confirmada"
                      : r.status_reserva === 2
                      ? "cancelada"
                      : r.status_reserva === 3
                      ? "proceso"
                      : "terminada"
                  }`}
                >
                  <h5 className="reserva-panel-titulo">{r.nombre}</h5>
                  <p className="reserva-panel-info">Personas: {r.no_persona}</p>
                  <p className="reserva-panel-info">Mesa: {getMesaNombre(r.id_mesa)}</p>
                  <p className="reserva-panel-info">Fecha: {r.fecha}</p>
                  <p className="reserva-panel-info">Hora: {r.hora}</p>

                  <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                    <select
                      className="reserva-panel-select"
                      value={r.status_reserva || 1}
                      onChange={(e) => handleEstadoReservaChange(r.id_reserva, e.target.value)}
                    >
                      <option value={1}>Confirmado</option>
                      <option value={3}>En Proceso</option>
                      <option value={4}>Terminado</option>
                    </select>

                    {r.orden && (
                      <button
                        className="reserva-panel-btn btn-ver-orden"
                        onClick={() => setSelectedOrden(r.orden)}
                      >
                        <i className="fas fa-utensils"></i> Ver Orden
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-light text-center">
                No se encontraron reservas con estado "{["","Confirmadas","Canceladas","En Proceso","Terminadas"][activeFilter]}"
              </p>
            )}
          </div>

          {/* 🪟 Modal Bootstrap */}
          <Modal
            show={!!selectedOrden}
            onHide={() => setSelectedOrden(null)}
            centered
            backdrop="static"  // No se cierra al hacer click afuera
          >
            <Modal.Header closeButton>
              <Modal.Title>Orden</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedOrden && (
                <>
                  <p><strong>Estado:</strong> {getEstadoOrdenText(selectedOrden.estado_orden)}</p>
                  <p><strong>Hora comida:</strong> {selectedOrden.hora_comida} Min</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedOrden(null)}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      }
    />
  );
}

export default Reservas;
