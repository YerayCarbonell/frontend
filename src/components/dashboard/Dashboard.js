// src/components/dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import './Dashboard.css';
import { axiosInstance } from '../../context/AuthContext';

const Dashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [numOfertas, setNumOfertas] = useState(0);
  const [historialEventos, setHistorialEventos] = useState([]);
  const [proximosEventos, setProximosEventos] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState(0);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState(0);
  const [oportunidadesDisponibles, setOportunidadesDisponibles] = useState(0);

  useEffect(() => {
    document.title = `Dashboard | EscenArte`;

    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    if (isAuthenticated && currentUser && currentUser._id) {
      if (currentUser.role === 'organizer') {
        // Cargar número de ofertas publicadas por el organizador
        axiosInstance.get(`/ofertas?organizer=${currentUser._id}`)
          .then(res => setNumOfertas(res.data.length))
          .catch(err => {
            console.error('Error al contar ofertas:', err);
            setNumOfertas(0);
          });

        // Cargar número de solicitudes recibidas
        axiosInstance.get(`/postulaciones/recibidas/${currentUser._id}`)
          .then(res => setSolicitudesRecibidas(res.data.length))
          .catch(err => {
            console.error('Error al contar solicitudes recibidas:', err);
            setSolicitudesRecibidas(0);
          });

        // Cargar historial de eventos para organizador
        axiosInstance.get('/eventos/historial/organizador')
          .then(res => {
            const eventos = res.data || [];
            const hoy = new Date();

            setHistorialEventos(eventos.filter(e => new Date(e.fechaEvento) < hoy).slice(0, 3));
            setProximosEventos(eventos.filter(e => new Date(e.fechaEvento) >= hoy).slice(0, 3));
          })
          .catch(err => {
            console.error('Error al obtener historial:', err);
          });
      }

      if (currentUser.role === 'musician') {
        // Cargar solicitudes enviadas por el músico
        axiosInstance.get(`/postulaciones/usuario/${currentUser._id}`)
          .then(res => setSolicitudesEnviadas(res.data.length))
          .catch(err => {
            console.error('Error al contar solicitudes enviadas:', err);
            setSolicitudesEnviadas(0);
          });

        // Cargar oportunidades disponibles para el músico
        axiosInstance.get('/ofertas/recomendadas')
          .then(res => setOportunidadesDisponibles(res.data.length))
          .catch(err => {
            console.error('Error al contar oportunidades:', err);
            setOportunidadesDisponibles(24); // Valor por defecto para demostración
          });

        // Cargar historial de eventos para músico
        axiosInstance.get('/eventos/historial/musico')
          .then(res => {
            const eventos = res.data || [];
            const hoy = new Date();

            setHistorialEventos(eventos.filter(e => new Date(e.fechaEvento) < hoy).slice(0, 3));
            setProximosEventos(eventos.filter(e => new Date(e.fechaEvento) >= hoy).slice(0, 3));
          })
          .catch(err => {
            console.error('Error al obtener historial:', err);
          });
      }
    }

    return () => clearTimeout(loadTimeout);
  }, [currentUser, isAuthenticated]);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" />;
  }

  const renderMusicianDashboard = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bienvenido a tu dashboard, {currentUser.name || 'Músico'}</h1>
        <div className="action-buttons">
          <Link to="/profile" className="btn btn-primary">Ver mi perfil</Link>
          <Link to="/historial" className="btn btn-secondary">Mi historial</Link>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <Link to="/ofertas" className="stat-card-link">
          <div className="stat-card">
            <h3>Oportunidades disponibles</h3>
            <div className="stat-number">{oportunidadesDisponibles}</div>
            <p>Nuevas ofertas que coinciden con tu perfil</p>
          </div>
        </Link>
        
        <Link to="/mis-postulaciones" className="stat-card-link">
          <div className="stat-card">
            <h3>Solicitudes enviadas</h3>
            <div className="stat-number">{solicitudesEnviadas}</div>
            <p>Postulaciones activas en este momento</p>
          </div>
        </Link>
        
        <Link to="/historial" className="stat-card-link">
          <div className="stat-card">
            <h3>Eventos confirmados</h3>
            <div className="stat-number">{proximosEventos.length}</div>
            <p>Próximas actuaciones programadas</p>
          </div>
        </Link>
      </div>

      {/* Próximos eventos */}
      {proximosEventos.length > 0 && (
        <div className="dashboard-section">
          <h2>Próximos eventos</h2>
          <div className="eventos-grid">
            {proximosEventos.map(evento => (
              <div key={evento._id} className="evento-card">
                <h3 className="evento-titulo">{evento.titulo}</h3>
                <p className="evento-fecha"><span className="label">Fecha:</span> {formatearFecha(evento.fechaEvento)}</p>
                <p className="evento-ubicacion"><span className="label">Ubicación:</span> {evento.ubicacion || 'No especificada'}</p>
                <div className="evento-actions">
                  <button 
                    onClick={() => navigate(`/mensajes/${evento.organizador?._id}`)}
                    className="btn btn-primary"
                  >
                    Contactar organizador
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="ver-mas">
            <Link to="/historial" className="btn btn-secondary">Ver todos los eventos</Link>
          </div>
        </div>
      )}

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
            <Link to="/ofertas" className="btn btn-primary">Ver detalles</Link>
          </div>
          <div className="opportunity-card">
            <h3>Banda para evento corporativo</h3>
            <p>Empresa multinacional busca banda de versiones</p>
            <div className="opportunity-details">
              <span>Barcelona</span>
              <span>€500-700</span>
              <span>Pop/Rock</span>
            </div>
            <Link to="/ofertas" className="btn btn-primary">Ver detalles</Link>
          </div>
        </div>
        <div className="ver-mas">
          <Link to="/ofertas" className="btn btn-secondary">Ver todas las ofertas</Link>
        </div>
      </div>
      
      {/* Historial de eventos recientes */}
      {historialEventos.length > 0 && (
        <div className="dashboard-section">
          <h2>Historial de eventos recientes</h2>
          <div className="eventos-grid">
            {historialEventos.map(evento => (
              <div key={evento._id} className="evento-card">
                <h3 className="evento-titulo">{evento.titulo}</h3>
                <p className="evento-fecha"><span className="label">Fecha:</span> {formatearFecha(evento.fechaEvento)}</p>
                <p className="evento-ubicacion"><span className="label">Ubicación:</span> {evento.ubicacion || 'No especificada'}</p>
                <div className="evento-actions">
                  {!evento.calificado && (
                    <Link to="/historial" className="btn btn-secondary">Calificar evento</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="ver-mas">
            <Link to="/historial" className="btn btn-secondary">Ver historial completo</Link>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrganizerDashboard = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bienvenido a tu dashboard, {currentUser.name || 'Organizador'}</h1>
        <div className="action-buttons">
          <Link to="/profile" className="btn btn-primary">Ver mi perfil</Link>
          <Link to="/crear-oferta" className="btn btn-primary">Crear nueva oferta</Link>
          <Link to="/historial" className="btn btn-secondary">Mi historial</Link>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <Link to="/mis-ofertas" className="stat-card-link">
          <div className="stat-card">
            <h3>Ofertas publicadas</h3>
            <div className="stat-number">{numOfertas}</div>
            <p>Oportunidades que has creado</p>
          </div>
        </Link>
        
        <Link to="/mis-ofertas" className="stat-card-link">
          <div className="stat-card">
            <h3>Solicitudes recibidas</h3>
            <div className="stat-number">{solicitudesRecibidas}</div>
            <p>Músicos interesados en tus ofertas</p>
          </div>
        </Link>
        
        <Link to="/historial" className="stat-card-link">
          <div className="stat-card">
            <h3>Eventos programados</h3>
            <div className="stat-number">{proximosEventos.length}</div>
            <p>Actuaciones confirmadas</p>
          </div>
        </Link>
      </div>

      {/* Próximos eventos */}
      {proximosEventos.length > 0 && (
        <div className="dashboard-section">
          <h2>Próximos eventos</h2>
          <div className="eventos-grid">
            {proximosEventos.map(evento => (
              <div key={evento._id} className="evento-card">
                <h3 className="evento-titulo">{evento.titulo}</h3>
                <p className="evento-fecha"><span className="label">Fecha:</span> {formatearFecha(evento.fechaEvento)}</p>
                <p className="evento-ubicacion"><span className="label">Ubicación:</span> {evento.ubicacion || 'No especificada'}</p>
                <div className="evento-participantes">
                  <h4>Músicos confirmados: {evento.musicos?.length || 0}</h4>
                </div>
                <div className="evento-actions">
                  <Link to={`/historial`} className="btn btn-primary">Ver detalles</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="ver-mas">
            <Link to="/historial" className="btn btn-secondary">Ver todos los eventos</Link>
          </div>
        </div>
      )}

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
            <Link to="/musicos" className="btn btn-primary">Ver perfil</Link>
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
            <Link to="/musicos" className="btn btn-primary">Ver perfil</Link>
          </div>
        </div>
        <div className="ver-mas">
          <Link to="/musicos" className="btn btn-secondary">Ver todos los músicos</Link>
        </div>
      </div>
      
      {/* Historial de eventos recientes */}
      {historialEventos.length > 0 && (
        <div className="dashboard-section">
          <h2>Eventos pasados recientes</h2>
          <div className="eventos-grid">
            {historialEventos.map(evento => (
              <div key={evento._id} className="evento-card">
                <h3 className="evento-titulo">{evento.titulo}</h3>
                <p className="evento-fecha"><span className="label">Fecha:</span> {formatearFecha(evento.fechaEvento)}</p>
                <p className="evento-ubicacion"><span className="label">Ubicación:</span> {evento.ubicacion || 'No especificada'}</p>
                <div className="evento-participantes">
                  <h4>Músicos participantes: {evento.musicos?.length || 0}</h4>
                </div>
                <div className="evento-actions">
                  <Link to={`/historial`} className="btn btn-primary">Ver detalles</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="ver-mas">
            <Link to="/historial" className="btn btn-secondary">Ver historial completo</Link>
          </div>
        </div>
      )}
    </div>
  );

  // Mostrar el dashboard según el rol del usuario
  return (
    <div className="full-window">
      <Navbar />
      <div className="main-content-padding">
        {!currentUser.role || currentUser.role === 'musician' 
          ? renderMusicianDashboard() 
          : renderOrganizerDashboard()
        }
      </div>
    </div>
  );
};

export default Dashboard;