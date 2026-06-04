import { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    metodoPago: 'tarjeta'
  });

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulación de envío de datos
    try {
      // Aquí iría tu llamada a la API
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ id: Math.random().toString(36).substring(2, 11) })
          });
        }, 1500);
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.id);
        setOrderSuccess(true);
        clearCart();
      }
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="alert alert-success" role="alert">
              <h4 className="alert-heading">¡Compra realizada con éxito!</h4>
              <p>Tu número de pedido es: <strong>{orderId}</strong></p>
              <p>Recibirás un correo de confirmación en <strong>{formData.email}</strong></p>
              <hr />
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="alert alert-warning" role="alert">
              <h4>Tu carrito está vacío</h4>
              <button 
                className="btn btn-primary mt-3"
                onClick={() => navigate('/carta')}
              >
                Ir al menú
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4>Información de envío</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="nombre" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="direccion" className="form-label">Dirección</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="direccion" 
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="ciudad" className="form-label">Ciudad</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="ciudad" 
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="telefono" className="form-label">Teléfono</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="telefono" 
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Método de pago</label>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="metodoPago" 
                      id="tarjeta"
                      value="tarjeta"
                      checked={formData.metodoPago === 'tarjeta'}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="tarjeta">
                      Tarjeta de crédito/débito
                    </label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="metodoPago" 
                      id="efectivo"
                      value="efectivo"
                      checked={formData.metodoPago === 'efectivo'}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="efectivo">
                      Pago en efectivo al recibir
                    </label>
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary w-100 py-2">
                  Confirmar compra
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4>Resumen de tu pedido</h4>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {cart.map(item => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6>{item.nombre}</h6>
                      <small className="text-muted">
                        {item.cantidad} x ${item.precio.toFixed(2)}
                      </small>
                    </div>
                    <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-3">
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Envío:</span>
                  <span>$0.00</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;