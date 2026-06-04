import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/img/EATUP-MARK2.png";
import "../assets/css/menu.css";
import {
  FaUser,
  FaGamepad,
  FaCrosshairs,
  FaUsers,
  FaHome,
  FaBuilding,
  FaChair,
  FaUtensils,
  FaClipboardList,
  FaCalendarCheck,
  FaBoxOpen,
} from "react-icons/fa";
import api from "../api/client";

const Menu = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserData(parsedUser.iduser);
    }
  }, []);

  const fetchUserData = async (iduser) => {
    try {
      const response = await api.get(`api/usuarios/${iduser}`);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
    }
  };

  return (
    <aside className="sidebar-container">
      {/* Brand Logo */}
      <a className="brand-link">
        <img src={logo} alt="Logo EatUp" className="brand-image img-circle" />
        <span className="brand-text">EatUp</span>
      </a>

      {/* Usuario conectado */}
      <div className="user-panel">
        <div className="user-info">
          <div className="status-indicator"></div>
          <div className="user-details">
            <h4 className="nav-text">
              {user?.nombre || user?.email || "Usuario conectado"}
            </h4>
            <span className="nav-text">En línea</span>
          </div>
        </div>
      </div>

      {/* Enlaces */}
      <div className="sidebar">
        <nav>
          <ul className="nav nav-sidebar">

            {/* Home y Perfil */}
            <li className="nav-item d-flex gap-2">
              <Link to="/admin" className="nav-link">
                <FaHome className="nav-icon" />
                <span className="nav-text">Inicio</span>
              </Link>
              <Link to={`/perfilA/${user?.iduser || ""}`} className="nav-link">
                <FaUser className="nav-icon" />
                <span className="nav-text">Perfil</span>
              </Link>
            </li>

            {/* Resto de opciones */}
            <li className="nav-item" title="Catálogo de Usuarios">
              <Link to="/users" className="nav-link">
                <FaGamepad className="nav-icon" />
                <span className="nav-text">Catálogo de Usuarios</span>
              </Link>
            </li>

            {/*Productos  */}
            <li className="nav-item" title="Catalogo de Comidas">
            <Link to="/products" className="nav-link">
              <FaUtensils className="nav-icon" />
              <span className="nav-text">Catalogo de Productos</span>
            </Link>
          </li>


            {/*Roles */}
            <li className="nav-item" title="Catálogo de Roles">
              <Link to="/rol" className="nav-link">
                <FaUser className="nav-icon" />
                <span className="nav-text">Catálogo de Roles</span>
              </Link>
            </li>

            {/*Dashboard */}
            <li className="nav-item" title="Dashboard">
              <Link to="/dashboard" className="nav-link">
                <FaUsers className="nav-icon" />
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>

            {/*Mesas */}
            <li className="nav-item" title="Mapeado de Mesas">
              <Link to="/mapeado" className="nav-link">
                <FaChair className="nav-icon" />
                <span className="nav-text">Mapeado de Mesas</span>
              </Link>
            </li>

            {/*Ordenes */}
            <li className="nav-item" title="Control de Órdenes">
              <Link to="/ordenes" className="nav-link">
                <FaClipboardList className="nav-icon" />
                <span className="nav-text">Control de Órdenes</span>
              </Link>
            </li>

            {/*Reservas */}
            <li className="nav-item" title="Control de Reservas">
              <Link to="/reservas" className="nav-link">
                <FaCalendarCheck className="nav-icon" />
                <span className="nav-text">Control de Reservas</span>
              </Link>
            </li>

            {/*Empresa */}
            <li className="nav-item" title="Información de la Empresa">
              <Link to="/empresa" className="nav-link">
                <FaBuilding className="nav-icon" />
                <span className="nav-text">Restaurante</span>
              </Link>
            </li>
           {/*Planes*/}
            <li className="nav-item" title="Planes de suscripción">
              <Link to="/planes" className="nav-link">
                <FaBoxOpen  className="nav-icon" />
                <span className="nav-text">Planes</span>
              </Link>
            </li>

            {/*Planes de suscripción*/}
            <li className="nav-item" title="Catalogo de planes de suscripción">
              <Link to="/gestionPlanes" className="nav-link">
                <FaBoxOpen  className="nav-icon" />
                <span className="nav-text">Gestion Planes</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Menu;
