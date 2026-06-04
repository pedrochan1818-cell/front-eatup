import { createContext, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // 🔥 Mostrar notificación
  const notify = (message) => {
    toast.success(message, { position: "top-right", autoClose: 1500 });
  };

  // 🔥 Agregar producto al carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        notify(`🔄 Aumentaste la cantidad de ${product.name} en el carrito.`);
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        notify(`🛒 ${product.name} agregado al carrito.`);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // 🔥 Remover un producto del carrito
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    notify("🗑 Producto eliminado del carrito.");
  };

  // 🔥 Aumentar cantidad de un producto en el carrito
  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    notify("📈 Se aumentó la cantidad del producto.");
  };

  // 🔥 Disminuir cantidad de un producto en el carrito
  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0) // 🔥 Si la cantidad llega a 0, lo eliminamos
    );
    notify("📉 Se redujo la cantidad del producto.");
  };

  // 🔥 Obtener total del carrito
  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // 🔥 Vaciar el carrito completamente
  const clearCart = () => {
    setCart([]);
    notify("🛒 El carrito ha sido vaciado.");
  };

  // 🔥 Registrar compra y limpiar carrito
  const finalizePurchase = (paymentMethod) => {
    if (cart.length === 0) return;

    const newPurchase = {
      date: new Date().toLocaleString(),
      total: getTotal(),
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })), // 🔥 Guardamos productos con cantidad y precio
      paymentMethod: paymentMethod || "Efectivo", // 🔥 Si no se pasa método, por defecto es efectivo
    };

    setPurchaseHistory((prevHistory) => [...prevHistory, newPurchase]);
    clearCart();
    notify(`✅ Compra realizada con ${paymentMethod}.`);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        getTotal,
        finalizePurchase,
        clearCart,
        purchaseHistory,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
