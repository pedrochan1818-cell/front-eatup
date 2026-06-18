import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/carta.css";
import api, { STORAGE_URL } from "../api/client";

function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

  const navigate = useNavigate();

  // Obtener productos
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

  // Filtrar productos
  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  // Cambiar cantidad
  const handleQuantityChange = (productId, value) => {
    const newValue = Math.max(1, parseInt(value) || 1);

    setQuantities((prev) => ({
      ...prev,
      [productId]: newValue,
    }));
  };

  return (
    <div
      className="main-content container-carta"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Buscador */}
      <div className="input-group my-2">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Productos */}
      <div className="row">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.idproducto} className="col-md-3 mb-3">
              <div className="card h-100 border-0 shadow-sm amarillo">
                {product.foto && (
                  <img
                    src={`${STORAGE_URL}/api/productos/foto/${product.foto}`}
                    alt={product.nombre}
                    className="card-img-top"
                    style={{
                      width: "125px",
                      height: "125px",
                      objectFit: "cover",
                      margin: "10px auto",
                      display: "block",
                      borderRadius: "10px",
                    }}
                  />
                )}

                <div className="card-body d-flex flex-column text-center">
                  <h5 className="card-title text-danger fw-bold">
                    {product.nombre}
                  </h5>

                  <p className="card-text texto-precio fw-bold">
                    ${product.precio}
                  </p>

                  {/* Cantidad */}
                  <div className="input-group mb-3 d-flex justify-content-center">
                    <div className="quantity-control d-flex align-items-center">
                      <button
                        className="quantity-btn minus-btn"
                        onClick={() =>
                          handleQuantityChange(
                            product.idproducto,
                            (quantities[product.idproducto] || 1) - 1
                          )
                        }
                        disabled={
                          (quantities[product.idproducto] || 1) <= 1
                        }
                      >
                        −
                      </button>

                      <input
                        type="number"
                        className="quantity-input"
                        min="1"
                        value={quantities[product.idproducto] || 1}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.idproducto,
                            e.target.value
                          )
                        }
                      />

                      <button
                        className="quantity-btn plus-btn"
                        onClick={() =>
                          handleQuantityChange(
                            product.idproducto,
                            (quantities[product.idproducto] || 1) + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn-ordenar"
                    onClick={() => navigate("/carrito")}
                  >
                    Ordenar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">
            🔍 No se encontraron productos.
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;