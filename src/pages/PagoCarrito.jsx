// src/pages/Payment.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";

// --- Stripe key ---
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51P5Zc4RvIpFd10rVyXtKXl1yxVy97kMicsmMeygnHBwzoHq6VXJW8BqpU3Sqf1ZgpruVbwK6yshDtsZZmc5InYuU006A2PSNpK";

// ====================== TARJETA ======================
function CardPaymentForm({ total, idCarrito, idUser, navigate, volverMetodo }) {
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

  const handleInputFocus = (e) =>
    setCardData({ ...cardData, focus: e.target.name });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc) {
      toast.error("Por favor completa todos los campos.");
      return;
    }

    if (!window.Stripe) {
      toast.error("Stripe no está cargado.");
      return;
    }

    setLoading(true);
    try {
      window.Stripe.setPublishableKey(STRIPE_PUBLISHABLE_KEY);

      const [exp_month, exp_year] = cardData.expiry.split("/");

      const cardObj = {
        number: cardData.number.replace(/\s+/g, ""),
        cvc: cardData.cvc,
        exp_month,
        exp_year,
        name: cardData.name,
      };

      window.Stripe.card.createToken(cardObj, async (status, response) => {
        if (response.error) {
          toast.error(response.error.message);
          setLoading(false);
          return;
        }

        const token = response.id;

        try {
          const res = await api.post("/api/stripe/pagar-carrito", {
            stripe_token: token,
            id_carrito: idCarrito,
            total,
            iduser: idUser,
          });

          if (res.data?.success) {
            toast.success("Pago completado con Stripe");
            localStorage.removeItem("id_carrito");
            localStorage.removeItem("metodo_pago");
            setTimeout(() => navigate("/carritos"), 2000);
          } else {
            toast.error(res.data?.message || "Error al pagar.");
          }
        } catch (err) {
          console.error("Stripe pago error", err);
          toast.error("Error con servidor.");
        } finally {
          setLoading(false);
        }
      });
    } catch (e) {
      toast.error("Error procesando pago.");
      setLoading(false);
    }
  };

  return (
    <div className="text-center mt-4">
      <Cards {...cardData} />

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
            value={cardData.number}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            maxLength={19}
            required
          />
        </div>

        <div className="row">
          <div className="col">
            <label>Exp (MM/AA)</label>
            <input
              type="text"
              name="expiry"
              className="form-control"
              value={cardData.expiry}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              maxLength={5}
              required
            />
          </div>
          <div className="col">
            <label>CVC</label>
            <input
              type="text"
              name="cvc"
              className="form-control"
              value={cardData.cvc}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              maxLength={4}
              required
            />
          </div>
        </div>

        <button
          className="btn btn-primary w-100 mt-4"
          type="submit"
          disabled={loading}
        >
          {loading ? "Procesando..." : `Pagar $${total} MXN`}
        </button>

        <button
          type="button"
          className="btn btn-secondary w-100 mt-2"
          onClick={volverMetodo}
        >
          Elegir otro método
        </button>
      </form>
    </div>
  );
}

// ====================== PÁGINA PRINCIPAL ======================
function PagoCarrito() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const total = state?.total || 0;

  const idCarrito = localStorage.getItem("id_carrito");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const idUser = storedUser?.iduser;

  const [showMetodoModal, setShowMetodoModal] = useState(true);
  const [metodoPago, setMetodoPago] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!idCarrito) {
      toast.error("Primero debes crear un carrito.");
      navigate("/home");
    }
  }, [idCarrito, navigate]);

  const seleccionarMetodo = (metodo) => {
    setMetodoPago(metodo);
    setShowMetodoModal(false);

    if (metodo === "MercadoPago") handleMercadoPago();
    if (metodo === "Efectivo") setShowConfirmModal(true);
  };

  const volverASeleccionMetodo = () => {
    setMetodoPago("");
    setShowMetodoModal(true);
    setShowConfirmModal(false);
  };

  const confirmarEfectivo = async () => {
    try {
      const res = await api.post("/api/carrito/pagar-efectivo", {
        id_carrito: idCarrito,
        iduser: idUser,
        total,
        metodo_pago: "Efectivo",
      });

      if (res.data?.success) {
        toast.success("Pago registrado en efectivo");
        localStorage.removeItem("id_carrito");
        localStorage.removeItem("metodo_pago");
        navigate("/carritos");
      } else {
        toast.error(res.data?.message || "Error al pagar.");
      }
    } catch (err) {
      toast.error("Error con servidor.");
    }
  };

  const handleMercadoPago = async () => {
    try {
      const res = await api.post("/api/mercadopago/crear-preferencia-carrito", {
        id_carrito: idCarrito,
        total,
        iduser: idUser,
      });

      if (res.data?.init_point) {
        window.location.href = res.data.init_point;
      } else {
        toast.error(res.data?.message || "No se pudo iniciar Mercado Pago");
      }
    } catch (err) {
      toast.error("Error MercadoPago.");
    }
  };

  return (
    <div className="container text-center mt-5">
  <br /><br />
      {/* Modal método de pago */}
      <Modal show={showMetodoModal} centered>
        <Modal.Header>
          <Modal.Title>Selecciona un método de pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-around">
            <Button variant="primary" onClick={() => seleccionarMetodo("Stripe")}>
              💳 Stripe
            </Button>
            <Button variant="success" onClick={() => seleccionarMetodo("MercadoPago")}>
              🛒 Mercado Pago
            </Button>
            {/*<Button variant="warning" onClick={() => seleccionarMetodo("Efectivo")}>
              💵 Efectivo
            </Button>*/}
          </div>
        </Modal.Body>
      </Modal>

      {/* Stripe */}
      {metodoPago === "Stripe" && (
        <CardPaymentForm
          total={total}
          idCarrito={idCarrito}
          idUser={idUser}
          navigate={navigate}
          volverMetodo={volverASeleccionMetodo}
        />
      )}

      {/* Modal efectivo */}
      <Modal show={showConfirmModal} onHide={volverASeleccionMetodo} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar pago en efectivo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Total a pagar: <strong>${total} MXN</strong></p>
          <Button variant="success" className="w-100 mt-3" onClick={confirmarEfectivo}>
            Confirmar
          </Button>
          <Button variant="secondary" className="w-100 mt-2" onClick={volverASeleccionMetodo}>
            Elegir otro método
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PagoCarrito;
