import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import Master from "../components/Master";
import "../assets/css/botones.css";
import { toast } from "react-toastify";
import api, { STORAGE_URL } from "../api/client";
import "../assets/css/barra_busqueda.css";
import "../assets/css/products.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function Products() {
  const { message } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    precio: "",
    foto: null,
    descripcion: "",
    categoria: "comida",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDescription, setShowDescription] = useState(null);
  const [activeCategory, setActiveCategory] = useState("todos");

  const categories = [
    { id: "todos", name: "Todos los platos" },
    { id: "entradas", name: "Entradas" },
    { id: "platos principales", name: "Platos principales" },
    { id: "postres", name: "Postres" },
    { id: "bebidas", name: "Bebidas" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("api/productos");
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      setError("No se pudo cargar los productos. Intenta más tarde.");
      console.error("Error al obtener productos", error);
    }
  };

  useEffect(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeCategory !== "todos") {
      result = result.filter((product) => product.categoria === activeCategory);
    }
    setFilteredProducts(result);
  }, [searchTerm, products, activeCategory]);

  const handleChange = (e) => {
    if (e.target.name === "foto") {
      setNewProduct({ ...newProduct, foto: e.target.files[0] });
    } else {
      setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.nombre || !newProduct.precio || !newProduct.categoria) {
      toast.error("Nombre, precio y categoría son obligatorios");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", newProduct.nombre);
    formData.append("precio", newProduct.precio);
    formData.append("descripcion", newProduct.descripcion);
    formData.append("categoria", newProduct.categoria);
    formData.append("operacion", editingProduct ? "Modificar" : "Agregar");

    if (editingProduct) formData.append("idproducto", editingProduct.idproducto);
    if (newProduct.foto) formData.append("foto", newProduct.foto);

    try {
      await api.post("api/productos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProducts();
      setNewProduct({
        nombre: "",
        precio: "",
        foto: null,
        descripcion: "",
        categoria: "comida",
      });
      setEditingProduct(null);
      setError(null);
      setShowModal(false);
      toast.success(
        editingProduct ? "Plato actualizado correctamente" : "Plato agregado al menú"
      );
    } catch (error) {
      setError("Error al guardar el plato. Intenta más tarde.");
      console.error("Error al guardar el producto", error);
      toast.error("Error al guardar el plato");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      nombre: product.nombre,
      precio: product.precio,
      foto: null,
      descripcion: product.descripcion,
      categoria: product.categoria || "comida",
    });
    setShowModal(true);
  };

  const handleDeleteProduct = async (idproducto) => {
    if (!window.confirm("¿Estás seguro de eliminar este plato del menú?")) return;

    try {
      await api.post("api/productos", {
        operacion: "Eliminar",
        idproducto,
      });
      fetchProducts();
      toast.success("Plato eliminado del menú");
    } catch (error) {
      setError("Error al eliminar el plato. Intenta más tarde.");
      console.error("Error al eliminar el producto", error);
      toast.error("Error al eliminar el plato");
    }
  };

  const handleShowDescription = (productId) => {
    setShowDescription(showDescription === productId ? null : productId);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "entradas":
        return "bg-info";
      case "comida":
        return "bg-primary";
      case "postres":
        return "bg-warning";
        case "platos principales":
          return "bg-warning";
      case "bebidas":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  return (
    <Master
      titulo={
        <div className="d-flex justify-content-between align-items-center">
          <h1>
            <strong>Menú del Restaurante</strong>
          </h1>
        </div>
      }
      contenido={
        <div className="container py-4">
          {message && <div className="alert alert-success text-center">{message}</div>}
          {error && <div className="alert alert-danger text-center">{error}</div>}

          {/* Barra de búsqueda */}
          <div className="barra_busqueda mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar platos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex mb-3">
          <button 
            className="button-agregar"
            onClick={() => {
              setEditingProduct(null);
              setNewProduct({ nombre: "", precio: "", foto: null, descripcion: "", categoria: "comida" });
              setShowModal(true);
            }}
          >
            + Agregar Plato
          </button>
          </div>
       
          {/* Filtros por categoría */}
          <div className="mb-4">
            <div className="d-flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`btn ${
                    activeCategory === category.id ? "btn-dark" : "btn-outline-dark"
                  } rounded-pill`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de productos */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.idproducto} className="col">
                  <div className="card h-100 shadow-sm border-0 overflow-hidden">
                    <div
                      className="position-relative overflow-hidden"
                      style={{ height: "200px" }}
                    >
                      <img
                        src={`${STORAGE_URL}/api/productos/foto/${product.foto}`}
                        className="card-img-top h-100 w-100 object-fit-cover"
                        alt={product.nombre}
                      />
                      <div
                        className={`position-absolute top-0 start-0 text-white p-2 ${getCategoryColor(
                          product.categoria
                        )}`}
                      >
                        {categories.find((c) => c.id === product.categoria)?.name ||
                          product.categoria}
                      </div>
                      <div className="position-absolute top-0 end-0 bg-dark text-white p-2">
                        $/ {parseFloat(product.precio).toFixed(2)}
                      </div>
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-dark mb-3">{product.nombre}</h5>

                      <div className="mb-3">
                        <button
                          className="btn btn-link text-decoration-none p-0 text-primary"
                          onClick={() => handleShowDescription(product.idproducto)}
                        >
                          {showDescription === product.idproducto ? (
                            <>
                              <i className="bi bi-chevron-up me-1"></i> Ocultar detalles
                            </>
                          ) : (
                            <>
                              <i className="bi bi-chevron-down me-1"></i> Ver detalles
                            </>
                          )}
                        </button>
                        {showDescription === product.idproducto && (
                          <div className="mt-2 text-muted">
                            {product.descripcion || "No hay descripción disponible"}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto d-flex justify-content-between">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <i className="bi bi-pencil me-1"></i> Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.idproducto)}
                        >
                          <i className="bi bi-trash me-1"></i> Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i
                  className="bi bi-emoji-frown"
                  style={{ fontSize: "3rem", color: "#6c757d" }}
                ></i>
                <h4 className="mt-3 text-muted">No se encontraron platos</h4>
                <p>Intenta con otra categoría o término de búsqueda</p>
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("todos");
                  }}
                >
                  Mostrar todo el menú
                </Button>
              </div>
            )}
          </div>

          {/* MODAL */}
          <Modal
            show={showModal}
            onHide={() => {
              setShowModal(false);
              setEditingProduct(null);
            }}
            centered
            backdrop="static"
            keyboard={true}
          >
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title>
                <i className="bi bi-egg-fried me-2"></i>
                {editingProduct ? "Editar Plato" : "Agregar Plato al Menú"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={handleAddProduct}>
                <div className="mb-3">
                  <label className="form-label">Nombre del Plato*</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={newProduct.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Precio ($/)*</label>
                    <input
                      type="number"
                      name="precio"
                      className="form-control"
                      value={newProduct.precio}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Categoría*</label>
                    <select
                      name="categoria"
                      className="form-select"
                      value={newProduct.categoria}
                      onChange={handleChange}
                      required
                    >
                      {categories
                        .filter((c) => c.id !== "todos")
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control"
                    rows="3"
                    value={newProduct.descripcion}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {editingProduct ? "Cambiar imagen (opcional)" : "Imagen del plato*"}
                  </label>
                  <input
                    type="file"
                    name="foto"
                    className="form-control"
                    accept="image/*"
                    onChange={handleChange}
                    required={!editingProduct}
                  />
                </div>

                <Button type="submit" variant="primary" className="w-100 mt-3">
                  <i className="bi bi-check-circle me-1"></i>
                  {editingProduct ? "Actualizar Plato" : "Agregar al Menú"}
                </Button>
              </form>
            </Modal.Body>
          </Modal>
        </div>
      }
    />
  );
}

export default Products;
