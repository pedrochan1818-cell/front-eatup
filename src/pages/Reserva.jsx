import React, { useState, useEffect, useCallback } from 'react';
import "../assets/css/reserva.css";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const Reserva = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    no_persona: 1,
    fecha: '',
    hora: '',
    fecha_reserva: new Date().toISOString(),
    id_mesa: null,
    id_user: null,
    clave: Math.random().toString(36).substring(2, 15)
  });

  const [showModal, setShowModal] = useState(false);
  const [showMesasModal, setShowMesasModal] = useState(false);
  const [reservaCode, setReservaCode] = useState('');
  const [, setCopyStatus] = useState('Copiar código');
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [user, setUser] = useState(null);
  const [ultimaReservaId, setUltimaReservaId] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const [localStatus, setLocalStatus] = useState(null);
  const [turnoId, setTurnoId] = useState(null);

  // Horas disponibles para reserva
  const horasDisponibles = [
    '12:00', '12:30', '13:00', '13:30', '14:00','17:10',
    '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  // Configuración de toast
  const showError = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Función mejorada para generar imagen QR
  const generateQrImage = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = document.getElementById('qr-canvas');
      if (!canvas) {
        throw new Error('No se encontró el elemento canvas del QR');
      }
      const dataUrl = await toPng(canvas);
      setQrImage(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('Error al generar QR:', error);
      const fallbackImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      setQrImage(fallbackImage);
      return fallbackImage;
    }
  }, []);

  // Función para guardar el QR en el servidor
  const saveQRToServer = async () => {
    if (!qrImage || !ultimaReservaId) {
      showError("No hay imagen QR para guardar o falta el ID de reserva");
      return;
    }
    setIsSaving(true);
    try {
      const base64Data = qrImage.split(',')[1];
      const response = await api.post('api/save-qr', {
        reserva_id: ultimaReservaId,
        qr_image: base64Data,
        image_name: `reserva_${reservaCode}.png`
      });
      if (response.status === 200) {
        toast.success("QR guardado exitosamente en el servidor");
      } else {
        throw new Error(response.data?.message || 'Error al guardar el QR');
      }
    } catch (error) {
      console.error('Error al guardar QR:', error);
      showError(error.message || 'Error al guardar el QR');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      generateQrImage();
    }
  }, [showModal, generateQrImage]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar mesas
        const mesasResponse = await api.get("api/mesas");
        setMesas(mesasResponse.data);

        // Cargar usuario desde localStorage si hay
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setFormData(prev => ({
            ...prev,
            id_user: parsedUser.iduser
          }));
          await fetchUserData(parsedUser.iduser);
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let intervalId;
    const fetchStatus = async () => {
      try {
        const response = await api.get("api/turno/status_dos", {
          params: { id_empresa: 1 },
        });
        const data = response.data;
        if (data === 1) {
          setLocalStatus(1);
        } else {
          setLocalStatus(data.status);
          setTurnoId(data.id_turno);
        }
      } catch (error) {
        console.error("Error al obtener el status:", error);
      }
    };
    fetchStatus();
    intervalId = setInterval(fetchStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchUserData = async (iduser) => {
    try {
      const response = await api.get(`api/usuarios/${iduser}`);
      if (response.status === 200) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
    }
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      showError("Por favor ingresa tu nombre");
      return false;
    }
    if (!formData.fecha) {
      showError("Por favor selecciona una fecha");
      return false;
    }
    if (!formData.hora) {
      showError("Por favor selecciona una hora");
      return false;
    }
    if (!formData.id_mesa) {
      showError("Por favor selecciona una mesa");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHoraClick = (horaItem) => {
    setFormData(prev => ({
      ...prev,
      hora: horaItem
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_user) {
      showError("Debes iniciar sesión para hacer una reserva");
      return;
    }
    if (localStatus === 1) {
      showError("El local está cerrado, no se pueden hacer reservas.");
      return;
    }
    if (!validateForm()) return;
    try {
      const qrImageData = qrImage || await generateQrImage();
      const response = await api.post('api/reservas', {
        nombre: formData.nombre,
        no_persona: formData.no_persona,
        fecha: formData.fecha,
        hora: formData.hora,
        id_mesa: formData.id_mesa,
        id_user: formData.id_user,
        clave: formData.clave,
        id_turno: turnoId,
        qr_image: qrImageData
      });
      if (response.status === 200) {
        setReservaCode(response.data.reserva.clave);
        setUltimaReservaId(response.data.reserva.id_reserva);
        setShowModal(true);
        toast.success("¡Reserva creada exitosamente!");
      } else {
        throw new Error(response.data?.message || 'Error al crear reserva');
      }
    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'Error al crear la reserva');
    }
  };

  const handleSaveAndAction = async (action) => {
    try {
      if (qrImage && ultimaReservaId) {
        await saveQRToServer();
      }
      if (action === 'close') {
        setShowModal(false);
        resetForm();
        navigate('/historial');
      } else if (action === 'order' && ultimaReservaId) {
        setShowModal(false);
        resetForm();
        window.location.href = `/orden?id_reserva=${ultimaReservaId}&id_turno=${turnoId}`;
      }
    } catch (error) {
      console.error('Error al guardar QR:', error);
      showError('Error al guardar el QR');
    }
  };

  const resetForm = () => {
    setQrImage(null);
    setCopyStatus('Copiar código');
    setFormData({
      nombre: '',
      no_persona: 1,
      fecha: '',
      hora: '',
      fecha_reserva: new Date().toISOString(),
      id_mesa: null,
      id_user: user ? user.iduser : null,
      clave: Math.random().toString(36).substring(2, 15)
    });
    setSelectedMesa(null);
  };

  const openMesasModal = () => {
    if (!user) {
      showError("Debes iniciar sesión para seleccionar una mesa");
      return;
    }
    setShowMesasModal(true);
  };

  const closeMesasModal = () => {
    setShowMesasModal(false);
  };

  const handleMesaClick = (mesa) => {
    if (!user) {
      showError("Debes iniciar sesión para reservar una mesa");
      return;
    }
    if (mesa.estado !== 'disponible') {
      showError("Esta mesa no está disponible para reservar");
      return;
    }
    if (mesa.asientos < formData.no_persona) {
      showError(`Esta mesa solo tiene capacidad para ${mesa.asientos} personas`);
      return;
    }
    setSelectedMesa(mesa);
    setFormData(prev => ({
      ...prev,
      id_mesa: mesa.id
    }));
    closeMesasModal();
  };

  return (
    <div className="main-content">
      <div className="reserva-container">
        <h2 className="white-text">Reserva tu mesa</h2>

        {user && (
          <form onSubmit={handleSubmit} className="reserva-form">
            <div className="form-group">
              <label htmlFor="nombre" className="white-text">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="no_persona" className="white-text">Número de personas:</label>
              <select
                id="no_persona"
                name="no_persona"
                value={formData.no_persona}
                onChange={handleChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha" className="white-text">Fecha:</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label className="white-text">Hora:</label>
              <div className="horas-container">
                {horasDisponibles.map((horaItem) => (
                  <button
                    key={horaItem}
                    type="button"
                    className={`hora-btn ${formData.hora === horaItem ? 'selected' : ''}`}
                    onClick={() => handleHoraClick(horaItem)}
                  >
                    {horaItem}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="white-text">Mesa:</label>
              <button
                type="button"
                className="select-mesa-btn"
                onClick={openMesasModal}
              >
                {selectedMesa ? `Mesa ${selectedMesa.nombre} (${selectedMesa.asientos} asientos)` : "Seleccionar mesa"}
              </button>
            </div>

            <input type="hidden" name="fecha_reserva" value={formData.fecha_reserva} />
            <input type="hidden" name="id_mesa" value={formData.id_mesa || ''} />
            <input type="hidden" name="id_user" value={formData.id_user || ''} />
            <input type="hidden" name="clave" value={formData.clave} />
            <button
              type="submit"
              className="submit-btn"
              disabled={localStatus === 1}
            >
              Confirmar Reserva
            </button>
          </form>
        )}

        {/* ------------------ Modal que muestra QR al crear la reserva ------------------ */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '40%' }}>
              <div className="modal-header">
                <h3>Tu reserva ha sido creada</h3>
              </div>

              {/* Canvas QR oculto para generar imagen */}
              <div style={{ position: 'absolute', left: '-9999px' }}>
                <QRCodeCanvas
                  id="qr-canvas"
                  value={JSON.stringify({
                    ...formData,
                    clave: reservaCode,
                    id_reserva: ultimaReservaId
                  })}
                  size={300}
                  level="H"
                />
              </div>

              <div className="reserva-code-container">
                <p className="code-label">Código de reserva:</p>
                <div className="code-display">
                  {qrImage ? (
                    <img
                      src={qrImage}
                      alt="Código QR de la reserva"
                      style={{
                        width: '200px',
                        height: '200px',
                        border: '1px solid #ddd',
                        padding: '10px',
                        backgroundColor: 'white'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '200px',
                      height: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #ccc'
                    }}>
                      <p>Generando QR...</p>
                      <button
                        onClick={generateQrImage}
                        style={{
                          marginTop: '10px',
                          padding: '5px 10px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: '5px', textAlign: 'center' }}>
                    <div>
                      {qrImage && (
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = `reserva-${reservaCode}.png`;
                            link.href = qrImage;
                            link.click();
                          }}
                          style={{
                            padding: '8px 15px',
                            backgroundColor: '#7a8283ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '10px'
                          }}
                        >
                          Descargar QR
                        </button>
                      )}
                      {qrImage && (
                        <button
                          onClick={saveQRToServer}
                          disabled={isSaving}
                          style={{
                            padding: '8px 15px',
                            marginTop: '10px',
                            backgroundColor: '#0e9989ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            opacity: isSaving ? 0.7 : 1
                          }}
                        >
                          {isSaving ? 'Guardando...' : 'Guardar QR'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <small className="code-instructions">
                  Guarda este código QR para futuras consultas
                </small>
              </div>

              <div className="modal-actions">
                <p className="order-prompt">¿Deseas hacer un pedido ahora?</p>
                <div className="action-buttons">
                  <button
                    onClick={() => handleSaveAndAction('order')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    Ordenar
                  </button>
                  <button
                    onClick={() => handleSaveAndAction('close')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#607d8b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* ------------------ mesa para empresas vip jejeje ------------------ */}

        {/* 
      {showMesasModal && (
            <div className="modal-overlay">
              <div className="modal-content"
              style={{ 
                maxWidth: '400', 
                width: "100%",
                padding: "5px",
                margin: "clamp(40px, 10vh, 120px) auto 20px",
          }}>
      
      <div className="modal-header">
        <h3 style={{ fontSize: "18px", marginBottom: "5px" }}>Selecciona una mesa</h3>
        <p style={{ fontSize: "13px", color:"white" }}>Haz clic en una mesa disponible para seleccionarla</p>
      </div>
              <div
              style={{
                width: "100%",          
                maxWidth: "400px",      
                height: "260px",         
                margin: "20px auto 0",   
                border: "1px solid #444",
                position: "relative",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >

                {mesas.map((mesa) => (
                  <div
                    key={mesa.id}
                    onClick={() => handleMesaClick(mesa)}
                    title={`Mesa ${mesa.nombre} (${mesa.asientos} asientos)${mesa.area ? ' - ' + mesa.area : ''}`}
                    style={{
                      position: "absolute",
                      left: `${mesa.x * 0.8}px`,  
                      top: `${mesa.y * 0.8}px`,
                      width: "33px",
                      height: "33px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      border: selectedMesa?.id === mesa.id ? "2px solid #00bcd4" : "1px solid #ccc",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: mesa.estado === "disponible" ? "pointer" : "not-allowed",
                      fontSize: "8px",
                      textAlign: "center",
                      color: "#333",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faChair}
                      style={{
                        fontSize: "14px",
                        color: mesa.estado === "ocupada" ? "red" : "green",
                        marginBottom: "2px"
                      }}
                    />
                    {mesa.nombre}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "15px" }}>
                <h4 style={{ fontSize: "16px", marginBottom: "10px" }}>Mesas disponibles</h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {mesas
                    .filter(mesa => mesa.estado === 'disponible' && mesa.asientos >= formData.no_persona)
                    .map(mesa => (
                      <div
                        key={mesa.id}
                        onClick={() => handleMesaClick(mesa)}
                        style={{
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          backgroundColor: selectedMesa?.id === mesa.id ? '#e6f7ff' : 'white',
                          fontSize: "13px"
                        }}
                      >
                        <strong>{mesa.nombre}</strong> — {mesa.asientos} asientos  
                        {mesa.area && <div style={{ fontSize: "12px", color: "#666" }}>{mesa.area}</div>}
                      </div>
                    ))
                  }

                  {mesas.filter(m => m.estado === 'disponible' && m.asientos >= formData.no_persona).length === 0 && (
                    <p style={{ fontSize: "14px", color: "#888" }}>
                      No hay mesas disponibles.
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '15px', textAlign: 'right' }}>
                <button
                  onClick={closeMesasModal}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#607d8b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: "14px"
                  }}
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        )}
        */}


        {/* ---------------------------------para los que no tienen vip------------------------------------- */}
        {/**/}
        {showMesasModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '60%', minHeight:'30%' }}>
              <div className="modal-header">
                <h3>Listado de mesas y descripciones</h3>
                <p style={{ fontSize: "13px", color:"white" }}>Haz clic en una mesa disponible para seleccionarla</p>
              </div>

              <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '10px' }}>
                {mesas.length === 0 && <p>No hay mesas registradas.</p>}
                {mesas.map(mesa => (
                  <div
                    key={`desc-${mesa.id}`}
                    onClick={() => handleMesaClick(mesa)}
                    style={{
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      cursor: mesa.estado === 'disponible' ? 'pointer' : 'not-allowed',
                      backgroundColor: selectedMesa?.id === mesa.id ? '#f0fbff' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{mesa.nombre}</strong> &nbsp; <small>({mesa.asientos} asientos)</small>
                        {mesa.area && <div style={{ fontSize: 12, color: '#666' }}>Área: {mesa.area}</div>}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 12 }}>
                        <div style={{ color: mesa.estado === 'disponible' ? 'green' : 'red' }}>{mesa.estado}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '8px', color: '#444' }}>
                      {mesa.descripcion && mesa.descripcion.trim() !== ""
                        ? mesa.descripcion
                        : <em>Sin descripción</em>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  onClick={() => setShowMesasModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#607d8b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
    

      </div>
    </div>
  );
};

export default Reserva;
