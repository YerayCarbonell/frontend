// src/pages/MisOfertas.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MisOfertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMisOfertas = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/ofertas/usuario/${currentUser._id}`);
        setOfertas(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Error al cargar tus ofertas. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMisOfertas();
  }, [currentUser._id]);

  // Formatear la fecha para mostrarla
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Por determinar';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Cargando tus ofertas...</div>;
  }

  return (
    <div className="mis-ofertas-container">
      <div className="mis-ofertas-header">
        <h1>Mis Ofertas Publicadas</h1>
        <Link to="/crear-oferta" className="btn btn-primary">
          Publicar nueva oferta
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {ofertas.length === 0 ? (
        <div className="no-ofertas">
          <p>Aún no has publicado ninguna oferta.</p>
          <Link to="/crear-oferta" className="btn btn-primary">
            Publicar mi primera oferta
          </Link>
        </div>
      ) : (
        <div className="ofertas-list">
          {ofertas.map(oferta => (
            <div key={oferta._id} className="oferta-card">
              <h3 className="oferta-titulo">{oferta.titulo}</h3>
              <p className="oferta-fecha">
                <span className="label">Fecha del evento:</span> {formatearFecha(oferta.fechaEvento)}
              </p>
              <p className="oferta-genero">
                <span className="label">Género musical:</span> {oferta.genero || 'No especificado'}
              </p>
              <p className="oferta-ubicacion">
                <span className="label">Ubicación:</span> {oferta.ubicacion || 'No especificada'}
              </p>
              <p className="oferta-postulaciones">
                <span className="label">Postulaciones:</span> {oferta.postulaciones?.length || 0}
              </p>
              <div className="oferta-actions">
                <Link to={`/ofertas/${oferta._id}`} className="btn btn-secondary">
                  Ver detalles
                </Link>
                <Link to={`/ofertas/${oferta._id}/editar`} className="btn btn-secondary">
                  Editar
                </Link>
                <Link to={`/ofertas/${oferta._id}/postulaciones`} className="btn btn-primary">
                  Ver postulaciones
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisOfertas;