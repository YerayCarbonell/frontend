// src/pages/MisPostulaciones.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

const MisPostulaciones = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated || !currentUser) {
      navigate('/login');
      return;
    }
    
    // Verificar que el usuario sea músico
    if (currentUser.role !== 'musician') {
      navigate('/');
      return;
    }
    
    const fetchMisPostulaciones = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/postulaciones/usuario/${currentUser._id}`);
        const ordenadas = res.data.sort((a, b) => new Date(b.fechaPostulacion) - new Date(a.fechaPostulacion));
        setPostulaciones(ordenadas);

        setError('');
      } catch (err) {
        console.error(err);
        setError('Error al cargar tus postulaciones. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMisPostulaciones();
  }, [currentUser, isAuthenticated, navigate]);

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
        return { class: '', text: estado || 'Pendiente' };
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Cargando tus postulaciones...</div>
      </div>
    );
  }

  return (
    <div className="full-window">
    <Navbar />
    <div className="main-content-padding">
      <div className="ofertas-container">
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
                      <span className="label">Organizador:</span> {postulacion.oferta?.organizer?.name || 'No disponible'}
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
                    
                    {postulacion.estado === 'ACEPTADA' && postulacion.oferta?.organizer?._id && (
                      <Link
                        to={`/mensajes/${postulacion.oferta.organizer._id}`}
                        className="btn btn-primary"
                      >
                        Contactar organizador
                      </Link>
                    )}


                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </div>

  );
};

export default MisPostulaciones;