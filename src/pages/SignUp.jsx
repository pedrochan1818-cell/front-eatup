import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus, FaBroom, FaEye, FaEyeSlash } from "react-icons/fa";
import "../assets/css/signup.css"; // Importa el CSS específico para el registro
import api from '../api/client';

function Signup() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    genero: "",
    edad: "",
    foto: null, // Foto opcional
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "foto") {
      setFormData({ ...formData, foto: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validateForm = () => {
    if (
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.nombre.trim() ||
      !formData.edad.trim()
    ) {
      setError("Nombre, correo, contraseña y edad son obligatorios.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post("api/usuario/autoregistro", formData);

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      setTimeout(() => navigate("/login"), 500);
    } catch (error) {
      setError(error.response?.data?.error || "Error al registrarse.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ nombre: "", email: "", password: "", genero: "", edad: "", foto: null });
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Alterna entre mostrar y ocultar la contraseña
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2 className="signup-text">Registrarse</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Nombre (Obligatorio)</label>
          <input
            type="text"
            className="signup-input"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingresa tu nombre"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Correo Electrónico (Obligatorio)</label>
          <input
            type="email"
            className="signup-input"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingresa tu correo"
            disabled={loading}
          />
        </div>

        <div className="mb-3 position-relative">
          <label className="form-label">Contraseña (Obligatorio)</label>
          <input
            type={showPassword ? "text" : "password"} // Cambia el tipo de input
            className="signup-input"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Crea una contraseña"
            disabled={loading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Alterna entre los íconos */}
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">Género (Obligatorio)</label>
          <select
            className="signup-input"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Selecciona tu género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Edad (Obligatorio)</label>
          <select
            className="signup-input"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Selecciona tu edad</option>
            <option value="1">De 10 a 15 años</option>
            <option value="2">De 16 a 20 años</option>
            <option value="3">De 21 a 30 años</option>
            <option value="4">De 31 a 40 años</option>
            <option value="5">De 41 a 50 años</option>
            <option value="6">Más de 50 años</option>
          </select>
        </div>

        <button
          className="signup-submit"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Registrando..." : <><FaUserPlus className="me-1" /> Crear Cuenta</>}
        </button>

        <button
          className="btn-clear"
          onClick={handleClear}
          disabled={loading}
        >
          <FaBroom className="me-1" /> Limpiar
        </button>

        <p className="text-center mt-3">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="signup-link">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;