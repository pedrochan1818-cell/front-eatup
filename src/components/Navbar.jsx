import { Link } from "react-router-dom";
import { FaUser } from 'react-icons/fa';
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaBoxOpen, FaUsers, FaShoppingCart, FaHome } from "react-icons/fa"; 
import { NavDropdown } from "react-bootstrap"; 
import "../assets/css/navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import api from '../api/client';
import { STORAGE_URL } from "../api/client";
import { FaWhatsapp } from 'react-icons/fa';

export function Navbar() {
  const { isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Función para actualizar datos del usuario desde backend
  const fetchUserData = async (iduser) => {
    try {
      const response = await api.get(`api/usuarios/${iduser}`);
      const updatedUser = response.data;
      setUser(updatedUser);  // Actualiza estado
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Actualiza localStorage
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
    }
  };

  useEffect(() => {
    // Cargar usuario inicial desde localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserData(parsedUser.iduser); // Cargar datos más actualizados
    }

    // Escuchar evento global "user-loaded" para actualizar automáticamente
    const handleUserLoaded = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUser(updatedUser);
    };
    window.addEventListener("user-loaded", handleUserLoaded);

    return () => window.removeEventListener("user-loaded", handleUserLoaded);
  }, []);

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      await api.post("api/logout");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar fixed-top navbar-light">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand" to="/home">
          <span className="text-light">Eat </span>
          <span className="brand-dead">Up</span>
        </Link>

        {/* Botón menú móvil */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/carta">Menú</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reserva">Reservaciones</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/historial">Historial</Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="#" 
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`https://wa.me/529991972791?text=${encodeURIComponent('Hola, tengo una consulta sobre Eat Up')}`, '_blank');
                }}
                title="Contactar por WhatsApp"
              >
                <FaWhatsapp style={{ color: '#f6f9f7ff', fontSize: '1.2rem' }} />
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link btn btn-link text-danger" to="/home" title="Inicio" style={{ textDecoration: "none" }}>
                <FaHome /> 
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link btn btn-link text-danger" to="/carritos" title="Carrito" style={{ textDecoration: "none" }}>
                <FaShoppingCart /> 
              </Link>
            </li>

            {/* Perfil */}
            <li className="nav-item">
              <button
                className="nav-link btn btn-link text-danger dropdown-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                title="Perfil"
                style={{ textDecoration: "none" }}
              >
                <FaUser />
              </button>
              
              {menuOpen && (
                <div className="dropdown-menu show p-3" style={{ minWidth: "200px", position: "absolute", right: 0, left: "auto" }}>
                  <p className="text-dark text-center mb-2">{user?.email || "Cargando..."}</p>
                  {user?.foto && (
                    <img
                      src={`${STORAGE_URL}/api/usuarios/foto/${user.foto}`}
                      alt="Foto de perfil"
                      className="img-fluid rounded-circle d-block mx-auto mb-2"
                      style={{ width: "100px", height: "100px" }}
                    />
                  )}
                  <a href={`/perfil/${user?.iduser || ""}`} className="dropdown-item">Administrar Contraseñas</a>
                  <button onClick={handleLogout} className="dropdown-item text-danger">Cerrar Sesión</button>
                </div>
              )}
            </li>

            {/* Menú desplegable Catálogos */}
            {isAuthenticated && (
              <NavDropdown title="Catálogos" id="catalog-dropdown" className="text-light">
                <NavDropdown.Item as={Link} to="/products" className="text-dark"><FaBoxOpen className="me-2" /> Productos</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/users" className="text-dark"><FaUsers className="me-2" /> Usuarios</NavDropdown.Item>
              </NavDropdown>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
