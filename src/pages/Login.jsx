import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../assets/css/login.css";
import logo from '../assets/img/EATUP-MARK2.png';
import api from '../api/client'; 

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Todos los campos son obligatorios");
      return false;
    }
    setError("");
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post("api/login", formData);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      // 👇 redirige a la ruta enviada desde Laravel
      navigate(response.data.redirect);
    } catch (error) {
      setError(error.response?.data?.error || "Error en la autenticación.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
  
    try {
      const demoData = {
        email: "prueba@gmail.com",
        password: "123456"
      };
  
      const response = await api.post("api/login", demoData);
  
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
  
      navigate(response.data.redirect);
    } catch (error) {
      setError("No se pudo acceder al modo demo.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        {/* Imagen circular */}
        <div className="login-image-container">
          <img
            src={logo} // Usa la variable importada
            alt="Logo"
            className="login-image"
          />
        </div>

        <p className="login-text">
          <span className="fa-stack fa-lg">
            <i className="fa fa-circle fa-stack-2x"></i>
            <i className="fa fa-lock fa-stack-1x"></i>
          </span>
        </p>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <input
          type="email"
          className="login-username"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          disabled={loading}
          required
        />

        <div className="position-relative">
          <input
            type={showPassword ? "text" : "password"}
            className="login-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            disabled={loading}
            required
            style={{ paddingRight: "40px" }} // Añade padding para el ícono
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(105, 174, 227, 0.7)", // Color del ícono
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button className="login-submit" onClick={handleLogin} disabled={loading}>
          {loading ? "Cargando..." : <><FaLock /> Acceder</>}
        </button>

        {/*<button className="login-submit" onClick={handleClear} disabled={loading}>
          <FaBroom /> Limpiar
        </button>*/}

        <p className="text-center cuenta mt-3">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="text-pink fw-bold">
            Regístrate aquí
          </Link>
        </p>

        {/* Separador */}
        <div className="separator">
          <span>O</span>
        </div>

        {/* Botones sociales 
        <div className="social-login">
          <a href="http://localhost:8000/login/google" className="social-btn google-btn">
            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="social-icon" />
            <span>Continuar con Google</span>
          </a>

          <a href="http://localhost:8000/auth/microsoft" className="social-btn microsoft-btn">
            <img 
              src="https://img.icons8.com/color/48/microsoft.png" 
              alt="Microsoft" 
              className="social-icon" 
            />
            <span>Continuar con Microsoft</span>
          </a>
        </div>*/}
              <button
              className="login-submit demo-btn"
              onClick={handleDemoLogin}
              disabled={loading}
            >
             Entrar como Demo
            </button>
      </div>

      <div className="underlay-photo"></div>
      <div className="underlay-black"></div>
    </div>
  );
}

export default Login;
