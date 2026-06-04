// src/pages/Payment.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";

// --- Clave pública de Stripe ---
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51P5Zc4RvIpFd10rVyXtKXl1yxVy97kMicsmMeygnHBwzoHq6VXJW8BqpU3Sqf1ZgpruVbwK6yshDtsZZmc5InYuU006A2PSNpK";

// ------------------- Formulario de pago Stripe -------------------
function CardPaymentForm({ total, idPlan, idEmpresa, idUser, navigate }) {
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
    focus: "",
  });
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (value) =>
    value.replace(/\D/g, "").substring(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 4);
    return cleaned.length >= 3
      ? cleaned.replace(/(\d{2})(\d{1,2})/, "$1/$2")
      : cleaned;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "number") formatted = formatCardNumber(value);
    if (name === "expiry") formatted = formatExpiry(value);
    if (name === "cvc") formatted = value.replace(/\D/g, "").substring(0, 4);
    setCardData({ ...cardData, [name]: formatted });
  };

  const handleInputFocus = (e) => setCardData({ ...cardData, focus: e.target.name });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc) {
      toast.error("Por favor completa todos los campos de la tarjeta.");
      return;
    }

    if (!window.Stripe) {
      toast.error("Stripe.js no está cargado. Agrega <script src='https://js.stripe.com/v2/'></script> en index.html");
      return;
    }

    setLoading(true);
    try {
      window.Stripe.setPublishableKey(STRIPE_PUBLISHABLE_KEY);

      const [exp_month, exp_year] = cardData.expiry.split("/").map((s) => s.trim());
      const cardObj = {
        number: cardData.number.replace(/\s+/g, ""),
        cvc: cardData.cvc,
        exp_month: exp_month,
        exp_year: exp_year.length === 2 ? exp_year : exp_year,
        name: cardData.name,
      };

      window.Stripe.card.createToken(cardObj, async (status, response) => {
        if (response.error) {
          toast.error(response.error.message || "Error al crear token de Stripe");
          setLoading(false);
          return;
        }

        const token = response.id;

        try {
          // 🔹 Llamada al endpoint de pagar plan
          const res = await api.post("/api/stripe/pagar-plan", {
            stripe_token: token,
            id_plan: idPlan,
            total: total,
            iduser: idUser,
          });

          if (res.data?.status === "OK" || res.data?.success) {
            toast.success("Pago realizado correctamente ✅");

            // 🔹 Actualizar el plan activo de la empresa
            try {
              await api.post("/api/empresa/actualizar-plan", {
                id_empresa: idEmpresa,
                id_plan: idPlan,
              });
              toast.success("Plan activado correctamente");
            } catch (err) {
              console.error("Error al actualizar plan:", err);
              toast.error("Pago realizado pero no se pudo actualizar el plan en la empresa.");
            }

            localStorage.removeItem("planSeleccionado");
            setTimeout(() => navigate("/planes"), 1500);
          } else {
            const msg = res.data?.message || "No se pudo completar el pago del plan.";
            toast.error(msg);
          }
        } catch (err) {
          console.error("Error en /api/stripe/pagar-plan:", err);
          toast.error("Error al conectar con el servidor de pagos.");
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el pago.");
      setLoading(false);
    }
  };

  return (
    <div className="text-center mt-4">
      <Cards
        number={cardData.number}
        name={cardData.name}
        expiry={cardData.expiry}
        cvc={cardData.cvc}
        focused={cardData.focus}
      />

      <form
        onSubmit={handleSubmit}
        className="mt-4 text-start mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <div className="mb-3">
          <label>Nombre</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Nombre completo"
            value={cardData.name}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            required
          />
        </div>

        <div className="mb-3">
          <label>Número de Tarjeta</label>
          <input
            type="tel"
            name="number"
            className="form-control"
            placeholder="Número de Tarjeta"
            value={cardData.number}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            required
            maxLength={19}
          />
        </div>

        <div className="row">
          <div className="col">
            <label>Expiración (MM/AA)</label>
            <input
              type="text"
              name="expiry"
              className="form-control"
              placeholder="MM/AA"
              value={cardData.expiry}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              required
              maxLength={5}
            />
          </div>
          <div className="col">
            <label>CVC</label>
            <input
              type="text"
              name="cvc"
              className="form-control"
              placeholder="CVC"
              value={cardData.cvc}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              required
              maxLength={4}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mt-4"
          disabled={loading}
        >
          {loading ? "Procesando..." : `Pagar Plan $${total} MXN`}
        </button>
      </form>
    </div>
  );
}

// ------------------- Página Payment -------------------
function Pago() {
  const navigate = useNavigate();
  const storedPlan = JSON.parse(localStorage.getItem("planSeleccionado") || "{}");

  const idPlan = storedPlan?.id_plan;
  const idEmpresa = storedPlan?.id_empresa;
  const total = storedPlan?.precio || 0;
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const idUser = storedUser?.iduser || localStorage.getItem("id_user") || null;

  useEffect(() => {
    if (!idPlan || !idEmpresa) {
      toast.error("No se encontró información del plan seleccionado.");
      navigate("/planes");
    }
  }, [idPlan, idEmpresa, navigate]);

  return (
    <div className="container text-center mt-5">
      <h2>Pago del Plan</h2>
      <p>Total a pagar: <strong>${total} MXN</strong></p>

      {idPlan && idUser && (
        <CardPaymentForm
          total={total}
          idPlan={idPlan}
          idEmpresa={idEmpresa}
          idUser={idUser}
          navigate={navigate}
        />
      )}
    </div>
  );
}

export default Pago;
