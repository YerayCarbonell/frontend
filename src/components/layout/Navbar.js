// src/components/layout/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

import './Navbar.css';
const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const dropdownRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(prev => !prev);

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };
  const scrollToSection = (sectionId, e) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
  
      window.history.pushState(null, '', `/#${sectionId}`);
    }
  };
  

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
    <div className="container navbar-container">
    <div className="logo">
      <Link to="/">
        <h1><span className="special">Escen</span><span className="highlight">Arte</span></h1>
      </Link>
    </div>

      <button className="menu-toggle" onClick={toggleMenu}>
        <span className="hamburger"></span>
      </button>
      <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/ofertas">Ofertas</Link></li>
                {currentUser.role === 'musician' && (
                  <>
                    <li><Link to="/mis-postulaciones">Mis Postulaciones</Link></li>
                    <li><Link to="/mensajes">Mis mensajes</Link></li>

                  </>
                )}
                {currentUser.role === 'organizer' && (
                  <>
                    <li><Link to="/mis-ofertas">Mis Ofertas</Link></li>
                    <li><Link to="/historial">Mi Historial</Link></li>

                  </>
                )}
               <li className="dropdown" ref={dropdownRef}>
                  <button onClick={toggleDropdown} className="dropdown-btn">
                    Hola, {currentUser.name} <span>▼</span>
                  </button>
                  {dropdownOpen && (
                    <div className="dropdown-content">
                      <Link to="/profile">Mi Perfil</Link>
                      <Link to="/historial">Historial de Eventos</Link>
                      
                      <button onClick={logout}>Cerrar Sesión</button>
                    </div>
                  )}
                </li>

              </>
            ) : isLanding ? (
              <>
                <li><a href="#como-funciona" onClick={(e) => scrollToSection('como-funciona', e)}>Cómo Funciona</a></li>
                <li><a href="#beneficios" onClick={(e) => scrollToSection('beneficios', e)}>Beneficios</a></li>
                <li><a href="#testimonios" onClick={(e) => scrollToSection('testimonios', e)}>Testimonios</a></li>
                <li><Link to="/login" className="btn btn-secondary">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="btn btn-primary" style={{ color: 'white' }}>Únete Gratis</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="btn btn-secondary">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="btn btn-primary" style={{ color }}>Únete Gratis</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );};
export default Navbar;