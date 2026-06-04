import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MicrosoftLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const iduser = params.get("iduser");
    const email = params.get("email");
    const nombre = params.get("nombre");

    if (!token || !iduser || !email || !nombre) {
      return navigate("/login"); // si algo falla
    }

    // Guardar datos en localStorage
    const user = { iduser, email, nombre };
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    // Redirigir al home
    navigate("/home");
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        <p>Cargando datos de Microsoft...</p>
      </div>
    </div>
  );
}

export default MicrosoftLogin;
