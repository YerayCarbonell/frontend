// src/components/ofertas/MisOfertas.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import './Ofertas.css';
import { axiosInstance } from '../../context/AuthContext';

const MisOfertas = () => {
  const [ofertas, setOfertas] = useState([]);
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
    
    // Verificar que el usuario sea organizador
    if (currentUser.role !== 'organizer') {
      navigate('/');
      return;
    }
    
    const fetchMisOfertas = async () => {
      try {
        const res = await axiosInstance.get(`/ofertas?organizer=${currentUser._id}`);
        setOfertas(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar tus ofertas.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMisOfertas();
  }, [currentUser, isAuthenticated, navigate]);

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
    return (
      <div className="full-window">
        <Navbar />
        <div className="main-content-padding">
          <div className="loading">Cargando tus ofertas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-window">
      <Navbar />
      <div className="main-content-padding">
        <div className="ofertas-container">
          <div className="mis-ofertas-header">
            <h1>Mis ofertas publicadas</h1>
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
            <div className="ofertas-grid">
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
                    {/* Corregido el enlace para ver postulaciones */}
                    <Link to={`/ofertas/${oferta._id}/postulaciones`} className="btn btn-primary">
                      Ver postulaciones
                    </Link>
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

export default MisOfertas;