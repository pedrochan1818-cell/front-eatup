import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/estilos.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);  // ✅ Si `App.jsx` ya tiene Router, aquí no debe estar
