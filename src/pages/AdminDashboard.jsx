import React, { useEffect, useRef, useState } from "react";
import Master from "../components/Master";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import api from "../api/client";
import { Buffer } from "buffer";
import "../assets/css/superset.css";



const SUPERSET_DOMAIN = "http://localhost:8088";

// Polyfill de Buffer
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

function AdminDashboard() {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;

    const loadDashboard = async () => {
      try {
        console.log("📡 Pidiendo guest token a Laravel...");

        const res = await api.get("api/superset/guest-token");
        console.log("✔ Token recibido:", res.data);

        const { guest_token, dashboard_id } = res.data;

        if (!guest_token || !dashboard_id) {
          throw new Error("guest_token o dashboard_id faltantes.");
        }

        if (cancel) return;

        console.log("📌 Embed dashboard:", dashboard_id);

        await embedDashboard({
          id: dashboard_id,
          supersetDomain: SUPERSET_DOMAIN,
          mountPoint: containerRef.current,
          fetchGuestToken: () => guest_token,
        });

        console.log("✔ Dashboard embebido");
      } catch (err) {
        console.error("❌ Error embebiendo dashboard:", err);

        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "No se pudo cargar el dashboard.";

        setError(msg);
      }
    };

    loadDashboard();

    return () => {
      cancel = true;
    };
  }, []);

  return (
    <Master
      contenido={
        <div className="container-fluid py-4">
          <h2 className="fw-bold text-center mb-4" style={{ color: "#c0392b" }}>
            Dashboard
          </h2>

          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div
  className="superset-wrapper"
  ref={containerRef}
/>

          )}
        </div>
      }
    />
  );
}

export default AdminDashboard;
