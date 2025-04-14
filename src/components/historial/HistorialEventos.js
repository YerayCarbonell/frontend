// src/components/historial/HistorialEventos.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import './Historial.css';

const HistorialEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('proximos');
  const [calificandoEvento, setCalificandoEvento] = useState(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchHistorial = async () => {
      try {
        let url;
        // Diferentes endpoints según el rol del usuario
        if (currentUser.role === 'organizer') {
          url = `http://localhost:5000/api/eventos/historial/organizador`;
        } else {
          url = `http://localhost:5000/api/eventos/historial/musico`;
        }
        
        const res = await axios.get(url);
        setEventos(res.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar tu historial de eventos.');
      } finally {
        setLoading(false);
      }
    };

    document.title = "Mi Historial de Eventos | EscenArte";
    fetchHistorial();
  }, [currentUser, isAuthenticated, navigate]);

  // Formatear la fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Determinar si un evento es pasado
  const esEventoPasado = (fechaStr) => {
    if (!fechaStr) return false;
    const fechaEvento = new Date(fechaStr);
    const hoy = new Date();
    return fechaEvento < hoy;
  };
  
  // Calificar un evento (para músicos)
  const calificarEvento = async (eventoId) => {
    try {
      await axios.post(`http://localhost:5000/api/eventos/${eventoId}/calificar`, {
        calificacion,
        comentario
      });
      
      // Recargar los datos
      const url = `http://localhost:5000/api/eventos/historial/musico`;
      const res = await axios.get(url);
      setEventos(res.data);
      
      // Resetear el estado
      setCalificandoEvento(null);
      setCalificacion(0);
      setComentario('');
      
      alert('¡Gracias por tu valoración!');
    } catch (err) {
      console.error(err);
      alert('Error al enviar la calificación.');
    }
  };

  const cancelarCalificacion = () => {
    setCalificandoEvento(null);
    setCalificacion(0);
    setComentario('');
  };

  // Filtrar eventos según la pestaña activa
  const eventosFiltrados = eventos.filter(evento => {
    if (activeTab === 'pasados') {
      return esEventoPasado(evento.fechaEvento);
    } else {
      return !esEventoPasado(evento.fechaEvento);
    }
  });

  if (loading) {
    return (
      <div className="full-window">
        <Navbar />
        <div className="main-content-padding">
          <div className="loading">Cargando tu historial...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-window">
      <Navbar />
      <div className="main-content-padding">
        <div className="historial-container">
          <div className="historial-header">
            <h1>Mi Historial de Eventos</h1>
            <div className="header-actions">
              {currentUser.role === 'organizer' && (
                <Link to="/mis-ofertas" className="btn btn-primary">
                  Mis Ofertas Activas
                </Link>
              )}
              {currentUser.role === 'musician' && (
                <Link to="/mis-postulaciones" className="btn btn-primary">
                  Mis Postulaciones
                </Link>
              )}
              <Link to="/dashboard" className="btn btn-secondary">
                Volver al Dashboard
              </Link>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {eventos.length === 0 ? (
            <div className="no-eventos">
              <p>Aún no tienes eventos en tu historial.</p>
              {currentUser.role === 'organizer' ? (
                <Link to="/crear-oferta" className="btn btn-primary">
                  Publicar una oferta
                </Link>
              ) : (
                <Link to="/ofertas" className="btn btn-primary">
                  Buscar ofertas
                </Link>
              )}
            </div>
          ) : (
            <div className="eventos-tabs">
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'proximos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('proximos')}
                >
                  Eventos próximos
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'pasados' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pasados')}
                >
                  Eventos pasados
                </button>
              </div>
              
              {eventosFiltrados.length === 0 ? (
                <div className="no-eventos">
                  <p>No hay eventos {activeTab === 'pasados' ? 'pasados' : 'próximos'} para mostrar.</p>
                </div>
              ) : (
                <div className="eventos-grid">
                  {eventosFiltrados.map(evento => (
                    <div key={evento._id} className="evento-card">
                      <h3 className="evento-titulo">{evento.titulo}</h3>
                      <p className="evento-fecha">
                        <span className="label">Fecha del evento:</span> {formatearFecha(evento.fechaEvento)}
                      </p>
                      <p className="evento-ubicacion">
                        <span className="label">Ubicación:</span> {evento.ubicacion || 'No especificada'}
                      </p>
                      <p className="evento-genero">
                        <span className="label">Género:</span> {evento.genero || 'No especificado'}
                      </p>
                      
                      {currentUser.role === 'organizer' ? (
                        <div className="evento-participantes">
                          <h4>Músicos participantes:</h4>
                          {evento.musicos && evento.musicos.length > 0 ? (
                            <ul>
                              {evento.musicos.map(musico => (
                                <li key={musico._id}>
                                  <span>{musico.name}</span>
                                  <button 
                                    onClick={() => navigate(`/mensajes/${musico._id}`)}
                                    className="btn btn-small"
                                  >
                                    Contactar
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No hay músicos confirmados para este evento.</p>
                          )}
                        </div>
                      ) : (
                        <div className="evento-organizador">
                          <p>
                            <span className="label">Organizador:</span> {evento.organizador?.name || 'No disponible'}
                          </p>
                          {activeTab === 'pasados' && !evento.calificado && calificandoEvento !== evento._id && (
                            <div className="evento-calificar">
                              <button 
                                className="btn btn-secondary" 
                                onClick={() => setCalificandoEvento(evento._id)}
                              >
                                Calificar evento
                              </button>
                            </div>
                          )}
                          
                          {calificandoEvento === evento._id && (
                            <div className="calificacion-form">
                              <h4>Tu valoración:</h4>
                              <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button 
                                    key={star} 
                                    className={`star-btn ${star <= calificacion ? 'active' : ''}`}
                                    onClick={() => setCalificacion(star)}
                                  >                                  ★
                                  </button>
                                ))}
                              </div>
                              <textarea
                                className="comentario-textarea"
                                placeholder="Escribe un comentario opcional..."
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                              />
                              <div className="form-buttons">
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => calificarEvento(evento._id)}
                                >
                                  Enviar calificación
                                </button>
                                <button 
                                  className="btn btn-secondary"
                                  onClick={cancelarCalificacion}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialEventos;
