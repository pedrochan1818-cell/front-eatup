import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/estilos.css";
import "../assets/css/orden.css";
import { useLocation, useNavigate } from "react-router-dom";
import Cart from "./Cart"; 
import api from '../api/client';

function Orden() {
  const [ ,setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({});
  const [quantities, setQuantities] = useState({});
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [reservaData, setReservaData] = useState(null);
  const [selectedHour, setSelectedHour] = useState("");
  const [showCartModal, setShowCartModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [ordenId, setOrdenId] = useState(null);
  

  const availableHours = ['10', '15', '20'];

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("api/productos");
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error al obtener productos", error);
        toast.error("Error al cargar los productos");
      }
    };
    fetchProducts();
    
    const searchParams = new URLSearchParams(location.search);
    const idReserva = searchParams.get('id_reserva');
    const idTurno = searchParams.get('id_turno'); // <-- recoger id_turno
  
    if (idReserva) {
      setReservaData({ 
        id_reserva: idReserva,
        id_turno: idTurno // <-- guardar id_turno junto a la reserva
      });
      setShowReservaModal(true);
    }
  }, [location.search]);
  

  // Cargar datos del usuario desde el localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  
    // ✅ Restaurar id_orden si existe
    const storedOrdenId = localStorage.getItem('id_orden');
    if (storedOrdenId) {
      setOrdenId(parseInt(storedOrdenId));
    }
  }, []);
  

  // Función para agregar producto al carrito
 const addToCart = async (productId, quantity = 1) => {
  if (!user) {
    toast.info("Debes iniciar sesión para agregar productos al carrito");
    window.location.href = "/login";
    return;
  }

  setLoading(prev => ({ ...prev, [productId]: true }));

  try {
    // Buscar el producto por su ID para obtener el precio
    const product = filteredProducts.find(p => p.idproducto === productId);
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    await api.post("api/detalle/operar", {
      operacion: 'Agregar',
      iduser: user.iduser,
      idproducto: productId,
      precio_unitario: product.precio,  
      cantidad: quantity,
      id_orden: ordenId, 
      id_turno: reservaData?.id_turno 
    });
    toast.success("Producto agregado al carrito");
  } catch (error) {
    console.error("Error al agregar producto al carrito", error);
    toast.error("Error al agregar producto al carrito");
  } finally {
    setLoading(prev => ({ ...prev, [productId]: false }));
  }
};

  // Función para manejar cambio de cantidad
  const handleQuantityChange = (productId, value) => {
    const newValue = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [productId]: newValue }));
  };

  // Función para confirmar la hora seleccionada
  const handleConfirmHour = async () => {
    if (!selectedHour) {
      toast.error("Por favor selecciona el tiempo");
      return;
    }
    
    try {
      const response = await api.post('api/reservas/crear-orden', {
        id_reserva: reservaData.id_reserva,
        id_user: user.iduser,
        hora_comida: selectedHour,
        id_turno: reservaData.id_turno
      });
  
      if (response.status === 200) {
        setOrdenId(response.data.orden.id);
        // ✅ Guarda el id_orden en localStorage para persistencia
        localStorage.setItem('id_orden', response.data.orden.id);
   
        closeReservaModal();

      } else {
        throw new Error(response.data?.message || 'Error al crear la orden');
      }
    } catch (error) {
      toast.error("Error al crear la orden");
      console.error("Error al crear orden:", error);
    }
  };

  // Función para cancelar y volver a reserva
  const handleCancelReservation = () => {
    navigate('/reserva');
  };

  // Cerrar modal de reserva
  const closeReservaModal = () => {
    setShowReservaModal(false);
    navigate(location.pathname, { replace: true });
  };

  return (
    <div className="main-content" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Modal de selección de hora */}
      {showReservaModal && reservaData && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Confirmación de Reserva</h3>
            </div>
            <div className="modal-body">
              <p>Selecciona el tiempo para tu pedido:</p>
              
              <div className="time-options" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                margin: '1.5rem 0'
              }}>
                {availableHours.map(hour => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    style={{
                      padding: '10px',
                      border: selectedHour === hour ? '2px solid #039e99ff' : '1px solid #ddd',
                      backgroundColor: selectedHour === hour ? '#f8d7da' : 'white',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {hour} <h8>Min</h8>
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              borderTop: '1px solid #eee',
              paddingTop: '1rem'
            }}>
              <p>Nota: Será el tiempo que se servirá la comida, después de haber elegido la hora de reserva</p>
              <button 
  onClick={() => {
    handleCancelReservation(); // Primero ejecuta la función de cancelación si es necesaria
    navigate('/historial');   // Luego redirige a la vista de historial
  }}
  style={{
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }}
>
  Cancelar Pedido
</button>
              <button 
                onClick={handleConfirmHour}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: selectedHour ? 1 : 0.6
                }}
                disabled={!selectedHour}
              >
                Confirmar Hora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal del carrito que muestra el componente Cart completo */}
      {showCartModal && (
        <div className="modal-overlay" >
             <div className="modal-body" style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
               <div className="modal-header">
                <h5 className="modal-title">Productos seleccionados</h5>
                <button type="button" className="btn-close" onClick={() => setShowCartModal(false)}></button>
            </div>
        <Cart 
        idOrden={ordenId}       // <-- nuevo prop
        onClose={() => setShowCartModal(false)} 
      />

          </div>
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
        <h1 className="navbar" style={{ color: "#344545ff" }}>
          ¿Qué desea ordenar?
        </h1>
          <div className="d-flex">
            {user && (
              <button
                className="btn"
                style={{
                  backgroundColor: "#0e9785ff",     // TURQUESA EatUp
                  color: "white",
                  border: "none",
                  fontWeight: "600"
                }}
                onClick={() => setShowCartModal(true)}
              >
                Ver Productos Seleccionados
              </button>

            )}
            
          </div>
        </div>
      </nav>

      {/* Mostrar productos */}
      <div className="row">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.idproducto} className="col-md-3 mb-3">
              <div className="card h-100 border-0 shadow-sm amarillo">
                {product.foto && (
                  <img
                    src={`http://127.0.0.1:8000/api/productos/foto/${product.foto}`}
                    className="card-img-top"
                    alt={product.nombre}
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      margin: "10px auto",
                      display: "block",
                      borderRadius: "10px"
                    }}
                  />
                )}
                <div className="card-body d-flex flex-column text-center">
                  <h5 className="card-title text-danger fw-bold">{product.nombre}</h5>
                  <p className="card-text texto-precio fw-bold">${product.precio}</p>
                  
                  <div className="input-group mb-3 d-flex justify-content-center">
                    <div className="quantity-control d-flex align-items-center">
                      <button 
                        className="quantity-btn minus-btn"
                        onClick={() => handleQuantityChange(
                          product.idproducto, 
                          (quantities[product.idproducto] || 1) - 1
                        )}
                        disabled={quantities[product.idproducto] <= 1}
                      >
                        −
                      </button>
                      
                      <input 
                        type="number" 
                        className="quantity-input"
                        value={quantities[product.idproducto] || 1}
                        onChange={(e) => handleQuantityChange(
                          product.idproducto, 
                          Math.max(1, parseInt(e.target.value) || 1)
                        )}
                        min="1"
                      />
                      
                      <button 
                        className="quantity-btn plus-btn"
                        onClick={() => handleQuantityChange(
                          product.idproducto, 
                          (quantities[product.idproducto] || 1) + 1
                        )}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-danger"
                    onClick={() => addToCart(
                      product.idproducto, 
                      quantities[product.idproducto] || 1
                    )}
                    disabled={loading[product.idproducto]}
                  >
                    {loading[product.idproducto] ? 'Agregando...' : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">🔍 No se encontraron productos.</p>
        )}
      </div>
    </div>
  );
}

export default Orden;