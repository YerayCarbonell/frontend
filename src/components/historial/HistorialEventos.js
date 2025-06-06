// src/components/historial/HistorialEventos.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import './Historial.css';
import { axiosInstance } from '../../context/AuthContext';



const HistorialEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('proximos');
  const [calificandoEvento, setCalificandoEvento] = useState(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [valorandoUsuario, setValorandoUsuario] = useState(null);
  const [valoracionCalificacion, setValoracionCalificacion] = useState(0);
  const [valoracionComentario, setValoracionComentario] = useState('');
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
          url = `/eventos/historial/organizador`;
        } else {
          url = `/eventos/historial/musico`;
        }
        
        const res = await axiosInstance.get(url);
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
  const valorarUsuario = async (eventoId, usuarioId) => {
    try {
      await axiosInstance.post(`/ratings`, {
        ofertaId: eventoId, // Antes: ofertaId (que no estaba definido)
        evaluadoId: usuarioId,
        calificacion: valoracionCalificacion,
        comentario: valoracionComentario
      });
      
      // Recargar los datos
      let url;
      if (currentUser.role === 'organizer') {
        url = `/eventos/historial/organizador`;
      } else {
        url = `/eventos/historial/musico`;
      }
      const res = await axiosInstance.get(url);
      setEventos(res.data);
      
      // Resetear el estado
      setValorandoUsuario(null);
      setValoracionCalificacion(0);
      setValoracionComentario('');
      
      alert('¡Gracias por tu valoración!');
    } catch (err) {
      console.error(err);
      alert('Error al enviar la valoración: ' + (err.response?.data?.msg || err.message));
    }
  };
  // Calificar un evento (para músicos)
  const calificarEvento = async (eventoId) => {
    try {
      await axiosInstanceInstance.post(`/eventos/${eventoId}/calificar`, {
        calificacion,
        comentario
      });
      
      // Recargar los datos
      const url = `/eventos/historial/musico`;
      const res = await axiosInstanceInstance.get(url);
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
                                  <Link to={`/perfil/${musico._id}`}>
                                    <span>{musico.name}</span>
                                  </Link>
                                  <div className="acciones-musico">
                                    <button 
                                      onClick={() => navigate(`/mensajes/${musico._id}`)}
                                      className="btn btn-small"
                                    >
                                      Contactar
                                    </button>
                                    
                                    {activeTab === 'pasados' && (
                                      <button 
                                        className="btn btn-small btn-valorar"
                                        onClick={() => setValorandoUsuario({ id: musico._id, evento: evento._id, nombre: musico.name })}
                                      >
                                        Valorar
                                      </button>
                                    )}
                                  </div>
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
                            <span className="label">Organizador:</span> 
                            <Link to={`/perfil/${evento.organizador?._id}`}>
                              {evento.organizador?.name || 'No disponible'}
                            </Link>
                          </p>
                          {activeTab === 'pasados' && (
                            <button 
                              className="btn btn-secondary" 
                              onClick={() => setValorandoUsuario({ 
                                id: evento.organizador?._id, 
                                evento: evento._id, 
                                nombre: evento.organizador?.name 
                              })}
                            >
                              Valorar Organizador
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {valorandoUsuario && (
            <div className="modal-valoracion">
              <div className="modal-content">
                <h3>Valorar a {valorandoUsuario.nombre}</h3>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      className={`star-btn ${star <= valoracionCalificacion ? 'active' : ''}`}
                      onClick={() => setValoracionCalificacion(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  className="comentario-textarea"
                  placeholder="Escribe un comentario (opcional)..."
                  value={valoracionComentario}
                  onChange={(e) => setValoracionComentario(e.target.value)}
                />
                <div className="modal-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={() => valorarUsuario(valorandoUsuario.evento, valorandoUsuario.id)}
                    disabled={valoracionCalificacion === 0}
                  >
                    Enviar valoración
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setValorandoUsuario(null);
                      setValoracionCalificacion(0);
                      setValoracionComentario('');
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialEventos;
