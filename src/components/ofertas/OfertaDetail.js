// src/components/ofertas/OfertaDetail.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Ofertas.css';
import Navbar from '../layout/Navbar';

const OfertaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oferta, setOferta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, isAuthenticated } = useAuth();

  // Cargar los detalles de la oferta
  useEffect(() => {
    const fetchOferta = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/ofertas/${id}`);
        setOferta(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar los detalles de la oferta.');
      } finally {
        setLoading(false);
      }
    };

    fetchOferta();
  }, [id]);

  // Manejar la eliminación de una oferta
  const handleEliminarOferta = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta oferta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Agregar token para autenticación
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };
      
      await axios.delete(`http://localhost:5000/api/ofertas/${id}`, config);
      navigate('/ofertas', { state: { message: 'Oferta eliminada correctamente.' } });
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la oferta. Por favor, inténtalo de nuevo.');
    }
  };

  // Determinar si el usuario actual ya se ha postulado a esta oferta
  const yaPostulado = () => {
    if (!isAuthenticated || !currentUser || currentUser.role !== 'musician' || !oferta) return false;
    
    // Verificar si postulaciones existe y es un array
    if (!oferta.postulaciones || !Array.isArray(oferta.postulaciones)) return false;
    
    return oferta.postulaciones.some(p => {
      // Manejar ambos casos: cuando p.musico es un objeto o un string
      const musicoId = typeof p.musico === 'object' ? p.musico._id : p.musico;
      return musicoId === currentUser._id;
    });
  };

  // Formatear la fecha para mostrarla
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Por determinar';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'Fecha inválida';

    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar si el usuario actual es el organizador de esta oferta
  const esOrganizador = () => {
    if (!isAuthenticated || !currentUser || !oferta || !oferta.organizer) return false;
    
    // Verificar si organizador es un objeto o un string
    const organizadorId = typeof oferta.organizer === 'object' 
      ? oferta.organizer._id 
      : oferta.organizer;
    
    return currentUser.role === 'organizer' && organizadorId === currentUser._id;
  };

  // Ver postulaciones
  const handleVerPostulaciones = () => {
    navigate(`/ofertas/${id}/postulaciones`);
  };

  if (loading) {
    return (
      <div className="full-window">
        <Navbar />
        <div className="main-content-padding">
        <div className="loading">Cargando detalles de la oferta...</div>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (!oferta) {
    return (
      <div className="full-window">
        <Navbar />
        <div className="main-content-padding">
        <div className="error-container">
          <div className="error-message">La oferta no existe o ha sido eliminada.</div>
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
      <div className="ofertas-container oferta-detail-container">
      <div className="oferta-detail-header flex-header">
        <h1>{oferta.titulo}</h1>
          <div className="oferta-actions">
            <Link to="/ofertas" className="btn btn-secondary">
              Volver a ofertas
            </Link>
            
            {isAuthenticated && currentUser?.role === 'musician' && !yaPostulado() && (
              <Link to={`/ofertas/${oferta._id}/postular`} className="btn btn-primary">
                Postularme
              </Link>
            )}
            
            {isAuthenticated && currentUser?.role === 'musician' && yaPostulado() && (
              <span className="postulado-badge">Ya postulado</span>
            )}
            
            {esOrganizador() && (
              <>
                <Link to={`/ofertas/${oferta._id}/editar`} className="btn btn-secondary">
                  Editar oferta
                </Link>
                {/* Corregido: Ahora usamos un Link directo en lugar de Link + a */}
                <Link to={`/ofertas/${oferta._id}/postulaciones`} className="btn btn-primary">
                  Ver postulaciones
                </Link>
                <button onClick={handleEliminarOferta} className="btn btn-danger">
                  Eliminar oferta
                </button>
              </>
            )}
          </div>
        </div>

        <div className="oferta-detail-content">
          <div className="oferta-info-section">
            <h2>Detalles de la oferta</h2>
            
            <div className="oferta-info-item">
            <span className="label">Organizador:</span>
            <span>
              {typeof oferta.organizer === 'object'
                ? oferta.organizer.name || 'No disponible'
                : 'No disponible'}
            </span>

            </div>
            
            <div className="oferta-info-item">
            <span className="label">Local:</span>
            <span>
              {oferta.organizer?.profile?.venueName || 'No disponible'}
            </span>

            </div>
            
            <div className="oferta-info-item">
              <span className="label">Fecha de evento:</span>
              <span>{formatearFecha(oferta.fechaEvento)}</span>
            </div>
            
            <div className="oferta-info-item">
              <span className="label">Género musical:</span>
              <span>{oferta.genero || 'No especificado'}</span>
            </div>
            
            <div className="oferta-info-item">
              <span className="label">Ubicación:</span>
              <span>{oferta.ubicacion || 'No especificada'}</span>
            </div>
            
            <div className="oferta-info-item">
              <span className="label">Publicada el:</span>
              <span>{formatearFecha(oferta.fechaCreacion)}</span>
            </div>
          </div>

          <div className="oferta-descripcion-section">
            <h2>Descripción</h2>
            <div className="descripcion-content">
            {(oferta.descripcion || 'Sin descripción disponible')
            .split('\n')
            .map((parrafo, index) => <p key={index}>{parrafo}</p>)}

            </div>
          </div>

          {esOrganizador() && oferta.postulaciones && oferta.postulaciones.length > 0 && (
            <div className="oferta-postulaciones-preview">
              <h2>Postulaciones ({oferta.postulaciones.length})</h2>
              <p>
                Hay {oferta.postulaciones.length} músicos postulados a esta oferta.{' '}
                {/* Cambiado el enlace por un botón más visible */}
                <button onClick={handleVerPostulaciones} className="btn btn-primary mt-2">
                  Ver y gestionar postulaciones
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default OfertaDetail;