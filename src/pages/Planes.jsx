import React, { useEffect, useState } from "react";
import "../assets/css/planes.css";
import { Crown } from "lucide-react";
import Master from "../components/Master";
import { toast } from "react-toastify";
import api from "../api/client";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [planActivo, setPlanActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const id_empresa = localStorage.getItem("id_empresa");
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerPlanes = async () => {
      try {
        const res = await api.get("api/planes/listado");
        setPlanes(res.data);
      } catch (error) {
        toast.error("Error al cargar los planes");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const obtenerPlanActivo = async () => {
      if (!id_empresa) return;

      try {
        const res = await api.get("api/empresa");

        if (res.data && res.data.id_plan) {
          setPlanActivo(res.data.id_plan);
        }
      } catch (error) {
        console.error("No se pudo obtener el plan actual:", error);
      }
    };

    obtenerPlanes();
    obtenerPlanActivo();
  }, [id_empresa]);

  // 🔹 Comprar o activar un plan
  const handleComprar = async (id_plan, precio) => {
    if (!id_empresa) {
      toast.warning(
        "Primero debes registrar tu empresa antes de elegir un plan."
      );
      return;
    }

    try {
      // 🔹 Guardar id_plan y id_empresa en localStorage
      localStorage.setItem(
        "planSeleccionado",
        JSON.stringify({ id_empresa, id_plan, precio })
      );

      // 🔹 Redirigir a la página de pago
      navigate("/pago");
    } catch (error) {
      console.error(error);
      toast.error("Error al iniciar el pago del plan");
    }
  };

  return (
    <Master
      titulo={
        <h1 className="planes-title">
          <strong>
            Planes <span>EatUp</span>
          </strong>
        </h1>
      }
      contenido={
        <div className="planes-container">
          <div className="planes-grid">
            {loading ? (
              <p className="text-center">Cargando planes...</p>
            ) : planes.length > 0 ? (
              planes.map((plan) => {
                const beneficios = plan.beneficios
                  ? plan.beneficios.split("\n")
                  : [];

                const esActivo = planActivo === plan.id_plan;

                return (
                  <div
                    key={plan.id_plan}
                    className={`plan-card ${esActivo ? "activo" : ""}`}
                  >
                    {/* 🔹 Mostrar etiqueta solo si el plan está activo */}
                    {esActivo && (
                      <div className="plan-badge badge-activo">
                        Plan activado
                      </div>
                    )}

                    <div className="plan-header">
                      <div className="plan-icon">
                        <Crown size={32} />
                      </div>
                      <h2 className="plan-nombre">{plan.nombre}</h2>
                      <p className="plan-precio">
                        ${plan.precio} MXN / mes
                      </p>
                      <p className="plan-descripcion">
                        {plan.descripcion}
                      </p>
                    </div>

                    <ul className="plan-lista">
                      {beneficios.map((item, i) => (
                        <li key={i}>
                          <span className="check">✔</span> {item}
                        </li>
                      ))}
                    </ul>

                    <div className="plan-footer">
                      {esActivo ? (
                        <Button variant="warning" disabled>
                          ✅ Suscripción Actual
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          onClick={() =>
                            handleComprar(plan.id_plan, plan.precio)
                          }
                        >
                          Pagar Suscripción
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center">No hay planes disponibles.</p>
            )}
          </div>
        </div>
      }
    />
  );
};

export default Planes;