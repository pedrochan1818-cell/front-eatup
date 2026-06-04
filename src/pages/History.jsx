import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { FaHistory, FaShoppingBag } from "react-icons/fa";

function History() {
  const { purchaseHistory } = useContext(CartContext);

  return (
    <div className="container">
      <h2 className="text-center mb-4">
        <FaHistory /> Historial de Compras
      </h2>
      {purchaseHistory.length === 0 ? (
        <p className="text-center">No hay compras registradas aún.</p>
      ) : (
        <ul className="list-group">
          {purchaseHistory.map((purchase, index) => (
            <li key={index} className="list-group-item">
              <FaShoppingBag /> <strong>{purchase.date}</strong> - Total: <strong>${purchase.total}</strong> - Método: <strong>{purchase.paymentMethod}</strong>
              <ul className="mt-2">
                {purchase.items.map((item, idx) => (
                  <li key={idx} className="ms-3">
                    {item.quantity}x {item.name} - ${item.price} c/u
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;
