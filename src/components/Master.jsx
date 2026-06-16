import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Menu';
import { HiHome } from 'react-icons/hi';
import { FaSignOutAlt, FaUser } from "react-icons/fa"; 
import "../assets/css/master.css";

import api from '../api/client';

const Master = ({ titulo, contenido }) => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("api/logout");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserData(parsedUser.iduser);
    }
  }, []);

  return (
    <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="main-sidebar">
        <Menu />
      </div>

      {/* Contenido */}
      <div className="container-fluid" style={{ flex: 1, padding: "20px" }}>
        
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">

            {user && (
             <h2
                className="text-center mb-4"
                style={{ color: "#17948eff" }} // cambia por tu color personalizado
              >
                ¡Bienvenido, {user.nombre}!
              </h2>
            )}

            {/* ------------------ DROPDOWN DE PERFIL ------------------ */}
           
            {/* ---------------- END DROPDOWN ---------------- */}

            <div className="container">
              <div className="row mb-3">

                {/* Título */}
                <div className="col-sm-6">
                  <h2 className="float-left" style={{ color: "#2e9c8eff" }}>{titulo}</h2>

                </div>

                {/* Botones lado derecho */}
                <div className="col-sm-6 text-right">
                  <div className="d-none d-sm-flex justify-content-end align-items-center">

                    <div className="breadcrumb">
                      <Link 
                        to="/admin" 
                        className="icon-btn text-primary"
                        title="Inicio"
                        style={{ gap: '5px' }}
                      >
                        <HiHome size={22} />
                      </Link>
                    </div>
                    {user && (
                 <div className="nav-item dropdown ml-auto" style={{ position: "relative" }}>

                {/* 🔵 ICONO DE LA PERSONITA QUE ABRE EL MENÚ */}
                <div className="breadcrumb">
                <button
                  className="icon-btn text-primary"
                  onClick={() => setMenuOpen(!menuOpen)}
                  title="Mi Perfil"
                >
                  <FaUser size={20}/>
                </button>
                    </div>
               

                {/* MENU DESPLEGABLE */}
                {menuOpen && (
                  <div
                    className="dropdown-menu show p-3"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50px",
                      minWidth: "220px",
                      zIndex: 999,
                    }}
                  >
                    <p className="text-dark text-center mb-2">{user.email}</p>

                    {user.foto && (
                      <img
                        src={`http://127.0.0.1:8000/api/usuarios/foto/${user.foto}`}
                        alt="Foto de perfil"
                        className="img-fluid rounded-circle d-block mx-auto mb-2"
                        style={{ width: "80px", height: "80px" }}
                      />
                    )}

                    <a
                      href={`/perfilA/${user.iduser}`}
                      className="dropdown-item text-center"
                    >
                      Administrar Cuenta
                    </a>

                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger text-center mt-2"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
                    <div className="breadcrumb ml-3">
                      <button
                        className="icon-btn text-primary"
                        
                        onClick={handleLogout}
                        title="Cerrar sesión"
                        style={{ textDecoration: "none" }}
                      >
                        <FaSignOutAlt />
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </nav>

        {/* Contenido Dinámico */}
        <section className="container">
          <div className="card">
            <div className="card-body">
              {contenido}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="main-footer">
          <div className="float-right d-none d-sm-block">   
            <strong>
              Copyright &copy; 2023-2024{' '}
              <a href="/" target="_blank" rel="noopener noreferrer">
                Universidad Tecnológica Metropolitana
              </a>. Plataforma Restaurante
            </strong>
            <b> Version</b> 1.0  
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Master;
