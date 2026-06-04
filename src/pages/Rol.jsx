import { useState, useEffect } from "react";
import Master from "../components/Master";
import RolxPermiso from "./RolxPermiso";
import "../assets/css/botones.css";
import api from "../api/client";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";

function Rol() {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRol, setNewRol] = useState({ nomrol: "" });
  const [editingRol, setEditingRol] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get("api/roles");
      setRoles(response.data);
      return response.data; // <--- retornar los roles actualizados
    } catch (error) {
      console.error("Error al obtener roles", error);
      return [];
    }
  };

  const filteredRoles = roles.filter((rol) =>
    rol.nomrol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setNewRol({ ...newRol, [e.target.name]: e.target.value });
  };

  const handleSaveRol = async () => {
    if (!newRol.nomrol) {
      toast.error("El nombre del rol es obligatorio");
      return;
    }

    const data = {
      nomrol: newRol.nomrol,
      operacion: editingRol ? "Modificar" : "Agregar",
      idrol: editingRol?.idrol,
    };

    try {
      await api.post("api/roles", data);
      fetchRoles();
      setNewRol({ nomrol: "" });
      setEditingRol(null);
      setShowModal(false);
      toast.success(
        editingRol ? "Rol modificado correctamente" : "Rol agregado correctamente"
      );
    } catch (error) {
      setError("Error al guardar el rol. Intenta más tarde.");
      console.error("Error al guardar el rol", error);
    }
  };

  const handleEditRol = (rol) => {
    setEditingRol(rol);
    setNewRol({ nomrol: rol.nomrol });
    setShowModal(true);
  };

  const handleDeleteRol = async (idrol) => {
    try {
      await api.post("api/roles", { operacion: "Eliminar", idrol });
      fetchRoles();
      toast.success("Rol eliminado correctamente");
    } catch (error) {
      setError("Error al eliminar el rol. Intenta más tarde.");
      console.error("Error al eliminar el rol", error);
    }
  };

  const handleAssignPermissions = async (rol) => {
    await fetchRoles(); 
    // Buscar el rol actualizado
    const rolActualizado = roles.find(r => r.idrol === rol.idrol);
    setRolSeleccionado(rolActualizado || rol);
    setShowPermisosModal(true);
  };
  

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRol(null);
    setNewRol({ nomrol: "" });
  };

  const handleClosePermisosModal = () => {
    setShowPermisosModal(false);
    setRolSeleccionado(null);
  };

  return (
    <Master
      titulo={<h1><strong>Roles y Permisos</strong></h1>}
      contenido={
        <div className="container py-4">
          {error && <div className="alert alert-danger text-center">{error}</div>}

          {/* Barra de búsqueda */}
          <div className="col-md-12">
            <div className="barra_busqueda">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Botón agregar */}
          <div className="d-flex mb-3">
            <button className="button-agregar" onClick={() => setShowModal(true)}>
              + Agregar Rol
            </button>
          </div>

          {/* Listado */}
          <ul className="list-group mt-4">
            {filteredRoles.length > 0 ? (
              filteredRoles.map((rol) => (
                <li
                  key={rol.idrol}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {rol.nomrol}
                  <div>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEditRol(rol)}
                    >
                      Modificar
                    </button>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDeleteRol(rol.idrol)}
                    >
                      Eliminar
                    </button>
                    <button
                      className="btn btn-asignar btn-sm"
                      onClick={() => handleAssignPermissions(rol)}
                    >
                      Asignar Permisos
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-muted">No hay roles con ese nombre.</p>
            )}
          </ul>

          {/* ✅ MODAL AGREGAR / EDITAR */}
          <Modal
            show={showModal}
            onHide={handleCloseModal}
            backdrop="static"
            keyboard={true} // Permite cerrar con ESC
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>{editingRol ? "Editar Rol" : "Agregar Rol"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input
                type="text"
                name="nomrol"
                className="form-control border-0 shadow-sm"
                placeholder="Nombre del Rol"
                value={newRol.nomrol}
                onChange={handleChange}
                style={{ backgroundColor: "#f0f2f5" }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cerrar
              </Button>
              <Button variant={editingRol ? "warning" : "primary"} onClick={handleSaveRol}>
                {editingRol ? "Actualizar Rol" : "Agregar Rol"}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* ✅ MODAL ASIGNAR PERMISOS */}
          <Modal
            show={showPermisosModal}
            onHide={handleClosePermisosModal}
            backdrop="static"
            keyboard={true}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Asignar Permisos al Rol</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <RolxPermiso
                idrol={rolSeleccionado?.idrol}
                onClose={handleClosePermisosModal}
                fetchRoles={fetchRoles}
              />
            </Modal.Body>
          </Modal>
        </div>
      }
    />
  );
}

export default Rol;
