// src/components/ofertas/PostulacionesList.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Ofertas.css';

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
    if (currentUser?.role !== 'organizador') {
      navigate('/ofertas');
      return;
    }
    
    const fetchPostulaciones = async () => {
      try {
        // Primero obtener los detalles de la oferta
        const ofertaRes = await axios.get(`http://localhost:5000/api/ofertas/${id}`);
        setOferta(ofertaRes.data);
        
        // Verificar que el usuario actual sea el organizador de esta oferta
        if (ofertaRes.data.organizador._id !== currentUser._id) {
          navigate('/ofertas');
          return;
        }
        
        // Obtener las postulaciones para esta oferta
        const postulacionesRes = await axios.get(`http://localhost:5000/api/ofertas/${id}/postulaciones`);
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

  // Aceptar una postulación
  const handleAceptar = async (postulacionId) => {
    try {
      setLoading(true);
      await axios.post(`http://localhost:5000/api/ofertas/${id}/postulaciones/${postulacionId}/aceptar`);
      
      // Actualizar el estado de las postulaciones
      const postulacionesRes = await axios.get(`http://localhost:5000/api/ofertas/${id}/postulaciones`);
      setPostulaciones(postulacionesRes.data);
      
      setSuccess('Postulación aceptada correctamente.');
      setTimeout(() => setSuccess(''), 3000);
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
      await axios.post(`http://localhost:5000/api/ofertas/${id}/postulaciones/${postulacionId}/rechazar`);
      
      // Actualizar el estado de las postulaciones
      const postulacionesRes = await axios.get(`http://localhost:5000/api/ofertas/${id}/postulaciones`);
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
    return <div className="loading">Cargando postulaciones...</div>;
  }

  if (error && !oferta) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <Link to="/ofertas" className="btn btn-primary">
          Volver a ofertas
        </Link>
      </div>
    );
  }

  return (
    <div className="postulaciones-container">
      <div className="postulaciones-header">
        <h1>Postulaciones para "{oferta?.titulo}"</h1>
        <div className="postulaciones-actions">
          <Link to={`/ofertas/${id}`} className="btn btn-secondary">
            Volver a detalles de la oferta
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
                <h3>{postulacion.musico?.name || 'Usuario'}</h3>
                
                <p className="postulacion-fecha">
                  <span className="label">Fecha de postulación:</span> {formatearFecha(postulacion.fechaPostulacion)}
                </p>
                
                {postulacion.musico?.profile && (
                  <>
                    <p className="postulacion-instrumento">
                      <span className="label">Instrumento principal:</span> {postulacion.musico.profile.instrumento || 'No especificado'}
                    </p>
                    <p className="postulacion-estilo">
                      <span className="label">Estilo musical:</span> {postulacion.musico.profile.estiloMusical || 'No especificado'}
                    </p>
                    <p className="postulacion-experiencia">
                      <span className="label">Experiencia:</span> {postulacion.musico.profile.experiencia || 'No especificada'}
                    </p>
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
                  <span className={`estado-badge estado-${postulacion.estado.toLowerCase()}`}>
                    {postulacion.estado === 'PENDIENTE' ? 'Pendiente' : 
                     postulacion.estado === 'ACEPTADA' ? 'Aceptada' : 'Rechazada'}
                  </span>
                </p>
              </div>
              
              <div className="postulacion-actions">
                <Link to={`/perfil/${postulacion.musico?._id}`} className="btn btn-secondary">
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
                  <Link to={`/mensajes/${postulacion.musico?._id}`} className="btn btn-primary">
                    Contactar
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostulacionesList;