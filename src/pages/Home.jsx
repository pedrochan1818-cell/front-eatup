import "../assets/css/home.css";
// Importar imágenes locales
import promo1 from "../assets/img/restaurante.jpg";
import promo2 from "../assets/img/restaurante2.png";
import promo3 from "../assets/img/caballeroP.jpg";
import reserva from "../assets/img/calendario.png";
import logo from "../assets/img/EATUP-MARK2.png";
import taza from "../assets/img/chef.png";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";



function Home() {

  // Datos del carrusel con imágenes locales
  const carouselItems = [
    { id: 1, image: promo1, title: "Promoción 1", description: "Conoce nuestro restaurante", active: true },
    { id: 2, image: promo2, title: "Promoción 2", description: "Un poco de nuestro espacio para ti", active: false },
    { id: 3, image: promo3, title: "Promoción 3", description: "Prueba este delicioso postre ideal para ti", active: false }
  ];

  useEffect(() => {
    // 1️⃣ Leer parámetros de URL (Google login)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const iduser = params.get("iduser");
    const email = params.get("email");
    const nombre = params.get("nombre");

    if (token && iduser) {
      const newUser = { iduser, email, nombre };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Limpiar URL
      window.history.replaceState({}, document.title, "/home");
    } 
  }, []);

  return (
    <div className="main-content">
        {/* Carrusel */}
      <div id="homeCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          {carouselItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              data-bs-target="#homeCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-current={index === 0 ? "true" : undefined}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="carousel-inner">
          {carouselItems.map((item, index) => (
            <div key={item.id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
              <img src={item.image} className="d-block w-100" alt={item.title} />
              <div className="carousel-caption d-none d-md-block">
                <h5>{item.title}</h5>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>

      {/* Secciones de bienvenida y promociones */}
      <div className="container mt-4 text-center">
        <h3 className="fw-bold" style={{ color: '#0f534aff' }}>
        Nuestras promociones especiales
        </h3>
        <p className="text-nuevo" style={{ color: '#6a6967ff' }}>Descubre las mejores ofertas que tenemos para ti</p>
      </div>

      {/* Bienvenida personalizada */}
      <div className="welcome-container">
        <div className="welcome-header">
          <img src={logo} alt="EatUp Logo" className="welcome-logo" />
          <h1 className="welcome-title">Hola, ¿te gustaría conocer nuestro menú?</h1>
          <img src={taza} alt="Icono de taza" className="welcome-icon" />
        </div>
        <div className="welcome-content text-light">
          <p>¡Qué alegría verte por aquí! En EatUp hemos puesto todo nuestro corazón y experiencia...</p>
          <div className="welcome-cta">
          <Link to="/carta">
          <button className="btn btn-home-h ">
            Ver Menú Completo
          </button>
        </Link>
          </div>
        </div>
      </div>

      {/* Sección de reservas */}
      <div className="welcome-container">
        <div className="welcome-header">
          <img src={logo} alt="EatUp Logo" className="welcome-logo" />
          <h1 className="welcome-title">Planea la cita perfecta con las personas que más quieres. Reserva ahora</h1>
          <img src={reserva} alt="Icono de taza" className="welcome-icon" />
        </div>
        <div className="welcome-content text-light">
          <p>En EatUp, cada comida es una experiencia...</p>
          <div className="welcome-cta">
          <Link to="/reserva">
          <button className="btn btn-home-h">
            Reservar
          </button>
        </Link>
          </div>
        </div>
      </div>

      {/* Sección ubicación */}
      <div className="location-container py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h2 className="text-loca mb-4" style={{ color: '#E9D7B7' }}>Visítanos nos encontramos en circuito colonias</h2>
              <p className="text-light">Nos encontramos en el restaurante EatUp en Mérida...</p>
              <div className="location-info mt-4 text-light">
                <p><strong>Dirección:</strong> C. 111 315, Santa Rosa, 97279 de Mérida, Yucatán.</p>
                <p><strong>Horario:</strong> Lunes a Viernes: 6:00 pm - 11:00 pm</p>
                <p><strong>Teléfono:</strong> (999) 123 4567</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.3507744468775!2d-89.61906932505107!3d20.938423990875823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f5672270a784baf%3A0x764b40010695f0d9!2sUniversidad%20Tecnol%C3%B3gica%20Metropolitana!5e0!3m2!1ses!2smx!4v1743058136759!5m2!1ses!2smx"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación UT Metropolitana Mérida"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
