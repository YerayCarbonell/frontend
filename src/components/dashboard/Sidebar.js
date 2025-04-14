// src/components/dashboard/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Sidebar = ({ isOpen, user }) => {
  const location = useLocation();
  const { role } = user;
  
  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <h1>EscenArte</h1>
        </Link>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">
          <img src="/images/default-avatar.jpg" alt={user.name} />
        </div>
        <div className="user-info">
          <h3>{user.name}</h3>
          <p>{role === 'musician' ? 'Músico' : 'Organizador'}</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('profile')}>
            <Link to="/dashboard/profile">
              <i className="fas fa-user"></i>
              <span>Mi Perfil</span>
            </Link>
          </li>
          
          {role === 'organizer' ? (
            <li className={isActive('create-offer')}>
              <Link to="/dashboard/create-offer">
                <i className="fas fa-plus-circle"></i>
                <span>Crear Oferta</span>
              </Link>
            </li>
          ) : null}
          
          <li className={isActive('offers')}>
            <Link to="/dashboard/offers">
              <i className="fas fa-briefcase"></i>
              <span>{role === 'musician' ? 'Explorar Ofertas' : 'Mis Ofertas'}</span>
            </Link>
          </li>
          
          {role === 'musician' ? (
            <li className={isActive('applications')}>
              <Link to="/dashboard/applications">
                <i className="fas fa-file-alt"></i>
                <span>Mis Postulaciones</span>
              </Link>
            </li>
          ) : (
            <li className={isActive('applications')}>
              <Link to="/dashboard/applications">
                <i className="fas fa-users"></i>
                <span>Candidatos</span>
              </Link>
            </li>
          )}
          
          <li className={isActive('messages')}>
            <Link to="/dashboard/messages">
              <i className="fas fa-envelope"></i>
              <span>Mensajes</span>
            </Link>
          </li>
          
          <li className={isActive('settings')}>
            <Link to="/dashboard/settings">
              <i className="fas fa-cog"></i>
              <span>Configuración</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <Link to="/logout" className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;