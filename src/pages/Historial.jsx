import React, { useState, useEffect } from "react";
import "../assets/css/historial.css";
import { toast } from "react-toastify";
import api from "../api/client";
import { Modal, Button } from "react-bootstrap";

const Reservaciones = () => {
  const [reservaciones, setReservaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalQR, setModalQR] = useState({
    abierto: false,
    qrUrl: "",
    qrData: null,
  });
  const [carritos, setCarritos] = useState([]);
const [modalCarrito, setModalCarrito] = useState({
  abierto: false,
  carrito: null,
});


  const [modalPedido, setModalPedido] = useState({
    abierto: false,
    pedido: null,
    cargando: false,
    reserva: null,
  });

  // Modal agregar productos
  const [modalAgregar, setModalAgregar] = useState({
    abierto: false,
    reserva: null,
    id_orden: null,
  });

  useEffect(() => {
    const fetchReservaciones = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.iduser) throw new Error("Usuario no identificado");

        const response = await api.get(`api/historial/${user.iduser}`);

        if (response.data.success) {
          const reservasFormateadas = await Promise.all(
            response.data.reservas.map(async (reserva) => {
              let estado = "";
              let estadoTexto = "";

              switch (reserva.status) {
                case 1:
                  estado = "confirmada";
                  estadoTexto = "Confirmada";
                  break;
                case 2:
                  estado = "cancelada";
                  estadoTexto = "Cancelada";
                  break;
                case 3:
                  estado = "en proceso";
                  estadoTexto = "En Proceso";
                  break;
                case 4:
                  estado = "completada";
                  estadoTexto = "Completada";
                  break;
                default:
                  estado = "desconocida";
                  estadoTexto = "Desconocida";
              }

              let status_pagado = null;
              try {
                const ordenResponse = await api.get(
                  `api/reservas/${reserva.id_reserva}/orden`
                );
                if (ordenResponse.data.success) {
                  status_pagado = ordenResponse.data.orden.status_pagado;
                }
              } catch {
                status_pagado = null;
              }

              return {
                id: reserva.id_reserva,
                lugar: "Eat",
                lugar2: "Up",
                fecha: reserva.fecha,
                hora: reserva.hora,
                nombre: reserva.nombre,
                personas: reserva.no_persona,
                estado,
                estadoTexto,
                status: reserva.status,
                orden: reserva.orden,
                status_pagado,
                qr: `http://127.0.0.1:8000/api/reservas/mostrarQR/${reserva.qr_image}`,
                qr_image: reserva.qr_image,
                id_reserva: reserva.id_reserva,
              };
            })
          );

          setReservaciones(reservasFormateadas);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchReservaciones();

    const fetchCarritos = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
    
        const response = await api.get(`api/carritos?user=${user.iduser}`);
    
        if (response.data.success) {
          setCarritos(response.data.carritos);
        }
      } catch (error) {
        console.error("Error al cargar carritos:", error);
      }
    };
    
  }, []);

  const cancelarReservacion = async (id) => {
    try {
      await api.post("api/reservas/actualizar-status", {
        id_reserva: id,
        status: 2,
      });

      setReservaciones((prev) =>
        prev.map((reserva) =>
          reserva.id === id
            ? { ...reserva, estado: "cancelada", estadoTexto: "Cancelada", status: 2 }
            : reserva
        )
      );

      toast.success("Reserva cancelada exitosamente");
    } catch (err) {
      toast.error("Error al cancelar la reserva");
      console.error("Error al cancelar:", err);
    }
  };

  const abrirModalQR = async (qrUrl, reserva) => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      setModalQR({
        abierto: true,
        qrUrl: dataUrl,
        qrData: {
          reservaId: reserva.id_reserva,
          nombre: reserva.nombre,
          fecha: reserva.fecha,
          hora: reserva.hora,
          personas: reserva.personas,
          codigo: reserva.qr_image.replace(".png", ""),
        },
      });
    } catch (err) {
      console.error("Error al cargar QR:", err);
      setModalQR({ abierto: true, qrUrl, qrData: null });
    }
  };

  const cerrarModalQR = () =>
    setModalQR({ abierto: false, qrUrl: "", qrData: null });

  const descargarQR = () => {
    try {
      const link = document.createElement("a");
      link.href = modalQR.qrUrl;
      link.download = `qr_reserva_${modalQR.qrData?.codigo || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR descargado correctamente");
    } catch (err) {
      console.error("Error al descargar QR:", err);
      toast.error("Error al descargar el QR");
    }
  };

  const abrirModalPedido = async (id_reserva) => {
    try {
      const reservaData = reservaciones.find(
        (r) => r.id_reserva === id_reserva
      );

      const response = await api.get(`api/reservas/${id_reserva}/orden`);

      if (response.data.success) {
        const tiempoEstimado = reservaData.personas * 10;

        // ---- NUEVO: agregar subtotales y detalles con status_pagado y metodo_pago ----
        const { detalles, subtotal, total_extra } = response.data;

        setReservaciones((prev) =>
          prev.map((r) =>
            r.id_reserva === id_reserva
              ? { ...r, status_pagado: response.data.orden.status_pagado }
              : r
          )
        );

        setModalPedido({
          abierto: true,
          pedido: {
            ...response.data.orden,
            tiempoEstimado,
            detalles,
            subtotal,
            total_extra,
          },
          reserva: reservaData,
          cargando: false,
        });
      }
    } catch {
      toast.info("No hay pedido asociado a esta reserva");
    }
  };

  const cerrarModalPedido = () =>
    setModalPedido({
      abierto: false,
      pedido: null,
      cargando: false,
      reserva: null,
    });

  // -------------------------------
  // NUEVO MÉTODO PARA TRAER id_orden
  // -------------------------------
  const abrirModalAgregar = async (reserva) => {
    try {
      const response = await api.get(`api/reservas/${reserva.id_reserva}/orden`);
  
      if (response.data.success) {
        setModalAgregar({
          abierto: true,
          reserva,
          id_orden: response.data.orden.id, // <-- ESTE ES EL BUENO
        });
      } else {
        toast.info("No existe una orden creada para esta reserva.");
      }
    } catch (error) {
      toast.error("No se pudo obtener la orden de esta reserva.");
    }
  };

  const formatearFecha = (fechaStr) =>
    new Date(fechaStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (cargando) return <div className="loading">Cargando reservaciones...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="main-content reservaciones-container">
      <h1 className="reservaciones-title">Mis Reservaciones</h1>

      <p className="info-mensaje">
        Para agregar o editar órdenes, la reserva debe estar en proceso.
        Solo podrás hacerlo cuando el estado de la reserva sea{" "}
        <strong>En proceso</strong>.
      </p>

      {/* --- Modal QR --- */}
      <Modal
        show={modalQR.abierto}
        onHide={cerrarModalQR}
        centered
        backdrop="static"
        keyboard
      >
        <Modal.Header closeButton>
          <Modal.Title>Código QR de la reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {modalQR.qrUrl && (
            <img src={modalQR.qrUrl} alt="Código QR" className="img-fluid mb-3" />
          )}
          <div className="d-flex justify-content-center gap-3">
            <Button variant="success" onClick={descargarQR}>
              Descargar QR
            </Button>
            <Button variant="secondary" onClick={cerrarModalQR}>
              Cerrar
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* --- Modal Pedido --- */}
      <Modal
        show={modalPedido.abierto}
        onHide={cerrarModalPedido}
        centered
        backdrop="static"
        keyboard
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalPedido.cargando ? (
            <div className="loading">Cargando pedido...</div>
          ) : (
            <div className="detalle-pedido">
              <p>
                <strong>Fecha de reserva:</strong>{" "}
                {formatearFecha(modalPedido.reserva?.fecha)}
              </p>
              <p>
                <strong>Hora de reserva:</strong> {modalPedido.reserva?.hora}
              </p>
              <p>
                <strong>Hora estimada del servicio:</strong>{" "}
                {modalPedido.pedido?.hora_comida} minutos
              </p>

              
      {/* --- Subtotal y estado de pago --- */}
<div className="pago-card">
  <p>
    <strong>Subtotal:</strong> ${modalPedido.pedido?.subtotal}
  </p>
  <p>
    <strong>Estado del pago:</strong>{" "}
    {(() => {
      const pagos = modalPedido.pedido?.detalles
        ?.filter((d) => d.numero_pedido === 1)
        .map((d) =>
          d.metodo_pago === "Efectivo"
            ? d.status_pagado === 2
              ? "Efectivo (Pagado)"
              : "Efectivo (Sin pagar)"
            : d.status_pagado === 1
            ? "Sin pagar"
            : d.status_pagado === 2
            ? "Pagado"
            : "Desconocido"
        );
      return [...new Set(pagos)].join(", ");
    })()}
  </p>
  <p>
                <strong>Estado de la orden:</strong>{" "}
                {modalPedido.pedido?.status === 1
                  ? "Pendiente"
                  : modalPedido.pedido?.status === 2
                  ? "En proceso"
                  : modalPedido.pedido?.status === 3
                  ? "Completado"
                  : "Desconocido"}
              </p>
</div>

{/* --- Total extra y estado de pago extra --- */}
{modalPedido.pedido?.detalles?.some((d) => d.numero_pedido === 2) && (
  <div className="pago-card mt-2">
    <p>
      <strong>Total extra:</strong> ${modalPedido.pedido?.total_extra}
    </p>
    <p>
      <strong>Estado del pago (extra):</strong>{" "}
      {(() => {
        const pagosExtra = modalPedido.pedido?.detalles
          ?.filter((d) => d.numero_pedido === 2)
          .map((d) =>
            d.metodo_pago === "Efectivo"
              ? d.status_pagado === 2
                ? "Efectivo (Pagado)"
                : "Efectivo (Sin pagar)"
              : d.status_pagado === 1
              ? "Sin pagar"
              : d.status_pagado === 2
              ? "Pagado"
              : "Desconocido"
          );
        return [...new Set(pagosExtra)].join(", ");
      })()}
    </p>
    <p className="advertencia-pedido">
  <strong>Advertencia:</strong> Las órdenes extras serán servidas en 15 a 20 minutos
  después de haber realizado la segunda orden.
</p>

  </div>
)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalPedido}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Modal Agregar Productos --- */}
      <Modal
        show={modalAgregar.abierto}
        onHide={() =>
          setModalAgregar({
            abierto: false,
            reserva: null,
            id_orden: null,
          })
        }
        centered
        backdrop="static"
        keyboard
      >
        <Modal.Header closeButton>
          <Modal.Title>Agregar productos</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          ¿Deseas agregar productos extra a esta reserva?
          <br />
          <strong>Reserva:</strong> {modalAgregar.reserva?.id_reserva}
          <br />
          <strong>Orden:</strong> {modalAgregar.id_orden}
          <p className="advertencia-pedido">
          <strong>Advertencia:</strong> Las órdenes extras serán servidas en 15 a 20 minutos
          después de haber realizado la orden.
        </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setModalAgregar({
                abierto: false,
                reserva: null,
                id_orden: null,
              })
            }
          >
            Cancelar
          </Button>

          <Button
            variant="success"
            onClick={() => {
              localStorage.setItem(
                "id_reserva",
                modalAgregar.reserva.id_reserva
              );
              localStorage.setItem("id_orden", modalAgregar.id_orden);

              toast.success("Datos guardados. Redirigiendo...");

              setModalAgregar({
                abierto: false,
                reserva: null,
                id_orden: null,
              });

              window.location.href = "/ordenar";
            }}
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Listado de Reservas --- */}
      <section className="reservaciones-section">
        {reservaciones.length === 0 ? (
          <p className="no-reservas">No tienes reservaciones.</p>
        ) : (
          <div className="reservas-grid">
            {reservaciones.map((reserva) => (
              <div key={reserva.id} className={`reserva-card ${reserva.estado}`}>
                <div className="container-reserva">
                  <span className="reserva-lugar">{reserva.lugar}</span>
                  <span className="reserva-lugar2">{reserva.lugar2}</span>
                </div>

                <p className="reserva-nombre">Nombre: {reserva.nombre}</p>
                <p className="reserva-fecha">
                  Fecha: {formatearFecha(reserva.fecha)}
                </p>
                <p className="reserva-hora">Hora: {reserva.hora}</p>
                <p className="reserva-personas">Personas: {reserva.personas}</p>

                <div className="d-flex justify-content-center align-items-center gap-3">
                  <div className="reserva-estado-container">
                    <span className={reserva.estado}>{reserva.estadoTexto}</span>
                  </div>

                  <button
                    onClick={() => cancelarReservacion(reserva.id)}
                    className="cancelar-btn"
                    disabled={reserva.status === 2 || reserva.status === 3}
                  >
                    <i className="fas fa-times"></i> Cancelar
                  </button>
                </div>

                <div className="reserva-acciones">
                  <button
                    onClick={() => abrirModalPedido(reserva.id_reserva)}
                    className="ver-pedido-btn"
                  >
                    <i className="fas fa-utensils"></i> Ver Pedido
                    {reserva.status_pagado === 1 && (
                      <span className="dot-rojo"></span>
                    )}
                  </button>

                  {/* BOTÓN AGREGAR PRODUCTOS SOLO CUANDO STATUS = 3 */}
                  {reserva.status === 3 && (
                    <button
                      className="ver-pedido-btn"
                      onClick={() => abrirModalAgregar(reserva)}
                    >
                      <i className="fas fa-plus-circle"></i>+ Producto
                    </button>
                  )}

                  <button
                    onClick={() => abrirModalQR(reserva.qr, reserva)}
                    className="ver-qr-btn"
                  >
                    <i className="fas fa-qrcode"></i> Ver QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Reservaciones;
