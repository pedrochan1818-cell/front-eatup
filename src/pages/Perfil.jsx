import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../assets/css/perfil.css";
import api from '../api/client';

const Perfil = () => {
  const { iduser } = useParams();
  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    genero: "",
    edad: "",
    foto: null,
    idrol: "",
  });
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    fetchUserData();
    fetchRoles();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iduser]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`api/usuarios/${iduser}`);
      setUsuario(response.data);
    } catch (error) {
      console.error("Error al obtener datos del usuario", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("api/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error al obtener roles", error);
    }
  };

  const handleShowPhoto = () => {
    if (usuario.foto) {
      setPhotoUrl(`http://127.0.0.1:8000/api/usuarios/foto/${encodeURIComponent(usuario.foto)}?t=${Date.now()}`);
      setShowPhotoModal(true);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setUsuario({ ...usuario, foto: files[0] });
    } else {
      setUsuario({ ...usuario, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("iduser", iduser);
    formData.append("nombre", usuario.nombre);
    formData.append("email", usuario.email);
    formData.append("genero", usuario.genero);
    formData.append("edad", usuario.edad);
    formData.append("idrol", usuario.idrol);
  
    if (usuario.password) {
      formData.append("password", usuario.password);
    }
    
    if (usuario.foto) {
      formData.append("foto", usuario.foto);
    }
  
    api
      .post(`api/perfil`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        alert("Información del usuario actualizada correctamente");
        fetchUserData(); // Actualizar datos después de editar
      })
      .catch((error) => {
        console.error("Error al actualizar la información", error);
      });
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(usuario.password || "").then(() => {
      setCopyMessage("📋 Copiado al portapeles!");
      setTimeout(() => setCopyMessage(""), 2000);
    });
  };

  return (
    <>
      <div className="main-content">
        <div className="container mx-auto p-4 nuevo">
          <h2 className="text-xl font-bold mb-4">Perfil de Usuario</h2>
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={usuario.nombre}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Correo</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={usuario.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3 d-flex align-items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="Contraseña"
                value={usuario.password || ""}
                onChange={handleChange}
              />
              <button type="button" className="btn btn-orange" onClick={handleShowPassword}>
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
              <button type="button" className="btn btn-warning" onClick={handleCopyPassword}>
                Copiar
              </button>
              {copyMessage && <div className="alert alert-success">{copyMessage}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium">Género</label>
              <select
                name="genero"
                className="form-control"
                value={usuario.genero}
                onChange={handleChange}
              >
                <option value="No">Selecciona un Género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Edad</label>
              <select
                name="edad"
                className="form-control"
                value={usuario.edad}
                onChange={handleChange}
              >
                <option value="10">Selecciona tu edad</option>
                <option value="1">De 10 a 15 años</option>
                <option value="2">De 16 a 20 años</option>
                <option value="3">De 21 a 30 años</option>
                <option value="4">De 31 a 40 años</option>
                <option value="5">De 41 a 50 años</option>
                <option value="6">Más de 50 años</option>
              </select>
            </div>

           {/*  <div>
              <label className="block text-sm font-medium">Rol</label>
              <select name="idrol" className="form-control" value={usuario.idrol} onChange={handleChange}>
                <option value="">Selecciona un rol</option>
                {roles.map((rol) => (
                  <option key={rol.idrol} value={rol.idrol}>{rol.nomrol}</option>
                ))}
              </select>
            </div>
*/}
            <div>
              <label className="block text-sm font-medium">Foto</label>
              <div className="d-flex align-items-center">
                <input
                  type="file"
                  name="foto"
                  className="form-control"
                  onChange={handleChange}
                />
                {usuario.foto && (
                  <button 
                    type="button" 
                    className="btn btn-info ms-2"
                    onClick={handleShowPhoto}
                  >
                    Ver Foto
                  </button>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-danger">Actualizar Perfil</button>
          </form>
        </div>
      </div>

      {/* Modal para visualizar la foto */}
      {showPhotoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Foto de perfil</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPhotoModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <img 
                src={photoUrl} 
                alt="Foto de perfil" 
                className="img-fluid"
                onError={(e) => {
                  e.target.src = '/img/default-user.png';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Perfil;