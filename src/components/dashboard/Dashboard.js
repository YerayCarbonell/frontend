// src/components/dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Here you could load user data or any other necessary information
    document.title = `Dashboard | MúsicaConnect`;
    
    // Simulate a loading state while checking authentication
    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(loadTimeout);
  }, []);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" />;
  }

  const renderMusicianDashboard = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bienvenido a tu dashboard, {currentUser.name || 'Músico'}</h1>
        <Link to="/profile" className="btn btn-primary">Ver mi perfil</Link>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Oportunidades disponibles</h3>
          <div className="stat-number">24</div>
          <p>Nuevas ofertas que coinciden con tu perfil</p>
        </div>
        <div className="stat-card">
          <h3>Solicitudes enviadas</h3>
          <div className="stat-number">7</div>
          <p>Postulaciones activas en este momento</p>
        </div>
        <div className="stat-card">
          <h3>Eventos confirmados</h3>
          <div className="stat-number">3</div>
          <p>Próximas actuaciones programadas</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Oportunidades recomendadas</h2>
        <div className="opportunity-list">
          <div className="opportunity-card">
            <h3>Música en vivo para restaurante</h3>
            <p>Restaurante El Mirador busca solista o dúo para fin de semana</p>
            <div className="opportunity-details">
              <span>Madrid</span>
              <span>€150-200</span>
              <span>Acústico</span>
            </div>
            <button className="btn btn-primary">Ver detalles</button>
          </div>
          <div className="opportunity-card">
            <h3>Banda para evento corporativo</h3>
            <p>Empresa multinacional busca banda de versiones</p>
            <div className="opportunity-details">
              <span>Barcelona</span>
              <span>€500-700</span>
              <span>Pop/Rock</span>
            </div>
            <button className="btn btn-primary">Ver detalles</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrganizerDashboard = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bienvenido a tu dashboard, {currentUser.name || 'Organizador'}</h1>
        <Link to="/profile" className="btn btn-primary">Ver mi perfil</Link>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Ofertas publicadas</h3>
          <div className="stat-number">3</div>
          <p>Oportunidades que has creado</p>
        </div>
        <div className="stat-card">
          <h3>Solicitudes recibidas</h3>
          <div className="stat-number">12</div>
          <p>Músicos interesados en tus ofertas</p>
        </div>
        <div className="stat-card">
          <h3>Eventos confirmados</h3>
          <div className="stat-number">1</div>
          <p>Actuaciones programadas</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Músicos recomendados</h2>
        <div className="musician-list">
          <div className="musician-card">
            <div className="musician-avatar">
              <img src="/api/placeholder/80/80" alt="Músico" />
            </div>
            <div className="musician-info">
              <h3>Carlos Martínez</h3>
              <p>Guitarrista y cantante</p>
              <div className="musician-tags">
                <span>Pop/Rock</span>
                <span>Acústico</span>
                <span>7 años exp.</span>
              </div>
            </div>
            <button className="btn btn-primary">Ver perfil</button>
          </div>
          <div className="musician-card">
            <div className="musician-avatar">
              <img src="/api/placeholder/80/80" alt="Músico" />
            </div>
            <div className="musician-info">
              <h3>Laura Sánchez</h3>
              <p>Pianista y compositora</p>
              <div className="musician-tags">
                <span>Jazz</span>
                <span>Clásica</span>
                <span>10 años exp.</span>
              </div>
            </div>
            <button className="btn btn-primary">Ver perfil</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Determine which dashboard to render based on user role
  // Default to musician dashboard if role is missing/undefined
  return (
    <div>
      <Navbar />
      <div className="main-content">
        {!currentUser.role || currentUser.role === 'musician' 
          ? renderMusicianDashboard() 
          : renderOrganizerDashboard()
        }
      </div>
    </div>
  );
};

export default Dashboard;