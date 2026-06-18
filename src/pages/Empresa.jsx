import { useEffect, useState, useCallback } from "react";
import Master from "../components/Master";
import api, { STORAGE_URL } from "../api/client";
import { toast } from "react-toastify";
import Turno from "./Turno";
import "../assets/css/empresa.css";

function Empresa() {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    email: "",
    logo: null,
  });
  const [previewLogo, setPreviewLogo] = useState(null);

  useEffect(() => {
    fetchEmpresa();
  }, []);
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setPreviewLogo(null);
    setFormData({
      nombre: empresa?.nombre || "",
      descripcion: empresa?.descripcion || "",
      direccion: empresa?.direccion || "",
      telefono: empresa?.telefono || "",
      email: empresa?.email || "",
      logo: null,
    });
  }, [empresa]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleCloseModal();
    };
  
    window.addEventListener("keydown", handleKeyDown);
  
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [handleCloseModal]);

  const fetchEmpresa = async () => {
    try {
      const response = await api.get("api/empresa");
      const data = response.data;
      if (data) {
        setEmpresa(data);
        localStorage.setItem("id_empresa", data.id_empresa);

        setFormData({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          email: data.email || "",
          logo: null,
        });
      } else {
        setEmpresa(null);
      }
    } catch (error) {
      toast.error("No se pudo cargar la información de la empresa");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "logo") {
      const file = e.target.files[0];
      setFormData({ ...formData, logo: file });
      setPreviewLogo(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      await api.post("api/empresa/actualizar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        empresa ? "Empresa actualizada correctamente" : "Empresa creada correctamente"
      );
      handleCloseModal();
      fetchEmpresa();
    } catch (error) {
      toast.error("Error al guardar la empresa");
      console.error(error);
    }
  };

  const handleOpenModal = () => setShowModal(true);



  if (loading) {
    return (
      <Master
        titulo="Información de la Empresa"
        contenido={<div className="text-center py-5">Cargando datos...</div>}
      />
    );
  }

  return (
    <Master
      titulo={<h1 className="fw-bold text-center mb-4">Gestión de Empresa</h1>}
      contenido={
        <div className="container py-4">
          {/* BOTONES DE PESTAÑAS */}
          <div className="d-flex justify-content-center gap-3 mb-4">
            <button
              className={`button-agregar ${activeTab === "info" ? "button-active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              Empresa
            </button>

            <button
              className={`button-agregar ${activeTab === "turnos" ? "button-active" : ""}`}
              onClick={() => setActiveTab("turnos")}
              disabled={!empresa}
            >
              Turnos
            </button>
          </div>

          {/* CONTENIDO */}
          {activeTab === "info" && (
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-body text-center p-5">
                {empresa ? (
                  <>
                    <img
                      src={
                        previewLogo ||
                        `${STORAGE_URL}/api/empresa/logo/${empresa.logo}`
                      }
                      alt="Logo empresa"
                      className="empresa-logo mb-4"
                      style={{ width: "120px", borderRadius: "10px" }}
                      onError={(e) => (e.target.src = "/default-logo.png")}
                    />
                    <h2 className="fw-bold">{empresa.nombre}</h2>
                    <p className="text-muted mb-1">{empresa.email}</p>
                    <hr className="my-4" />
                    <div
                      className="empresa-info text-start mx-auto"
                      style={{ maxWidth: "600px" }}
                    >
                      <p>
                        <i className="bi bi-geo-alt text-primary me-2"></i>
                        {empresa.direccion}
                      </p>
                      <p>
                        <i className="bi bi-telephone text-primary me-2"></i>
                        {empresa.telefono}
                      </p>
                      <p>
                        <i className="bi bi-card-text text-primary me-2"></i>
                        {empresa.descripcion}
                      </p>
                    </div>
                    <button
                      className="btn btn-dark rounded-pill px-4 mt-3"
                      onClick={handleOpenModal}
                    >
                      <i className="bi bi-pencil-square me-2"></i> Editar Empresa
                    </button>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <button
                      className="btn btn-success rounded-pill px-4"
                      onClick={handleOpenModal}
                    >
                      <i className="bi bi-plus-circle me-2"></i> Agregar Empresa
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "turnos" && empresa && (
            <Turno id_empresa={empresa.id_empresa} />
          )}

          {/* MODAL EMPRESA */}
          {showModal && (
            <div
              className="modal fade show"
              tabIndex="-1"
              style={{ display: "block" }}
              onClick={(e) => {
                if (e.target.classList.contains("modal")) handleCloseModal();
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content animate__animated animate__fadeInDown">
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title">
                      <i className="bi bi-building me-2"></i>
                      {empresa ? "Editar Empresa" : "Crear Empresa"}
                    </h5>
                    <button
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Campos del formulario */}
                    <div className="mb-3 text-center">
                      <label className="form-label fw-bold">Logo</label>
                      <br />
                      {previewLogo && (
                        <img
                          src={previewLogo}
                          alt="Logo preview"
                          className="empresa-logo mb-2"
                          style={{ width: "120px", borderRadius: "10px" }}
                        />
                      )}
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        className="form-control mt-2"
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        className="form-control"
                        value={formData.nombre}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Correo</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        name="descripcion"
                        className="form-control"
                        rows="3"
                        value={formData.descripcion}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Dirección</label>
                      <input
                        type="text"
                        name="direccion"
                        className="form-control"
                        value={formData.direccion}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        name="telefono"
                        className="form-control"
                        value={formData.telefono}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                    <button className="btn btn-dark" onClick={handleSubmit}>
                      <i className="bi bi-save me-1"></i> Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}

export default Empresa;
