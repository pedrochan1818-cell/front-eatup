import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Master from "./components/Master.jsx";
import Rol from "./pages/Rol.jsx";
import RolxPermiso from "./pages/RolxPermiso.jsx";
import Admin from "./pages/Admin.jsx";
import Auth from "./pages/Auth.jsx";
import Perfil from "./pages/Perfil.jsx";
import Products from "./pages/Products.jsx";
import Users from "./pages/Users.jsx";
import SignUp from "./pages/SignUp.jsx";
import History from "./pages/History.jsx";
import Cart from "./pages/Cart.jsx";
import Orden from "./pages/Orden.jsx";
import Navbar from "./components/Navbar.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Payment from "./pages/Payment.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Mapeado from "./pages/Mapeado.jsx";
import Reserva from "./pages/Reserva.jsx";
import Historial from "./pages/Historial.jsx";
import Carta from "./pages/Carta.jsx";
import Pagar from "./pages/Pagar.jsx";
import Control from "./pages/Control.jsx";
import Ordenes from "./pages/Ordenes.jsx";
import Reservas from "./pages/Reservas.jsx";
import MicrosoftLogin from "./pages/MicrosoftLogin.jsx";
import GoogleLogin from "./pages/GoogleLogin.jsx";
import Sidebar from "./pages/Sidebar.jsx";
import PerfilAdmin from "./pages/PerfilAdmin.jsx";
import Empresa from "./pages/Empresa.jsx";
import Horarios from "./pages/Horarios.jsx";
import Turno from "./pages/Turno.jsx";
import Planes from "./pages/Planes.jsx";
import GestionPlanes from "./pages/GestionPlanes.jsx";
import OrdenRepetido from "./pages/OrdenRepetido.jsx";
import CartNueva from "./pages/CartNueva.jsx";
import Pago from "./pages/Pago.jsx";
import Carrito from "./pages/Carrito.jsx";
import CartCarrito from "./pages/CartCarrito.jsx";
import PagoCarrito from "./pages/PagoCarrito.jsx";
import CarritosUsuarios from "./pages/CarritosUsuarios.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

// ✅ Componente que usa useLocation dentro del Router
function AppContent() {
  const location = useLocation();

  // Rutas donde NO quieres que aparezca el Navbar
  const noNavbarRoutes = [
    "/", "/login", "/signup", "/admin", "/mapeado",
    "/users", "/products", "/rol", "/dashboard",
    "/reservas", "/ordenes", "/microsoftLogin","/perfilA",
    "/googleLogin", "/empresa", "/turno","/horario", "/planes", "/gestionPlanes","/pago"
  ];

  // 🔥 Solo hacer dinámico /perfilA para rutas como /perfilA/23
  const hideNavbar =
    noNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/perfilA/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/master" element={<Master />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/rolxPermiso" element={<RolxPermiso />} />
        <Route path="/rol" element={<Rol />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/perfil/:iduser" element={<Perfil />} />
        <Route path="/perfilA/:iduser" element={<PerfilAdmin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/users" element={<Users />} />
        <Route path="/cart/:iduser" element={<Cart />} />
        <Route path="/orden" element={<Orden />} />
        <Route path="/microsoftLogin" element={<MicrosoftLogin />} />
        <Route path="/googleLogin" element={<GoogleLogin />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/empresa" element={<Empresa />} />
        <Route path="/turno" element={<Turno />} />
        <Route path="/horario" element={<Horarios />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/gestionPlanes" element={<GestionPlanes />} />
        <Route path="/ordenar" element={<OrdenRepetido />} />
        <Route path="/carts" element={<CartNueva />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/cartCarrito:iduser" element={<CartCarrito />} />
        <Route path="/pagoCarrito" element={<PagoCarrito />} />
        <Route path="/carritos" element={<CarritosUsuarios />} />

        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/control" element={<Control />} />
        <Route path="/mapeado" element={<Mapeado />} />
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/carta" element={<Carta />} />
        <Route path="/pagar" element={<Pagar />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </>
  );
}

export default App;
