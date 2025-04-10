// src/components/dashboard/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Header = ({ toggleSidebar, user }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h2>Panel de {user.role === 'musician' ? 'Músico' : 'Organizador'}</h2>
      </div>
      
      <div className="header-right">
        <div className="header-buttons">
          {user.role === 'musician' ? (
            <Link to="/dashboard/offers" className="btn btn-sm btn-primary">
              <i className="fas fa-search"></i> Buscar Ofertas
            </Link>
          ) : (
            <Link to="/dashboard/create-offer" className="btn btn-sm btn-primary">
              <i className="fas fa-plus"></i> Nueva Oferta
            </Link>
          )}
        </div>
        
        <div className="notification-icon">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </div>
        
        <div className="user-dropdown">
          <img src="/images/default-avatar.jpg" alt={user.name} className="user-avatar" />
          <div className="dropdown-content">
            <Link to="/dashboard/profile">Mi Perfil</Link>
            <Link to="/dashboard/settings">Configuración</Link>
            <hr />
            <Link to="/logout">Cerrar Sesión</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;