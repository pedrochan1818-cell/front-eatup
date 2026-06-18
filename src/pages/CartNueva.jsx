import { useState, useEffect, useContext, useCallback } from "react";
import { CartContext } from "../context/CartContext";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { STORAGE_URL } from "../api/client";

function CartNueva({ idOrden, onClose }) {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);
  const [user, setUser] = useState(null);
  const [dbCart, setDbCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchCart = useCallback(async () => {
    if (!user?.iduser) return;
  
    try {
      setLoading(true);
  
      const response = await api.get(`api/detalle/${user.iduser}`);
  
      const transformedCart = response.data.map((item) => ({
        id: item.idproducto,
        idcarrito: item.id,
        name: item.producto?.nombre || "Producto no disponible",
        price: item.producto?.precio || 0,
        quantity: item.cantidad,
        foto: item.producto?.foto || null,
      }));
  
      setDbCart(transformedCart);
    } catch (error) {
      console.error("Error al obtener carrito", error);
      toast.error("Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, [user?.iduser]);

  // Cargar usuario del localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Cargar carrito desde la base de datos cuando el usuario cambie
    useEffect(() => {
      fetchCart();
    }, [fetchCart]);



  // 🔥🔥🔥 NUEVO — AGREGAR REPETIDO
  const handleAddRepeated = async (productId) => {
    const item = (user ? dbCart : cart).find(i => i.id === productId);

    try {
      setLoading(true);

      await api.post("api/detalle/operar", {
        operacion: "AgregarRepedido",   // SIEMPRE repetido
        iduser: user?.iduser,
        idproducto: productId,
        id_orden: idOrden,
        cantidad: 1,
        precio_unitario: item.price
      });

      // actualizar contexto
      increaseQuantity(productId);

      // actualizar carrito BD
      setDbCart(prev =>
        prev.map(itm =>
          itm.id === productId
            ? { ...itm, quantity: itm.quantity + 1 }
            : itm
        )
      );

      toast.success("Producto repetido agregado");

    } catch (error) {
      console.error("Error al agregar repetido", error);
      toast.error("No se pudo agregar repetido");
    } finally {
      setLoading(false);
    }
  };
  // 🔥 FIN FUNCIÓN NUEVA

  const handleRemoveFromCart = async (productId) => {
    const item = (user ? dbCart : cart).find(i => i.id === productId);

    try {
      setLoading(true);
      await api.post("api/detalle/operar", {
        operacion: "Eliminar",
        iduser: user?.iduser,
        idproducto: productId,
        id_orden: idOrden,
        precio_unitario: item?.price || 0
      });

      removeFromCart(productId);
      setDbCart(prev => prev.filter(item => item.id !== productId));

      toast.success("Producto eliminado del carrito");
    } catch (error) {
      console.error("Error al eliminar del carrito", error);

      if (error.response?.data?.error === "Producto no encontrado en el carrito") {
        removeFromCart(productId);
        setDbCart(prev => prev.filter(item => item.id !== productId));
      }

      toast.error(error.response?.data?.error || "Error al eliminar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleIncreaseQuantity = async (productId) => {
    const item = (user ? dbCart : cart).find(i => i.id === productId);

    try {
      setLoading(true);
      await api.post("api/detalle/operar", {
        operacion: "AgregarRepedido",
        iduser: user?.iduser,
        idproducto: productId,
        id_orden: idOrden,
        cantidad: 1,
        precio_unitario: item.price
      });

      increaseQuantity(productId);
      setDbCart(prev => prev.map(itm =>
        itm.id === productId ? { ...itm, quantity: itm.quantity + 1 } : itm
      ));
    } catch (error) {
      console.error("Error al actualizar cantidad", error);
      toast.error("Error al actualizar cantidad");
    } finally {
      setLoading(false);
    }
  };

  const handleDecreaseQuantity = async (productId) => {
    const item = (user ? dbCart : cart).find(i => i.id === productId);
    if (!item || item.quantity <= 1) return;

    try {
      setLoading(true);
      await api.post("api/detalle/operar", {
        operacion: "Actualizar",
        iduser: user?.iduser,
        idproducto: productId,
        id_orden: idOrden,
        cantidad: item.quantity - 1,
        precio_unitario: item.price
      });

      decreaseQuantity(productId);
      setDbCart(prev => prev.map(itm =>
        itm.id === productId ? { ...itm, quantity: itm.quantity - 1 } : itm
      ));
    } catch (error) {
      console.error("Error al actualizar cantidad", error);
      toast.error("Error al actualizar cantidad");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPayment = () => {
    const itemsToCheck = user ? dbCart : cart;
    if (itemsToCheck.length === 0) {
      toast.error("El carrito está vacío.");
      return;
    }

    const totalAmount = calculateTotal();
    navigate("/payment", { state: { cart: itemsToCheck, total: totalAmount } });
  };

  const calculateTotal = () => {
    const items = user ? dbCart : cart;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const displayCart = user ? dbCart : cart;

  return (
    <div className="main-content">
      <h2 className="text-center">
        <FaShoppingCart /> Carrito de Compras
      </h2>

      {loading && <div className="text-center my-3">Cargando...</div>}

      <ul>
        {displayCart.length > 0 ? (
          displayCart.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                {item.foto && (
                  <img
                    src={`${STORAGE_URL}/api/productos/foto/${item.foto}`}
                    alt=""
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      marginRight: '15px',
                      borderRadius: '5px'
                    }}
                  />
                )}
                <div>
                  <h6 className="mb-0">{item.name}</h6>
                  <small>${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</small>
                </div>
              </div>

              <div>
                {/* SUMAR */}
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => handleIncreaseQuantity(item.id)}
                  disabled={loading}
                >
                  <FaPlus />
                </button>

                {/* RESTAR */}
                <button
                  className="btn btn-outline-secondary btn-sm me-2"
                  onClick={() => handleDecreaseQuantity(item.id)}
                  disabled={loading || item.quantity <= 1}
                >
                  <FaMinus />
                </button>

                {/* 🔥 BOTÓN NUEVO: REPETIDO */}
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleAddRepeated(item.id)}
                  disabled={loading}
                >
                  REP
                </button>

                {/* ELIMINAR */}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveFromCart(item.id)}
                  disabled={loading}
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-center text-muted my-3">Tu carrito está vacío</p>
        )}
      </ul>

      <h3 className="mt-3 text-light">Total: ${calculateTotal().toFixed(2)}</h3>

      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-success btn-lg flex-grow-1"
          onClick={handleGoToPayment}
          disabled={loading || displayCart.length === 0}
        >
          {loading ? 'Procesando...' : (<><FaShoppingCart /> Finalizar Compra</>)}
        </button>
      </div>
    </div>
  );
}

export default CartNueva;
