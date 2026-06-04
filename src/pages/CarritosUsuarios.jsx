import React, { useEffect, useState } from "react";
import "../assets/css/carritosUsuario.css"; 
import api from "../api/client";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CarritosUsuarios = () => {
  const [carritos, setCarritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [carritoSeleccionado, setCarritoSeleccionado] = useState(null);
  const navigate = useNavigate(); 
  const usuario = JSON.parse(localStorage.getItem("user"));
  const userId = usuario?.iduser;

  useEffect(() => {
    if (!userId) {
      toast.error("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    const fetchCarritos = async () => {
      try {
        const response = await api.get(`api/cocina/carritos-usuario?user=${userId}`);

        if (response.data.success) {
          setCarritos(response.data.carritos);
        } else {
          toast.error("No se pudieron obtener los carritos.");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al cargar los carritos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCarritos();
  }, [userId]);

  if (loading) return <p className="loading">Cargando...</p>;

  const abrirModal = (carrito) => {
    setCarritoSeleccionado(carrito);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setCarritoSeleccionado(null);
  };

  return (
    <div >
      <h2 className="titulo-pagina">Mis Ordenes</h2>
      <button 
        className="btn-ordenar"
        onClick={() => navigate("/carrito")}
      >
        Ordenar
      </button>

      <div className="contenedor-carritos main-content ">
      {carritos.length === 0 ? (
        <p className="texto-vacio">No tienes carritos registrados.</p>
      ) : (
        carritos.map((carrito) => {
          const statusPago =
            carrito.productos[0]?.status_pagado === 2 ? "Pagado" : "Pendiente";

          return (
            <div key={carrito.id_carrito} className="carrito-card">
              <div className="carrito-header">
                <h3>Carrito #{carrito.id_carrito}</h3>
                <span className={`estado estado-${carrito.status_carrito}`}>
                  {carrito.status_carrito === 1 && "Pendiente"}
                  {carrito.status_carrito === 2 && "En preparación"}
                  {carrito.status_carrito === 3 && "Listo"}
                  {carrito.status_carrito === 4 && "Entregado"}
                </span>
              </div>

              <p><strong>Fecha:</strong> {carrito.fecha_carrito}</p>
              <p><strong>Hora de comida:</strong> {carrito.hora_comida}</p>
              <p><strong>Turno:</strong> {carrito.id_turno ?? "Sin turno"}</p>

              <p>
                <strong>Estado de pago:</strong>{" "}
                <span className={`pago pago-${statusPago.toLowerCase()}`}>
                  {statusPago}
                </span>
              </p>

              <button
                className="btn-ver-productos"
                onClick={() => abrirModal(carrito)}
              >
                Ver productos
              </button>
            </div>
            
          );
        })
      )}

      {/* MODAL EN FORMATO CARD ✔ */}
      <Modal 
        show={modalOpen} 
        onHide={cerrarModal} 
        centered
        backdrop="static"   // ❌ No se cierra al hacer click afuera
        keyboard={true}     // ✔ Sí se cierra con ESC
      >
        <Modal.Header closeButton>
          <Modal.Title>Productos del carrito</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {carritoSeleccionado ? (
            <div className="cards-productos-modal">
              {carritoSeleccionado.productos.map((prod, i) => (
                <div key={i} className="producto-card-modal">
                  <h4>{prod.nombre}</h4>
                  <p><strong>Cantidad:</strong> {prod.cantidad}</p>
                  <p><strong>Subtotal:</strong> ${prod.subtotal}</p>
                  <p><strong>Pago:</strong> {prod.status_pagado === 2 ? "Pagado" : "Pendiente"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Cargando...</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      </div>

    </div>
  );
};

export default CarritosUsuarios;
