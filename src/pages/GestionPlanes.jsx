import React, { useEffect, useState } from "react";
import "../assets/css/gestionPlanes.css";
import api from "../api/client";
import { toast } from "react-toastify";
import Master from "../components/Master";
import { Crown } from "lucide-react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const GestionPlanes = () => {
  const [planes, setPlanes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modo, setModo] = useState("Agregar");
  const [formData, setFormData] = useState({
    id_plan: "",
    nombre: "",
    precio: "",
    descripcion: "",
    beneficios: [""],
  });

  useEffect(() => {
    obtenerPlanes();
  }, []);

  const obtenerPlanes = async () => {
    try {
      const res = await api.get("api/planes/listado");
      setPlanes(res.data);
    } catch (error) {
      toast.error("Error al cargar los planes");
    }
  };

  const abrirModal = (modo, plan = null) => {
    if (modo === "Modificar" && plan) {
      setFormData({
        id_plan: plan.id_plan,
        nombre: plan.nombre || "",
        precio: plan.precio || "",
        descripcion: plan.descripcion || "",
        beneficios: plan.beneficios ? plan.beneficios.split("\n") : [""],
      });
    } else {
      setFormData({
        id_plan: "",
        nombre: "",
        precio: "",
        descripcion: "",
        beneficios: [""],
      });
    }
    setModo(modo);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBeneficioChange = (index, value) => {
    const nuevos = [...formData.beneficios];
    nuevos[index] = value;
    setFormData({ ...formData, beneficios: nuevos });
  };

  const agregarBeneficio = () => {
    setFormData({ ...formData, beneficios: [...formData.beneficios, ""] });
  };

  const eliminarBeneficio = (index) => {
    const nuevos = formData.beneficios.filter((_, i) => i !== index);
    setFormData({ ...formData, beneficios: nuevos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataEnviar = {
        ...formData,
        beneficios: formData.beneficios.join("\n"),
        operacion: modo,
      };
      await api.post("api/planes/operacion", dataEnviar);
      toast.success(`Plan ${modo.toLowerCase()} correctamente`);
      obtenerPlanes();
      cerrarModal();
    } catch (error) {
      toast.error("Error al guardar el plan");
    }
  };

  const eliminarPlan = async (id_plan) => {
    if (!window.confirm("¿Seguro que deseas eliminar este plan?")) return;
    try {
      await api.post("api/planes/operacion", {
        operacion: "Eliminar",
        id_plan,
      });
      toast.success("Plan eliminado correctamente");
      obtenerPlanes();
    } catch (error) {
      toast.error("Error al eliminar el plan");
    }
  };

  return (
    <Master
      titulo={
        <h1 className="planes-title">
          <strong>
            Gestión de <span>Planes</span>
          </strong>
        </h1>
      }
      contenido={
        <div className="planes-container">
          <div className="acciones-superiores">
            <Button variant="success" onClick={() => abrirModal("Agregar")}>
              + Agregar Plan
            </Button>
          </div>

          <div className="planes-grid">
            {planes.map((plan, index) => (
              <div key={index} className="plan-card">
                <div className="plan-header">
                  <div className="plan-icon">
                    <Crown size={32} />
                  </div>
                  <h2>{plan.nombre}</h2>
                  <p className="plan-precio">${plan.precio} MXN / mes</p>
                  <p className="plan-descripcion">{plan.descripcion}</p>
                </div>

                <ul className="plan-lista">
                  {plan.beneficios &&
                    plan.beneficios.split("\n").map((b, i) => (
                      <li key={i}>
                        <span className="check">✔</span> {b}
                      </li>
                    ))}
                </ul>

                <div className="plan-footer">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => abrirModal("Modificar", plan)}
                  >
                    Editar
                  </Button>{" "}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarPlan(plan.id_plan)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* MODAL DE AGREGAR / EDITAR */}
          <Modal show={showModal} onHide={cerrarModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>{modo} Plan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className="form-plan" onSubmit={handleSubmit}>
                <label>Nombre del plan:</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre del plan"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />

                <label>Precio:</label>
                <input
                  type="number"
                  name="precio"
                  placeholder="Precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                />

                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  placeholder="Descripción"
                  value={formData.descripcion}
                  onChange={handleChange}
                ></textarea>

                <h5>Beneficios</h5>
                {formData.beneficios.map((b, i) => (
                  <div key={i} className="beneficio-row">
                    <input
                      type="text"
                      placeholder={`Beneficio ${i + 1}`}
                      value={b}
                      onChange={(e) =>
                        handleBeneficioChange(i, e.target.value)
                      }
                    />
                    {i > 0 && (
                      <button
                        type="button"
                        className="btn-eliminar-beneficio"
                        onClick={() => eliminarBeneficio(i)}
                      >
                        ✖
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="success"
                  onClick={agregarBeneficio}
                  className="mt-2"
                >
                  + Agregar beneficio
                </Button>
                <br />
                <Button type="submit" variant="primary" className="mt-3 w-100">
                  {modo === "Agregar" ? "Guardar Plan" : "Actualizar Plan"}
                </Button>
              </form>
            </Modal.Body>
          </Modal>
        </div>
      }
    />
  );
};

export default GestionPlanes;
