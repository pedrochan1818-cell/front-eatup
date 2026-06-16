import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/carta.css";
import api from '../api/client'; 

function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({});
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

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
  }, []);

  // Filtrar productos por nombre al escribir en el input de búsqueda
  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  // Función para obtener los datos actualizados del usuario
  const fetchUserData = async (iduser) => {
    try {
      const response = await api.get(`api/usuarios/${iduser}`);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
    }
  };

  // Cargar datos del usuario desde el localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserData(parsedUser.iduser);
    }
  }, []);


  // Función para agregar producto al carrito (actualizada)
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.info("Debes iniciar sesión para agregar productos al carrito");
      window.location.href = "/login";
      return;
    }

    setLoading(prev => ({ ...prev, [productId]: true }));

    try {
      await api.post("api/carrito/operar", {
        operacion: 'Agregar',
        iduser: user.iduser,
        idproducto: productId,
        cantidad: quantity
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

  return (
    <div className="main-content container-carta" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/*<nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <span className="navbar-brand">EatUp</span>

          {user ? (
            <h2 className="text-center text-danger mb-4">
              ¡Bienvenido, {user.nombre}!
            </h2>
          ) : (
            <h2 className="text-center text-primary mb-4">🛍️ Catálogo de Productos</h2>
          )}

  
        </div>
      </nav>*/}

      {/* Campo de búsqueda */}
      <div className="input-group my-2">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mostrar productos filtrados */}
      <div className="row">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.idproducto} className="col-md-3 mb-3">
              <div className="card h-100 border-0 shadow-sm amarillo" >
                {product.foto && (
                  <img
                    src={`http://127.0.0.1:8000/api/productos/foto/${product.foto}`}
                    className="card-img-top"
                    alt={product.nombre}
                    style={{
                      width: "125px",
                      height: "125px",
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
                  
                  {/* Selector de cantidad */}
                  <div className="input-group mb-3 d-flex justify-content-center">
                    <div className="quantity-control d-flex align-items-center" >
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
          <p className="text-center text-muted">🔍 No se encontraron productos.</p>
        )}
      </div>
    </div>
  );
}

export default Home;