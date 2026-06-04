import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";
import "../assets/css/turnos.css";

const Turno = ({ id_empresa }) => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTurno, setEditTurno] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    hora_inicio: "",
    hora_fin: "",
    status: 1,
  });

  useEffect(() => {
    fetchTurnos();
  }, []);

  const fetchTurnos = async () => {
    try {
      const res = await api.get("api/turno/listado", { params: { id_empresa } });
      setTurnos(res.data);
    } catch (error) {
      console.error("Error al cargar turnos:", error);
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (turno = null) => {
    if (turno) {
      setEditTurno(turno);
      setFormData({
        nombre: turno.nombre,
        hora_inicio: turno.hora_inicio,
        hora_fin: turno.hora_fin,
        status: turno.status,
      });
    } else {
      setEditTurno(null);
      setFormData({ nombre: "", hora_inicio: "", hora_fin: "", status: 1 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTurno(null);
    setFormData({ nombre: "", hora_inicio: "", hora_fin: "", status: 1 });
  };

  const handleGuardar = async () => {
    if (!formData.nombre || !formData.hora_inicio || !formData.hora_fin) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      const operacion = editTurno ? "Modificar" : "Agregar";
      const payload = {
        operacion,
        id_turno: editTurno?.id_turno,
        id_empresa,
        nombre: formData.nombre,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        status: formData.status,
      };

      const res = await api.post("api/turno/operacion", payload);

      if (res.status === 200) {
        toast.success(`Turno ${operacion === "Agregar" ? "agregado" : "actualizado"} correctamente`);
        fetchTurnos();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo conectar con la API");
    }
  };

  const handleEliminar = async (id_turno) => {
    try {
      const res = await api.post("api/turno/operacion", {
        operacion: "Eliminar",
        id_turno,
      });
      if (res.status === 200) {
        toast.success("Turno eliminado correctamente");
        setTurnos(turnos.filter((t) => t.id_turno !== id_turno));
      }
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el turno");
    }
  };

  const handleActivar = async (id_turno) => {
    try {
      const res = await api.post("api/turno/operacion", {
        operacion: "Activar",
        id_turno,
        id_empresa,
      });
  
      if (res.status === 200) {
        // Traemos los turnos de nuevo o actualizamos localmente
        const nuevosTurnos = turnos.map((t) =>
          t.id_turno === id_turno ? { ...t, status: 2 } : { ...t, status: 1 }
        );
        setTurnos(nuevosTurnos);
  
        toast.success("Turno activado correctamente");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al activar el turno");
    }
  };
  

  const handleCorte = async () => {
    try {
      const res = await api.post("api/turno/operacion", {
        operacion: "Corte",
        id_empresa,
      });

      if (res.status === 200) {
        toast.success("Corte realizado correctamente");
        // Desactiva todos los turnos localmente
        setTurnos(turnos.map((t) => ({ ...t, status: 1 })));
      } else {
        toast.error("No se pudo realizar el corte");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al realizar el corte");
    }
  };

  if (loading) return <div className="text-center py-5">Cargando turnos...</div>;

  const turnoActivo = turnos.find((t) => t.status === 2);

  return (
    <div className="container py-4">
      {/* Indicador del turno activo */}
      <div className="turno-activo-box mb-4 text-center p-3 rounded d-flex justify-content-between align-items-center">
        {turnoActivo ? (
          <>
            <h5 className="m-0">
              🔵 Turno activo: <b>{turnoActivo.nombre}</b> ({turnoActivo.hora_inicio} - {turnoActivo.hora_fin})
            </h5>
            <button className="btn btn-danger btn-sm" onClick={handleCorte}>
              Realizar Corte
            </button>
          </>
        ) : (
          <h5 className="m-0">⚪ No hay turno activo actualmente</h5>
        )}
      </div>

      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-success" onClick={() => handleOpenModal()}>
          + Agregar Turno
        </button>
      </div>

      <table className="table table-striped text-center">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {turnos.length === 0 ? (
            <tr>
              <td colSpan="6">No hay turnos registrados</td>
            </tr>
          ) : (
            turnos.map((t) => (
              <tr key={t.id_turno}>
                <td>{t.id_turno}</td>
                <td>{t.nombre}</td>
                <td>{t.hora_inicio}</td>
                <td>{t.hora_fin}</td>
                <td>
                  <input
                    type="radio"
                    checked={t.status === 2}
                    onChange={() => handleActivar(t.id_turno)}
                  />
                </td>
                <td>
                  <button className="btn btn-dark btn-sm me-2" onClick={() => handleOpenModal(t)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleEliminar(t.id_turno)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal Agregar / Editar */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">{editTurno ? "Editar Turno" : "Agregar Turno"}</h5>
                <button className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Hora Inicio</label>
                  <input
                    type="time"
                    name="hora_inicio"
                    className="form-control"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Hora Fin</label>
                  <input
                    type="time"
                    name="hora_fin"
                    className="form-control"
                    value={formData.hora_fin}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button className="btn btn-dark" onClick={handleGuardar}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Turno;
