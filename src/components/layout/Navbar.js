// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <h1>MúsicaConnect</h1>
        </div>
        <nav className="nav">
          <ul>
            <li><Link to="/">Inicio</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/ofertas">Ofertas</Link></li>
                {currentUser.role === 'musico' && (
                  <li><Link to="/mis-postulaciones">Mis Postulaciones</Link></li>
                )}
                {currentUser.role === 'organizador' && (
                  <li><Link to="/mis-ofertas">Mis Ofertas</Link></li>
                )}
                <li>
                <div className="dropdown">
                  <button className="dropdown-btn">Hola, {currentUser.name} ▼</button>
                  <div className="dropdown-content">
                    <Link to="/profile">Mi Perfil</Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Cerrar Sesión</a>
                  </div>
                </div>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="btn btn-secondary">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="btn btn-primary">Registrarse</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;