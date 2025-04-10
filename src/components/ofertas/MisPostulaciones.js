// src/pages/MisPostulaciones.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MisPostulaciones = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMisPostulaciones = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/postulaciones/usuario/${currentUser._id}`);
        setPostulaciones(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Error al cargar tus postulaciones. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMisPostulaciones();
  }, [currentUser._id]);

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

  // Función para obtener la clase y texto del estado
  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return { class: 'estado-pendiente', text: 'Pendiente' };
      case 'ACEPTADA':
        return { class: 'estado-aceptada', text: 'Aceptada' };
      case 'RECHAZADA':
        return { class: 'estado-rechazada', text: 'Rechazada' };
      default:
        return { class: '', text: estado };
    }
  };

  if (loading) {
    return <div className="loading">Cargando tus postulaciones...</div>;
  }

  return (
    <div className="mis-postulaciones-container">
      <div className="mis-postulaciones-header">
        <h1>Mis Postulaciones</h1>
        <Link to="/ofertas" className="btn btn-primary">
          Explorar ofertas
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {postulaciones.length === 0 ? (
        <div className="no-postulaciones">
          <p>Aún no te has postulado a ninguna oferta.</p>
          <Link to="/ofertas" className="btn btn-primary">
            Explorar ofertas disponibles
          </Link>
        </div>
      ) : (
        <div className="postulaciones-list">
          {postulaciones.map(postulacion => {
            const estadoInfo = getEstadoInfo(postulacion.estado);
            return (
              <div key={postulacion._id} className="postulacion-card">
                <div className="postulacion-content">
                  <h3>{postulacion.oferta?.titulo || 'Oferta no disponible'}</h3>
                  
                  <p>
                    <span className="label">Organizador:</span> {postulacion.oferta?.organizador?.name || 'No disponible'}
                  </p>
                  
                  <p>
                    <span className="label">Fecha del evento:</span> {formatearFecha(postulacion.oferta?.fechaEvento)}
                  </p>
                  
                  <p>
                    <span className="label">Postulado el:</span> {formatearFecha(postulacion.fechaPostulacion)}
                  </p>
                  
                  <p>
                    <span className="label">Estado:</span> 
                    <span className={`estado-badge ${estadoInfo.class}`}>
                      {estadoInfo.text}
                    </span>
                  </p>
                  
                  {postulacion.motivacion && (
                    <div className="postulacion-motivacion">
                      <h4>Tu mensaje:</h4>
                      <p>{postulacion.motivacion}</p>
                    </div>
                  )}
                </div>
                
                <div className="postulacion-actions">
                  <Link to={`/ofertas/${postulacion.oferta?._id}`} className="btn btn-secondary">
                    Ver oferta
                  </Link>
                  
                  {postulacion.estado === 'ACEPTADA' && (
                    <Link to={`/mensajes/${postulacion.oferta?.organizador?._id}`} className="btn btn-primary">
                      Contactar organizador
                    </Link>
                  )}
                  
                  {postulacion.estado === 'PENDIENTE' && (
                    <button 
                      onClick={async () => {
                        if (window.confirm('¿Estás seguro de que deseas cancelar esta postulación?')) {
                          try {
                            await axios.delete(`http://localhost:5000/api/postulaciones/${postulacion._id}`);
                            setPostulaciones(prev => prev.filter(p => p._id !== postulacion._id));
                          } catch (err) {
                            console.error(err);
                            alert('Error al cancelar la postulación.');
                          }
                        }
                      }} 
                      className="btn btn-danger"
                    >
                      Cancelar postulación
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisPostulaciones;