import React, { useState, useEffect } from "react";
import "../assets/css/botones.css"; 
import "../assets/css/mapeado.css";
import "../assets/css/barra_busqueda.css"; 
import Master from "../components/Master";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair } from "@fortawesome/free-solid-svg-icons";
import api from '../api/client'; 
import { Modal, Button } from "react-bootstrap";

const Mapeado = () => {
  const [mesas, setMesas] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false); 

  const [newMesa, setNewMesa] = useState({ 
    nombre: "", 
    estado: "", 
    x: 50, 
    y: 50, 
    asientos: "",
    descripcion: "",
    area: ""  // <-- NUEVO
  });

  const [editMesa, setEditMesa] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [mesasNuevas, setMesasNuevas] = useState([]);

  const [descripcionVisible, setDescripcionVisible] = useState(null);

  useEffect(() => {
    const cargarMesas = async () => {
      try {
        const response = await api.get("api/mesas");
        setMesas(response.data);
      } catch (error) {
        console.error("Error al cargar mesas:", error);
      }
    };
    
    cargarMesas();
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setModalOpen(false);
        setModalEditOpen(false);
        setEditMesa(null);
        setDescripcionVisible(null);
        setNewMesa({ nombre: "", estado: "", x: 50, y: 50, asientos: "", descripcion: "", area: "" });
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setDescripcionVisible(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleMouseDown = (id, e) => setDragging({ id, offsetX: e.clientX, offsetY: e.clientY });

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const deltaX = e.clientX - dragging.offsetX;
    const deltaY = e.clientY - dragging.offsetY;

    setMesas((prevMesas) =>
      prevMesas.map((mesa) =>
        mesa.id === dragging.id
          ? { ...mesa, x: mesa.x + deltaX, y: mesa.y + deltaY }
          : mesa
      )
    );

    setDragging({ id: dragging.id, offsetX: e.clientX, offsetY: e.clientY });

    if (tooltip) setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
  };

  const handleMouseUp = () => setDragging(null);

  const handleGuardar = async () => {
    try {
      const response = await api.post("api/mesa/operar", { operacion: "Guardar_posiciones", mesas });
      response.status === 200 ? toast.success("Posiciones guardadas con éxito.") : toast.error("Error al guardar las posiciones.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo conectar con la API.");
    }
  };

  const handleAgregarMesa = async () => {
    if (!newMesa.estado) return toast.error("Por favor, selecciona un estado para la mesa.");
    
    try {
      const response = await api.post("api/mesa/operar", { operacion: "Agregar", ...newMesa });

      if (response.data && response.data.mesa) {
        const nueva = response.data.mesa;
        setMesas((prev) => [...prev, nueva]);
        setMesasNuevas((prev) => [...prev, nueva.id]);
        setModalOpen(false);
        toast.success("Se agregó correctamente.");
        setNewMesa({ nombre: "", estado: "", x: 50, y: 50, asientos: "", descripcion: "", area: "" });

        setTimeout(() => {
          setMesasNuevas((prev) => prev.filter(id => id !== nueva.id));
        }, 40000);
      } else toast.error("No se pudo agregar la mesa, respuesta inesperada.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo conectar con la API.");
    }
  };

  const handleEditMesa = async () => {
    if (!editMesa.estado || !editMesa.nombre.trim() || !editMesa.asientos)
      return toast.error("Completa todos los campos correctamente.");
    
    try {
      const response = await api.post("api/mesa/operar", { operacion: "Editar", ...editMesa });

      if (response.status === 200) {
        setMesas((prev) => prev.map((m) => (m.id === response.data.mesa.id ? response.data.mesa : m)));
        setModalEditOpen(false);
        toast.success("Mesa actualizada correctamente.");
      } else toast.error("Error al editar la mesa.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo conectar con la API.");
    }
  };

  const handleDeleteMesa = async (id) => {
    try {
      const response = await api.post("api/mesa/operar", { operacion: "Eliminar", id });
      if (response.status === 200) {
        setMesas((prev) => prev.filter((mesa) => mesa.id !== id));
        toast.success("Mesa eliminada correctamente.");
      } else toast.error(response.data?.error || "Error al eliminar la mesa.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo conectar con la API.");
    }
  };

  const handleEstadoChange = async (mesa, nuevoEstado) => {
    try {
      const response = await api.post("api/mesa/operar", { operacion: "Editar", ...mesa, estado: nuevoEstado });
      if (response.status === 200) {
        setMesas((prev) => prev.map((m) => (m.id === mesa.id ? { ...m, estado: nuevoEstado } : m)));
        toast.success("Estado actualizado.");
      } else toast.error("Error al actualizar estado");
    } catch (error) {
      console.error(error);
      toast.error("Error de red al actualizar estado");
    }
  };

  const handleMouseEnter = (mesa, e) => setTooltip({ x: e.clientX, y: e.clientY, nombre: mesa.nombre, estado: mesa.estado });
  const handleMouseLeave = () => setTooltip(null);

  const filteredMesas = mesas.filter((mesa) =>
    mesa.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Master
      titulo={<h1><strong>Mapeado de Mesas</strong></h1>}
      contenido={
        <div>

          <div className="barra_busqueda">
            <input
              type="text"
              placeholder="Buscar mesa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="d-flex justify-content-center mb-3">
            <button className="button-agregar" onClick={handleGuardar}>Guardar Posiciones</button>
          </div>

          <div className="mapeado-container">
            <div
              style={{ width: "400px", height: "300px", border: "2px solid black", position: "relative" }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {filteredMesas.map((mesa) => (
                <div
                  key={mesa.id}
                  onMouseDown={(e) => handleMouseDown(mesa.id, e)}
                  onMouseEnter={(e) => handleMouseEnter(mesa, e)}
                  onMouseLeave={handleMouseLeave}
                  className={mesasNuevas.includes(mesa.id) ? "mesa-nueva" : ""}
                  style={{
                    position: "absolute",
                    left: `${mesa.x}px`,
                    top: `${mesa.y}px`,
                    cursor: "grab",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faChair}
                    style={{ fontSize: "24px", color: mesa.estado === "ocupada" ? "red" : "green" }}
                  />
                </div>
              ))}

              {tooltip && (
                <div className="tooltip-mesa">
                  <strong>{tooltip.nombre}</strong>
                  <br />
                  Estado: {tooltip.estado}
                </div>
              )}
            </div>
          </div>

          <div className="container py-4">
            <h1><strong>Administración de Mesas</strong></h1>
            <div className="d-flex justify-content-center mb-3">
              <button className="button-agregar" onClick={() => setModalOpen(true)}>+ Agregar Mesa</button>
            </div>

            <table className="table table-striped">
              <thead className="bg-primary text-white">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Área</th>
                  <th>Asientos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMesas.map((mesa) => (
                  <tr key={mesa.id}>
                    <td>{mesa.id}</td>
                    <td>{mesa.nombre}</td>
                    <td>{mesa.area || "Sin área"}</td>
                    <td>{mesa.asientos}</td>

                    <td>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={mesa.estado === "disponible"} 
                          onChange={() => handleEstadoChange(mesa, "disponible")} 
                        />
                        Disponible
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={mesa.estado === "ocupada"} 
                          onChange={() => handleEstadoChange(mesa, "ocupada")} 
                        />
                        Ocupada
                      </label>
                    </td>

                    <td style={{ position: "relative" }}>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDescripcionVisible(
                            descripcionVisible === mesa.id ? null : mesa.id
                          );
                        }}
                      >
                        Ver descripción
                      </button>

                      <button 
                        className="btn btn-warning btn-sm me-2" 
                        onClick={(e) => { 
                          e.stopPropagation();
                          setEditMesa(mesa); 
                          setModalEditOpen(true); 
                        }}
                      >
                        Editar
                      </button>

                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={(e) => { 
                          e.stopPropagation();
                          handleDeleteMesa(mesa.id);
                        }}
                      >
                        Eliminar
                      </button>

                      {descripcionVisible === mesa.id && (
                        <div
                          className="popup-descripcion"
                          style={{
                            position: "absolute",
                            top: "35px",
                            left: "0",
                            background: "#fff",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            zIndex: 20,
                            width: "220px"
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <strong>Descripción:</strong>
                          <p className="mt-2 mb-0">
                            {mesa.descripcion?.trim() !== "" 
                              ? mesa.descripcion 
                              : "Sin descripción"}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL AGREGAR */}
          <Modal show={modalOpen} onHide={() => setModalOpen(false)} backdrop="static" keyboard centered>
            <Modal.Header closeButton>
              <Modal.Title>Agregar Mesa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label>Nombre:</label>
              <input type="text" className="form-control" 
                value={newMesa.nombre} 
                onChange={(e) => setNewMesa({ ...newMesa, nombre: e.target.value })} 
              />

              <label>Área:</label>
              <input type="text" className="form-control" 
                value={newMesa.area} 
                onChange={(e) => setNewMesa({ ...newMesa, area: e.target.value })} 
              />

              <label>Descripción:</label>
              <textarea className="form-control"
                value={newMesa.descripcion}
                onChange={(e) => setNewMesa({ ...newMesa, descripcion: e.target.value })}
              />

              <label>Estado:</label>
              <select className="form-control" 
                value={newMesa.estado} 
                onChange={(e) => setNewMesa({ ...newMesa, estado: e.target.value })}
              >
                <option value="">Selecciona</option>
                <option value="disponible">Disponible</option>
                <option value="ocupada">Ocupada</option>
              </select>

              <label>Asientos:</label>
              <select className="form-control" 
                value={newMesa.asientos} 
                onChange={(e) => setNewMesa({ ...newMesa, asientos: e.target.value })}
              >
                <option value="">Seleccionar</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleAgregarMesa}>Guardar Mesa</Button>
            </Modal.Footer>
          </Modal>

          {/* MODAL EDITAR */}
          <Modal show={modalEditOpen} onHide={() => setModalEditOpen(false)} backdrop="static" keyboard centered>
            <Modal.Header closeButton>
              <Modal.Title>Editar Mesa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label>Nombre:</label>
              <input type="text" className="form-control" 
                value={editMesa?.nombre || ""} 
                onChange={(e) => setEditMesa({ ...editMesa, nombre: e.target.value })}
              />

              <label>Área:</label>
              <input type="text" className="form-control" 
                value={editMesa?.area || ""} 
                onChange={(e) => setEditMesa({ ...editMesa, area: e.target.value })}
              />

              <label>Descripción:</label>
              <textarea className="form-control"
                value={editMesa?.descripcion || ""}
                onChange={(e) => setEditMesa({ ...editMesa, descripcion: e.target.value })}
              />

              <label>Estado:</label>
              <select className="form-control" 
                value={editMesa?.estado || ""} 
                onChange={(e) => setEditMesa({ ...editMesa, estado: e.target.value })}
              >
                <option value="disponible">Disponible</option>
                <option value="ocupada">Ocupada</option>
              </select>

              <label>Asientos:</label>
              <select className="form-control" 
                value={editMesa?.asientos || ""} 
                onChange={(e) => setEditMesa({ ...editMesa, asientos: e.target.value })}
              >
                <option value="">Seleccionar</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setModalEditOpen(false)}>Cancelar</Button>
              <Button variant="warning" onClick={handleEditMesa}>Actualizar Mesa</Button>
            </Modal.Footer>
          </Modal>

        </div>
      }
    />
  );
};

export default Mapeado;
