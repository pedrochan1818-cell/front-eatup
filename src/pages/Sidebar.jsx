import { useState, useEffect } from "react";
import { FaBars, FaHome, FaUser, FaSignOutAlt } from "react-icons/fa";
import "../assets/css/sidebar.css";
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </div>

      <div className="sidebar-content">
        <div className="time">{time.toLocaleTimeString()}</div>
        <nav>
          <ul>
            <li><FaHome /> {!collapsed && "Home"}</li>
            <li><FaUser /> {!collapsed && "Perfil"}</li>
            <li><FaSignOutAlt /> {!collapsed && "Logout"}</li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
