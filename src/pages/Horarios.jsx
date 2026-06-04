import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";
import "../assets/css/horarios.css";

const Horarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editHorario, setEditHorario] = useState(null);
  const [formData, setFormData] = useState({
    id_horario: "",
    id_empresa: "",
    dia_semana: "",
    id_turno: "",
  });

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [resHorarios, resEmpresas, resTurnos] = await Promise.all([
        api.get("api/horario/listado"),
        api.get("api/empresa/listado"),
        api.get("api/turnos"),
      ]);
      setHorarios(resHorarios.data);
      setEmpresas(resEmpresas.data);
      setTurnos(resTurnos.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("No se pudieron cargar los datos");
      setHorarios([]);
      setEmpresas([]);
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (horario = null) => {
    if (horario) {
      setEditHorario(horario);
      setFormData({
        id_horario: horario.id_horario,
        id_empresa: horario.id_empresa,
        dia_semana: horario.dia_semana,
        id_turno: horario.id_turno,
      });
    } else {
      setEditHorario(null);
      setFormData({ id_horario: "", id_empresa: "", dia_semana: "", id_turno: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditHorario(null);
    setFormData({ id_horario: "", id_empresa: "", dia_semana: "", id_turno: "" });
  };

  const handleGuardar = async () => {
    if (!formData.id_empresa || !formData.dia_semana || !formData.id_turno) {
      toast.warning("Completa todos los campos");
      return;
    }

    try {
      const payload = {
        ...formData,
        operacion: editHorario ? "Modificar" : "Agregar",
      };
      const res = await api.post("api/horario/operacion", payload);
      if (res.status === 200) {
        toast.success(`Horario ${editHorario ? "actualizado" : "agregado"} correctamente`);
        fetchDatos(); // recarga sin refrescar página
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error al guardar horario:", error);
      toast.error("No se pudo guardar el horario");
    }
  };

  const handleEliminar = async (id_horario) => {
    if (!window.confirm("¿Eliminar este horario?")) return;
    try {
      const res = await api.post("api/horario/operacion", { id_horario, operacion: "Eliminar" });
      if (res.status === 200) {
        toast.info("Horario eliminado");
        setHorarios((prev) => prev.filter((h) => h.id_horario !== id_horario));
      }
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      toast.error("No se pudo eliminar el horario");
    }
  };

  if (loading) return <div className="text-center py-5">Cargando horarios...</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-success" onClick={() => handleOpenModal()}>
          + Agregar Horario
        </button>
      </div>

      {horarios.length === 0 ? (
        <p className="text-center">No hay horarios registrados.</p>
      ) : (
        <table className="table table-striped text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empresa</th>
              <th>Día</th>
              <th>Turno</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h) => (
              <tr key={h.id_horario}>
                <td>{h.id_horario}</td>
                <td>{empresas.find((e) => e.id_empresa === h.id_empresa)?.nombre || "—"}</td>
                <td>{h.dia_semana}</td>
                <td>{turnos.find((t) => t.id_turno === h.id_turno)?.nombre || "—"}</td>
                <td>
                  <button className="btn btn-dark btn-sm me-2" onClick={() => handleOpenModal(h)}>
                    Editar
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(h.id_horario)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">{editHorario ? "Editar Horario" : "Agregar Horario"}</h5>
                <button className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Empresa:</label>
                  <select
                    name="id_empresa"
                    value={formData.id_empresa}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Seleccione...</option>
                    {empresas.map((e) => (
                      <option key={e.id_empresa} value={e.id_empresa}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Día de la semana:</label>
                  <select
                    name="dia_semana"
                    value={formData.dia_semana}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Seleccione...</option>
                    {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Turno:</label>
                  <select
                    name="id_turno"
                    value={formData.id_turno}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Seleccione...</option>
                    {turnos.map((t) => (
                      <option key={t.id_turno} value={t.id_turno}>
                        {t.nombre} ({t.hora_inicio} - {t.hora_fin})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button className="btn btn-dark" onClick={handleGuardar}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Horarios;
