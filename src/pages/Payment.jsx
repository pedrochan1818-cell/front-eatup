// src/pages/Payment.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";

// --- Clave pública de Stripe ---
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51P5Zc4RvIpFd10rVyXtKXl1yxVy97kMicsmMeygnHBwzoHq6VXJW8BqpU3Sqf1ZgpruVbwK6yshDtsZZmc5InYuU006A2PSNpK";

// ------------------- Formulario Stripe -------------------
function CardPaymentForm({ total, idOrden, idUser, navigate, volverMetodo }) {
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
          const res = await api.post("/api/stripe/pagar", {
            stripe_token: token,
            id_orden: idOrden,
            total: total,
            iduser: idUser,
          });

          if (res.data?.status === "OK" || res.data?.success) {
            toast.success("Pago realizado correctamente con Stripe ✅");
            localStorage.removeItem("id_orden");
            localStorage.removeItem("metodo_pago");
            setTimeout(() => navigate("/historial"), 1500);
          } else {
            const msg = res.data?.message || "No se pudo completar el pago.";
            toast.error(msg);
          }
        } catch (err) {
          console.error("Error en /api/stripe/pagar:", err);
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

// ------------------- Página Payment -------------------
function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const total = state?.total || 0;
  const idOrden = localStorage.getItem("id_orden");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const idUser = storedUser?.iduser || localStorage.getItem("id_user") || null;

  const [showMetodoModal, setShowMetodoModal] = useState(true);
  const [metodoPago, setMetodoPago] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!idOrden) {
      toast.error("Primero debes crear una orden antes de pagar.");
      navigate("/home");
    }
  }, [idOrden, navigate]);

  const seleccionarMetodo = (metodo) => {
    setShowMetodoModal(false);
    setShowConfirmModal(false);
    setMetodoPago(metodo);
    localStorage.setItem("metodo_pago", metodo);

    if (metodo === "MercadoPago") handleMercadoPago();
    if (metodo === "Efectivo") setShowConfirmModal(true);
  };

  const volverASeleccionMetodo = () => {
    setMetodoPago("");
    setShowConfirmModal(false);
    setShowMetodoModal(true);
  };

  const confirmarEfectivo = async () => {
    try {
      const res = await api.post("api/orden/pagar-efectivo", {
        id_orden: idOrden,
        iduser: idUser,
        total: total,
        metodo_pago: "Efectivo",
      });

      if (res.data?.success || res.data?.status === "OK") {
        setShowConfirmModal(false);
        localStorage.removeItem("id_orden");
        localStorage.removeItem("metodo_pago");
        toast.success("Orden confirmada en efectivo ✅");
        navigate("/historial");
      } else {
        const msg = res.data?.message || "No se pudo registrar la orden en efectivo.";
        toast.error(msg);
      }
    } catch (err) {
      console.error("Error al registrar orden en efectivo:", err);
      toast.error("Error al conectar con el servidor.");
    }
  };

  const handleMercadoPago = async () => {
    setTimeout(async () => {
      try {
        const res = await api.post("/api/mercadopago/crear-preferencia", {
          id_orden: idOrden,
          total: total,
          iduser: idUser,
        });

        if (res.data?.init_point) {
          window.location.href = res.data.init_point;
        } else {
          const msg = res.data?.message || "No se pudo iniciar Mercado Pago.";
          toast.error(msg);
        }
      } catch (err) {
        console.error("Error Mercado Pago:", err);
        toast.error("Error al conectar con Mercado Pago.");
      }
    }, 500);
  };

  return (
    <div className="container text-center mt-5">
     <br /><br />

      {/* Modal para elegir método */}
      <Modal show={showMetodoModal} onHide={() => setShowMetodoModal(false)} 
      centered
      backdrop="static"
      >
        <Modal.Header >
          <Modal.Title>Seleccionar método de pago</Modal.Title>
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
          idOrden={idOrden}
          idUser={idUser}
          navigate={navigate}
          volverMetodo={volverASeleccionMetodo}
        />
      )}

      {/* Modal confirmación Efectivo */}
      <Modal show={showConfirmModal} onHide={volverASeleccionMetodo} centered>
        <Modal.Header closeButton>
          <Modal.Title>Orden Confirmada ✅</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tu orden ha sido registrada correctamente.</p>
          <p>Total a pagar en el local: <strong>${total} MXN</strong></p>
          <p>Podrás ver el detalle y consultar tu pago en tu historial.</p>
          <Button variant="success" className="mt-3 w-100" onClick={confirmarEfectivo}>
            Confirmar
          </Button>
          <Button variant="secondary" className="mt-2 w-100" onClick={volverASeleccionMetodo}>
            Elegir otro método
          </Button>
        </Modal.Body>
      </Modal>

      {/* Mensaje redirigiendo Mercado Pago */}
      {metodoPago === "MercadoPago" && (
        <div className="mt-4">
          <p>Redirigiendo a Mercado Pago... si no sucede,{" "}
            <button className="btn btn-link" onClick={handleMercadoPago}>
              haz clic aquí
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

export default Payment;
