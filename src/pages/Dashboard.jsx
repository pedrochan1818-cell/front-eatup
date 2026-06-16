import { useState, useEffect } from "react";
import Master from "../components/Master";
import api from '../api/client';

function Dashboard() {
  const [dashboardMesa, setDashboardMesa] = useState("");

  // Obtener URL del dashboard de mesas
  useEffect(() => {
    const fetchDashboardMesa = async () => {
      try {
        const res = await api.get("api/metabase/mesa");
        setDashboardMesa(res.data.url);
      } catch (error) {
        console.error("Error al obtener dashboard de Metabase", error);
      }
    };
    fetchDashboardMesa();
  }, []);

  return (
    <Master
      titulo={<h1><strong>Dashboard</strong></h1>}
      contenido={
        <div className="container py-4" style={{ backgroundColor: "#f8f9fa" }}>
          {dashboardMesa ? (
           <iframe
           src="http://localhost:3000/public/dashboard/81a39105-2e55-4266-b0a6-090a5a31b88b"
           frameborder="0"
           width="100%"
           height="800"
           title="mesas"
           allowtransparency
       ></iframe>
          ) : (
            <p className="text-center text-muted">Cargando dashboard de mesas...</p>
          )}
        </div>
      }
    />
  );
}

export default Dashboard;
