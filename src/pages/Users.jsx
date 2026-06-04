import { useState, useEffect } from "react";
import Master from "../components/Master";
import "../assets/css/botones.css";
import "../assets/css/barra_busqueda.css";
import "../assets/css/users.css";
import { toast } from "react-toastify";
import api from "../api/client";
import { Modal, Button } from "react-bootstrap";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    idrol: "",
    password: "",
    genero: "",
    edad: "",
    foto: null,
  });
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Cerrar modales con tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowModal(false);
        setShowPhotoModal(false);
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("api/usuarios");
      setUsers(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("api/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error al obtener roles", error);
    }
  };

  const generateRandomPassword = (length = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    setNewUser({ ...newUser, idrol: e.target.value });
  };

  const handleGeneratePassword = () => {
    setNewUser({ ...newUser, password: generateRandomPassword() });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setNewUser({
      nombre: "",
      email: "",
      idrol: "",
      password: "",
      genero: "",
      edad: "",
      foto: null,
    });
  };

  const handleSaveUser = async () => {
    if (!newUser.nombre || !newUser.email || !newUser.idrol) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    const formData = new FormData();
    const esEdicion = Boolean(editingUser);
    formData.append("operacion", esEdicion ? "Modificar" : "Agregar");
    formData.append("iduser", editingUser?.iduser || "");
    formData.append("nombre", newUser.nombre);
    formData.append("email", newUser.email);
    formData.append("password", newUser.password);
    formData.append("idrol", newUser.idrol);
    formData.append("genero", newUser.genero);
    formData.append("edad", newUser.edad);
    if (newUser.foto) formData.append("foto", newUser.foto);

    try {
      await api.post("api/usuarios/operacion", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchUsers();
      handleCloseModal();

      toast.success(
        esEdicion ? "Usuario modificado correctamente" : "Usuario agregado correctamente"
      );
    } catch (error) {
      console.error("Error al guardar usuario", error);
      toast.error("Ocurrió un error al guardar el usuario");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      iduser: user.iduser,
      nombre: user.nombre,
      email: user.email,
      idrol: user.idrol,
      password: "",
      genero: user.genero || "",
      edad: user.edad || "",
      foto: null,
    });
    setShowModal(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setNewUser({
      nombre: "",
      email: "",
      idrol: "",
      password: "",
      genero: "",
      edad: "",
      foto: null,
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.post("api/usuarios/operacion", {
        iduser: id,
        operacion: "Eliminar",
      });

      fetchUsers();
      toast.success("Eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar usuario", error);
    }
  };

  const handleFileChange = (e) => {
    setNewUser({ ...newUser, foto: e.target.files[0] });
  };

  const handleShowPhoto = (user) => {
    const photoPath = `http://127.0.0.1:8000/api/usuarios/foto/${user.foto}`;
    setPhotoUrl(photoPath);
    setShowPhotoModal(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      roles.find((role) => role.idrol === user.idrol)?.nomrol
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <Master
      titulo={<h1><strong>Usuarios</strong></h1>}
      contenido={
        <div className="container py-4">
          {/* Buscador */}
          <div className="col-md-12">
            <div className="barra_busqueda">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Botón Agregar */}
          <div className="d-flex mb-3">
            <button className="button-agregar" onClick={handleAddUser}>
              + Agregar Usuario
            </button>
          </div>

          {/* Tabla de usuarios */}
          <table className="table table-striped">
            <thead className="bg-primary text-white">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
                <th>Foto</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.iduser}>
                  <td>{user.iduser}</td>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>{roles.find((role) => role.idrol === user.idrol)?.nomrol || "Sin rol"}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditUser(user)}>
                      Editar
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.iduser)}>
                      Eliminar
                    </button>
                  </td>
                  <td>
                    {user.foto && (
                      <button className="btn btn-verfoto btn-sm" onClick={() => handleShowPhoto(user)}>
                        Ver Foto
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* MODAL AGREGAR / EDITAR USUARIO */}
          <Modal
            show={showModal}
            onHide={handleCloseModal}
            backdrop="static"
            keyboard={false}
            
          >
            <Modal.Header closeButton>
              <Modal.Title>{editingUser ? "Editar Usuario" : "Agregar Usuario"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className="form-usuario">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={newUser.nombre}
                  onChange={handleChange}
                  placeholder="Nombre"
                  required
                />

                <label>Correo electrónico:</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleChange}
                  placeholder="Correo"
                  required
                />

                <label>Contraseña:</label>
                <div className="d-flex align-items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newUser.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    className="me-2"
                  />
                  <Button variant="secondary" onClick={handleGeneratePassword}>
                    Generar
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>

                <label>Rol:</label>
                <select name="idrol" value={newUser.idrol} onChange={handleRoleChange} required>
                  <option value="">Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.idrol} value={role.idrol}>
                      {role.nomrol}
                    </option>
                  ))}
                </select>

                <label>Género:</label>
                <select name="genero" value={newUser.genero} onChange={handleChange}>
                  <option value="">Selecciona un género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>

                <label>Edad:</label>
                <select name="edad" value={newUser.edad} onChange={handleChange}>
                  <option value="">Selecciona tu edad</option>
                  <option value="1">De 10 a 15 años</option>
                  <option value="2">De 16 a 20 años</option>
                  <option value="3">De 21 a 30 años</option>
                  <option value="4">De 31 a 40 años</option>
                  <option value="5">De 41 a 50 años</option>
                  <option value="6">Más de 50 años</option>
                </select>

                <label>Foto:</label>
                <input type="file" name="foto" onChange={handleFileChange} />
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cerrar
              </Button>
              <Button
                variant={editingUser ? "warning" : "primary"}
                onClick={handleSaveUser}
              >
                {editingUser ? "Guardar Cambios" : "Agregar Usuario"}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* MODAL FOTO */}
          <Modal
            show={showPhotoModal}
            onHide={() => setShowPhotoModal(false)}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Foto del Usuario</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <img
                src={photoUrl}
                alt="Foto del usuario"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      }
    />
  );
}

export default Users;
