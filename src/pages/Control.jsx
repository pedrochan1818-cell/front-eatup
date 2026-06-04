import { useState, useEffect } from "react";
import Master from "../components/Master";
import api from "../api/client";
import { toast } from "react-toastify";
import "../assets/css/Control.css";

function Control() {
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [selectedMesa, setSelectedMesa] = useState(null);
  const [showMesaModal, setShowMesaModal] = useState(false);

  useEffect(() => {
    fetchReservas();
    fetchMesas();
  }, []);

  const fetchReservas = async () => {
    try {
      const response = await api.get("api/cocina/control"); // Endpoint Laravel
      const sorted = response.data.sort((a, b) => a.hora.localeCompare(b.hora));
      setReservas(sorted);
    } catch (error) {
      console.error("Error al obtener reservas", error);
      toast.error("No se pudieron cargar las reservas");
    }
  };

  const fetchMesas = async () => {
    try {
      const response = await api.get("api/mesas");
      setMesas(response.data);
    } catch (error) {
      console.error("Error al cargar mesas", error);
      toast.error("No se pudieron cargar las mesas");
    }
  };

  const handleVerOrden = (reserva) => {
    setSelectedOrden(reserva);
    setShowModal(true);
  };

  const handleVerMesa = (id) => {
    const mesa = mesas.find((m) => m.id === id);
    setSelectedMesa(mesa);
    setShowMesaModal(true);
  };

  const getNombreMesa = (id) => {
    const mesa = mesas.find((m) => m.id === id);
    return mesa ? mesa.nombre : "Desconocida";
  };

  const getStatusLabel = (value) => {
    switch (parseInt(value)) {
      case 1:
        return "Pendiente";
      case 2:
        return "En Proceso";
      case 3:
        return "Completado";
      default:
        return "Desconocido";
    }
  };

  return (
    <Master
      titulo={<h1><strong>Control de Cocina</strong></h1>}
      contenido={
        <div className="container py-4" style={{ minHeight: "100vh" }}>
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Mesa</th>
                <th>Nombre</th>
                <th>Personas</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado de la orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id_reserva}>
                  <td>
                    <button
                      className="btn-outline-primary"
                      onClick={() => handleVerMesa(reserva.id_mesa)}
                    >
                      {getNombreMesa(reserva.id_mesa)}
                    </button>
                  </td>
                  <td>{reserva.nombre}</td>
                  <td>{reserva.no_persona}</td>
                  <td>{reserva.fecha}</td>
                  <td>{reserva.hora}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={reserva.status_comida}
                      onChange={(e) => console.log("Nuevo status:", e.target.value)}
                    >
                      <option value="1">Pendiente</option>
                      <option value="2">En Proceso</option>
                      <option value="3">Completado</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleVerOrden(reserva)}
                    >
                      <i className="bi bi-eye me-1"></i> Ver Orden
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal de Orden */}
          {showModal && selectedOrden && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title">Orden de {selectedOrden.nombre}</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p><strong>ID Orden:</strong> {selectedOrden.id_orden}</p>
                    <p><strong>Status:</strong> {getStatusLabel(selectedOrden.status_comida)}</p>
                    <p><strong>Fecha:</strong> {selectedOrden.fecha_orden}</p>
                    <p><strong>Hora comida:</strong> {selectedOrden.hora_comida}</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Mesa */}
          {showMesaModal && selectedMesa && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-fullscreen">

                <div className="modal-content">
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title">Mesa: {selectedMesa.nombre}</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setShowMesaModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p><strong>ID:</strong> {selectedMesa.id}</p>
                    <p><strong>Asientos:</strong> {selectedMesa.asientos}</p>
                    <p><strong>Estado:</strong> {selectedMesa.estado}</p>

                    {/* Mini plano */}
                    <div
                      style={{
                        width: "300px",
                        height: "200px",
                        border: "1px solid black",
                        position: "relative",
                        marginTop: "10px",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: `${selectedMesa.x}px`,
                          top: `${selectedMesa.y}px`,
                          fontSize: "24px",
                          color: selectedMesa.estado === "ocupada" ? "red" : "green",
                        }}
                      >
                        🪑
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowMesaModal(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      }
    />
  );
}

export default Control;
