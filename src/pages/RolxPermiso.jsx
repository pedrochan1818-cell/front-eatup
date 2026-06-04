import { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from "react-toastify";
import '../assets/css/rolxpermiso.css'; // 👈 importa el CSS

function RolxPermiso({ idrol, onClose, fetchRoles }) {
  const [permisos, setPermisos] = useState([]);
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!idrol) return;
  
    const fetchPermisos = async () => {
      try {
        const response = await api.get(`api/roles/${idrol}/permisos?${Date.now()}`);
        setPermisos(response.data.permisos || []);
        const permisosAsignados = (response.data.permisos || [])
          .filter((p) => p.asignada)
          .map((p) => p.idpermiso);
        setSelectedPermisos(permisosAsignados);
      } catch (err) {
        setError('Error al obtener los permisos');
        console.error(err);
      }
    };
  
    fetchPermisos();
  }, [idrol]);
  

  const handleSelectPermission = (e) => {
    const { value, checked } = e.target;
    const permisoId = parseInt(value);
    setSelectedPermisos((prev) =>
      checked ? [...prev, permisoId] : prev.filter((id) => id !== permisoId)
    );
  };

  const handleSavePermissions = async () => {
    try {
      await api.post('api/roles/guardar-permisos', {
        idrol,
        idpermiso: selectedPermisos,
      });
      toast.success("Permisos asignados correctamente");
      fetchRoles();
      onClose();
    } catch {
      setError('Error al guardar los permisos');
    }
  };

  return (
    <div className="rolxpermiso-container">
      <h2>Asignar Permisos</h2>
      {error && <div className="alert alert-danger">{error}</div>}
  
      <form>
        <div className="permisos-lista">
          {permisos.map((permiso) => (
            <div className="permiso-item" key={permiso.idpermiso}>
              <input
                type="checkbox"
                id={`permiso-${permiso.idpermiso}`}
                value={permiso.idpermiso}
                checked={selectedPermisos.includes(permiso.idpermiso)}
                onChange={handleSelectPermission}
              />
              <label htmlFor={`permiso-${permiso.idpermiso}`}>
                {permiso.nompermiso}
              </label>
            </div>
          ))}
        </div>
  
        <button type="button" onClick={handleSavePermissions}>
          Guardar Permisos
        </button>
      </form>
    </div>
  );
  
}

export default RolxPermiso;
