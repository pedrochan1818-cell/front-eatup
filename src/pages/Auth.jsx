import React, { useState } from 'react';
import Login from './Login';
import Signup from './SignUp';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Controla si mostramos el login o el signup

  const toggleAuth = () => {
    setIsLogin(!isLogin); // Alterna entre login y signup
  };

  return (
    <div className="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>



      {/* Contenido Principal */}
      <div className="container-fluid" style={{ flex: 1, padding: '20px' }}>
        
        {/* Sección de Título */}
        <section className="content-header">
          <div className="container">
            <div className="row mb-3">
              <div className="col-sm-6">
                <h2 className="float-left">{isLogin ? 'Login' : 'Signup'}</h2>
              </div>
              <div className="col-sm-6 text-right">
                <button className="btn btn-link" onClick={toggleAuth}>
                  {isLogin ? 'No tienes cuenta? Regístrate' : 'Ya tienes cuenta? Inicia sesión'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contenido Dinámico */}
        <section className="container">
          <div className="card">
            <div className="card-body">
              {isLogin ? <Login /> : <Signup />}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="main-footer" style={{ position: 'absolute', bottom: '0', width: '100%', background: '#f1f1f1' }}>
          <div className="float-right d-none d-sm-block">
            <strong>
              Copyright &copy; 2023-2024{' '}
              <a href="/" target="_blank" rel="noopener noreferrer">
                Universidad Tecnológica Metropolitana
              </a>. Plataforma Restaurante
            </strong>
            <b> Version</b> 1.0
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Auth;
