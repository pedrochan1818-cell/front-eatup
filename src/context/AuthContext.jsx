import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // 🔥 Nuevo estado
  const [users, setUsers] = useState([
    { email: "admin@gmail.com", password: "1234", name: "Admin", birthDate: "1990-01-01", gender: "male" },
    { email: "otis@gmail.com", password: "qwerty", name: "Otis", birthDate: "1995-06-15", gender: "male" }
  ]);

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("currentUser");

    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(storedUser)); // 🔥 Recuperamos el usuario autenticado
    }
  }, []);

  const login = (email, password) => {
    const userFound = users.find(user => user.email === email && user.password === password);

    if (userFound) {
      setIsAuthenticated(true);
      setCurrentUser(userFound); // 🔥 Guardamos el usuario autenticado
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(userFound)); // 🔥 Guardamos en localStorage
      return true;
    } else {
      return false;
    }
  };

  const register = (email, password, userData) => {
    const userExists = users.find(user => user.email === email);

    if (userExists) {
      return false;
    }

    const newUser = { email, password, ...userData };
    setUsers((prevUsers) => [...prevUsers, newUser]);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null); // 🔥 Limpiamos el usuario autenticado
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser"); // 🔥 Eliminamos del localStorage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
