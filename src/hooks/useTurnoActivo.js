import { useEffect, useState } from "react";
import api from "../api/client";

function useTurnoActivo(id_empresa) {
  const [activo, setActivo] = useState(false); // true si hay turno activo, false si no

  useEffect(() => {
    if (!id_empresa) return; // no hacer nada si no hay empresa

    const verificarTurno = async () => {
      try {
        const response = await api.post("api/turno/status_dos", { id_empresa });
        const turnos = response.data;
        setActivo(turnos.length > 0); // true si hay 1 o más turnos
      } catch (error) {
        console.error("Error al obtener turno activo:", error);
        setActivo(false); // si hay error, deshabilitamos
      }
    };

    verificarTurno();
    const interval = setInterval(verificarTurno, 5000); // actualiza cada 5s

    return () => clearInterval(interval);
  }, [id_empresa]);

  return activo; // true = habilitado, false = deshabilitado
}

export default useTurnoActivo;
