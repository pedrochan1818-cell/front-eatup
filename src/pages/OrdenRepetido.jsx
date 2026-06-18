import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/estilos.css";
import CartNueva from "./CartNueva"; 
import api, { STORAGE_URL } from "../api/client";

function OrdenRepetido() {
  const [ ,setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({});
  const [quantities, setQuantities] = useState({});
  const [showCartModal, setShowCartModal] = useState(false);
  const [ordenId, setOrdenId] = useState(null);
  

  // Cargar productos desde API
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
  }, []);

  // Cargar usuario + id_orden repetido
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Guarda su propio id_orden de repetidos
    const storedOrdenId = localStorage.getItem('id_orden');
    if (storedOrdenId) {
      setOrdenId(parseInt(storedOrdenId));
    }
  }, []);

  // AGREGAR con operacion = AgregarRepedido
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.info("Debes iniciar sesión para agregar productos");
      window.location.href = "/login";
      return;
    }

    setLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const product = filteredProducts.find(p => p.idproducto === productId);
      if (!product) {
        toast.error("Producto no encontrado");
        return;
      }

      await api.post("api/detalle/operar", {
        operacion: "AgregarRepedido", // ⚠️ CAMBIO CLAVE
        iduser: user.iduser,
        idproducto: productId,
        precio_unitario: product.precio,
        cantidad: quantity,
        id_orden: ordenId,
        numero_pedido: 2
      });

      toast.success("Producto agregado a REPETIDOS");
    } catch (error) {
      console.error("Error al agregar producto repetido", error);
      toast.error("Error al agregar producto repetido");
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Manejo de cantidad
  const handleQuantityChange = (productId, value) => {
    const newValue = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [productId]: newValue }));
  };

  return (
    <div className="main-content" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Modal del carrito */}
      {showCartModal && (
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
            padding: '1rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowCartModal(false)} 
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>

            <CartNueva 
              idOrden={ordenId}  
              numeroPedido={2}     // ⚠️ para que solo muestre productos repetidos
              onClose={() => setShowCartModal(false)} 
            />
          </div>
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <h1 className="navbar">¿Qué desea volver a pedir?</h1>
          
          <div className="d-flex">
            {user && (
              <button 
                className="btn btn-danger me-2"
                onClick={() => setShowCartModal(true)}
              >
                Ver repetidos seleccionados
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mostrar productos */}
      <div className="row">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.idproducto} className="col-md-4 mb-3">
              <div className="card h-100 border-0 shadow-sm amarillo">

                {product.foto && (
                  <img
                    src={`${STORAGE_URL}/api/productos/foto/${product.foto}`}
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
                    {loading[product.idproducto] ? 'Agregando...' : 'Agregar repetido'}
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

export default OrdenRepetido;
