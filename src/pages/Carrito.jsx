import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/estilos.css";
import "../assets/css/carrito.css";
import { useNavigate } from "react-router-dom";
import CartCarrito from "./CartCarrito"; 
import api, { STORAGE_URL } from "../api/client";

function Carrito() {
  const [, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({});
  const [quantities, setQuantities] = useState({});
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [carritoId, setCarritoId] = useState(null);
  
  const navigate = useNavigate();

  // 🔹 Cargar productos
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

  // 🔹 Cargar Usuario + Carrito existente
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedCarritoId = localStorage.getItem("id_carrito");
    if (storedCarritoId) {
      setCarritoId(parseInt(storedCarritoId));
      setShowReservaModal(false); 
    } else {
      setShowReservaModal(true); 
    }
  }, []);

  // 🔹 Crear carrito
  const handleConfirmCarrito = async () => {
    try {
      const response = await api.post("api/carrito/crear-carrito", {
        id_user: user.iduser,
        id_turno: 2,
        hora_comida: 20
      });

      if (response.data.success) {
        const idCarrito = response.data.id_carrito;

        setCarritoId(idCarrito);
        localStorage.setItem("id_carrito", idCarrito);

        toast.success("Carrito creado correctamente");
        setShowReservaModal(false);

      } else {
        toast.error(response.data.message || "Error al crear carrito");
      }

    } catch (error) {
      console.error("Error al crear carrito:", error);
      toast.error("Error al crear el carrito");
    }
  };

  // 🔹 Agregar al carrito
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.info("Debes iniciar sesión para agregar productos");
      navigate("/login");
      return;
    }

    if (!carritoId) {
      toast.error("Primero debes crear tu carrito");
      return;
    }

    setLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const product = filteredProducts.find(p => p.idproducto === productId);

      await api.post("api/carrito/operar", {
        operacion: "Agregar",
        iduser: user.iduser,
        idproducto: productId,
        cantidad: quantity,
        precio_unitario: product.precio,
        id_carrito: carritoId
      });

      toast.success("Producto agregado");

    } catch (error) {
      console.error("Error al agregar producto:", error);
      toast.error("Error al agregar producto");

    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // 🔹 Cambiar cantidades
  const handleQuantityChange = (productId, value) => {
    const newValue = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [productId]: newValue }));
  };

  return (
    <div className="main-content" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* 🔹 Modal inicial si NO existe id_carrito */}
      {showReservaModal && (
<div className={`modal fade ${showReservaModal ? "show d-block" : ""}`} tabIndex="-1">
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">

      <div className="modal-header">
        <h5 className="modal-title">Confirmar orden</h5>
      </div>

      <div className="modal-body">
        <p>Presiona confirmar para iniciar tu pedido.</p>

        <p className="fw-bold text-danger">
          Tu orden estará lista aproximadamente en 20 minutos.
        </p>

        <p className="text-muted">
          Nota: También puedes hacer una reserva y recibir tu pedido justo al llegar.
        </p>
      </div>

      <div className="modal-footer">
       <button className="btn btn-secondary" onClick={() => navigate('/carritos')}>
          Cancelar
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/reserva')}>
          Reservar
        </button>
        <button className="btn btn-danger" onClick={handleConfirmCarrito}>
          Confirmar
        </button>
      </div>

    </div>
  </div>
</div>

      )}

      {/* 🔹 Modal del carrito */}
      {showCartModal && carritoId && (
        <div className="modal-overlay">
            
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
            <CartCarrito idCarrito={carritoId} onClose={() => setShowCartModal(false)} />
          </div>
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <h1 className="navbar">¿Qué desea ordenar?</h1>
          
          <div className="d-flex">
            {user && carritoId && (
              <button 
                className="btn btn-danger me-2"
                onClick={() => setShowCartModal(true)}
              >
                Ver Productos Seleccionados
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 🔹 Lista de productos */}
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
                      width: "150px", height: "150px",
                      objectFit: "cover", margin: "10px auto",
                      display: "block", borderRadius: "10px"
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
                        disabled={(quantities[product.idproducto] || 1) <= 1}
                      >
                        −
                      </button>

                      <input 
                        type="number"
                        className="quantity-input"
                        value={quantities[product.idproducto] || 1}
                        onChange={(e) => handleQuantityChange(
                          product.idproducto,
                          parseInt(e.target.value) || 1
                        )}
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
                    onClick={() => addToCart(product.idproducto, quantities[product.idproducto] || 1)}
                    disabled={loading[product.idproducto]}
                  >
                    {loading[product.idproducto] ? "Agregando..." : "Agregar al carrito"}
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

export default Carrito;
