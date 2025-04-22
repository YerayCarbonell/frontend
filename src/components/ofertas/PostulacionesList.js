// src/components/ofertas/PostulacionesList.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Ofertas.css';
import Navbar from '../layout/Navbar';
import { axiosInstance } from '../../context/AuthContext';

const PostulacionesList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [oferta, setOferta] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar autenticación y cargar postulaciones
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Verificar que el usuario sea organizador
    if (currentUser?.role !== 'organizer') {
      navigate('/ofertas');
      return;
    }
    
    const fetchPostulaciones = async () => {
      try {
        // Primero obtener los detalles de la oferta
        const ofertaRes = await axiosInstance.get(`/ofertas/${id}`);
        setOferta(ofertaRes.data);
        
        // Verificar que el usuario actual sea el organizador de esta oferta
        // Comprobamos si organizer es un objeto o un ID string
        const organizerId = typeof ofertaRes.data.organizer === 'object' 
          ? ofertaRes.data.organizer._id 
          : ofertaRes.data.organizer;
        
        if (organizerId !== currentUser._id) {
          navigate('/ofertas');
          return;
        }
        
        // Obtener las postulaciones para esta oferta
        const postulacionesRes = await axiosInstance.get(`/ofertas/${id}/postulaciones`);
        setPostulaciones(postulacionesRes.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las postulaciones.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostulaciones();
  }, [id, isAuthenticated, currentUser, navigate]);

  const handleAceptar = async (postulacionId) => {
    try {
      setLoading(true);
      
      // Preguntamos al usuario si desea cerrar la oferta
      const cerrarOferta = window.confirm('¿Deseas cerrar esta oferta después de aceptar la postulación? ' +
        'Si la cierras, no recibirás más postulaciones.');
      
      // Llamar a la API con el parámetro adicional
      await axiosInstance.post(`/ofertas/${id}/postulaciones/${postulacionId}/aceptar`, {
        cerrarOferta
      });
      
      // Actualizar el estado de las postulaciones
      const postulacionesRes = await axiosInstance.get(`/ofertas/${id}/postulaciones`);
      setPostulaciones(postulacionesRes.data);
      
      // Actualizar la información de la oferta
      const ofertaRes = await axiosInstance.get(`/ofertas/${id}`);
      setOferta(ofertaRes.data);
      
      // Enviar mensaje automático al músico (obtenemos la info del músico de las postulaciones actualizadas)
      const musicoPostulacion = postulacionesRes.data.find(p => p._id === postulacionId)?.musician;
      
      if (musicoPostulacion && typeof musicoPostulacion === 'object' && musicoPostulacion._id) {
        try {
          // Verificamos que estamos usando la URL correcta según App.js
          await axiosInstance.post(`/chat/mensajes`, {
            receiver: musicoPostulacion._id,
            content: `¡Hola! Tu postulación para "${oferta.titulo}" ha sido aceptada. Puedes usar este chat para coordinar los detalles del evento.`,
            oferta: id  // Incluye la referencia a la oferta
          });
          
          setSuccess('Postulación aceptada y mensaje enviado correctamente.');
        } catch (msgError) {
          console.error('Error al enviar mensaje:', msgError);
          setSuccess('Postulación aceptada correctamente, pero no se pudo enviar el mensaje automático.');
        }
      } else {
        setSuccess('Postulación aceptada correctamente.');
      }
      
      if (cerrarOferta) {
        setSuccess(prevSuccess => prevSuccess + ' La oferta ha sido cerrada.');
      }
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setError('Error al aceptar la postulación.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Rechazar una postulación
  const handleRechazar = async (postulacionId) => {
    try {
      setLoading(true);
      // Intentar ahora usando los endpoints específicos
      await axiosInstance.post(`/ofertas/${id}/postulaciones/${postulacionId}/rechazar`);
      
      // Actualizar el estado de las postulaciones
      const postulacionesRes = await axiosInstance.get(`/ofertas/${id}/postulaciones`);
      setPostulaciones(postulacionesRes.data);
      
      setSuccess('Postulación rechazada correctamente.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error al rechazar la postulación.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Formatear la fecha para mostrarla
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="full-window">
        <Navbar />
        <div className="main-content-padding">
          <div className="loading">Cargando postulaciones...</div>
        </div>
      </div>
    );
  }

  if (error && !oferta) {
    return (
      <div className="full-window">
        <Navbar />
        <div className="main-content-padding">
          <div className="error-container">
            <div className="error-message">{error}</div>
            <Link to="/ofertas" className="btn btn-primary">
              Volver a ofertas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-window">
      <Navbar />
      <div className="main-content-padding">
       <div className="ofertas-container">
        <div className="postulaciones-header">
            <h1>Postulaciones para "{oferta?.titulo}"</h1>
            <div className="postulaciones-actions">
              <Link to={`/ofertas/${id}`} className="btn btn-secondary">
                Volver a detalles de la oferta
              </Link>
              <Link to="/mis-ofertas" className="btn btn-secondary">
                Volver a mis ofertas
              </Link>
            </div>
          </div>
          
          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          
          {postulaciones.length === 0 ? (
            <div className="no-postulaciones">
              <p>Aún no hay postulaciones para esta oferta.</p>
            </div>
          ) : (
            <div className="postulaciones-list">
              {postulaciones.map(postulacion => (
                <div key={postulacion._id} className="postulacion-card">
                  <div className="postulacion-info">
                    <h3>{postulacion.musician?.name || 'Usuario'}</h3>
                    
                    <p className="postulacion-fecha">
                      <span className="label">Fecha de postulación:</span> {formatearFecha(postulacion.fechaPostulacion)}
                    </p>
                    
                    {postulacion.musician?.profile && (
                      <>
                        <p className="postulacion-instrumentos">
                          <span className="label">Instrumentos:</span> {
                            postulacion.musician.profile.instruments?.join(', ') || 'No especificado'
                          }
                        </p>
                        <p className="postulacion-generos">
                          <span className="label">Géneros musicales:</span> {
                            postulacion.musician.profile.genres?.join(', ') || 'No especificado'
                          }
                        </p>
                        <p className="postulacion-experiencia">
                          <span className="label">Experiencia:</span> {
                            postulacion.musician.profile.experience || 'No especificada'
                          }
                        </p>
                        {postulacion.musician.profile.tarifa && (
                        <p className="postulacion-tarifa">
                          <span className="label">Tarifa:</span> {
                            postulacion.musician.profile.tarifa.monto 
                            ? `${postulacion.musician.profile.tarifa.monto}€ ${postulacion.musician.profile.tarifa.descripcion || ''}`
                            : 'No especificada'
                          }
                        </p>
                      )}
                      </>
                    )}
                    
                    {postulacion.motivacion && (
                      <div className="postulacion-motivacion">
                        <h4>Mensaje del músico:</h4>
                        <p>{postulacion.motivacion}</p>
                      </div>
                    )}
                    
                    <p className="postulacion-estado">
                      <span className="label">Estado:</span> 
                      <span className={`estado-badge estado-${postulacion.estado?.toLowerCase() || 'pendiente'}`}>
                        {postulacion.estado === 'PENDIENTE' ? 'Pendiente' : 
                         postulacion.estado === 'ACEPTADA' ? 'Aceptada' : 'Rechazada'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="postulacion-actions">
                    <Link to={`/perfil/${postulacion.musician?._id}`} className="btn btn-secondary">
                      Ver perfil
                    </Link>
                    
                    {postulacion.estado === 'PENDIENTE' && (
                      <>
                        <button 
                          onClick={() => handleAceptar(postulacion._id)} 
                          className="btn btn-success"
                          disabled={loading}
                        >
                          Aceptar
                        </button>
                        <button 
                          onClick={() => handleRechazar(postulacion._id)} 
                          className="btn btn-danger"
                          disabled={loading}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    
                    {postulacion.estado === 'ACEPTADA' && (
                    <>
                      <button className="btn btn-primary" onClick={() => navigate(`/mensajes/${postulacion.musician?._id}`)}>
                        Contactar
                      </button>
                      {/* Añadir el botón de pago */}
                      <Link 
                        to={`/pagos/${id}/${postulacion._id}`} 
                        className="btn btn-primary btn-pago"
                      >
                        <i className="fas fa-credit-card"></i> Pagar
                      </Link>
                    </>
                  )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostulacionesList;