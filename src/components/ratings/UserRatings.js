// src/components/ratings/UserRatings.js
import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../context/AuthContext';
import './Ratings.css';

const UserRatings = ({ userId }) => {
  const [valoraciones, setValoraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchValoraciones = async () => {
      try {
        const res = await axiosInstance.get(`/ratings/usuario/${userId}`);
        setValoraciones(res.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar valoraciones:', err);
        setError('No se pudieron cargar las valoraciones');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchValoraciones();
    }
  }, [userId]);
  
  // Calcular promedio de valoraciones
  const promedioValoraciones = valoraciones.length > 0 
    ? (valoraciones.reduce((acc, val) => acc + val.calificacion, 0) / valoraciones.length).toFixed(1)
    : 0;
  
  // Formatear fecha
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
    return <div className="loading-ratings">Cargando valoraciones...</div>;
  }
  
  if (error) {
    return <div className="error-ratings">{error}</div>;
  }
  
  if (valoraciones.length === 0) {
    return <div className="no-ratings">Este usuario aún no tiene valoraciones.</div>;
  }
  
  return (
    <div className="valoraciones-container">
      <div className="valoraciones-resumen">
        <div className="valoracion-promedio">
          <span className="promedio-numero">{promedioValoraciones}</span>
          <div className="estrellas-promedio">
            {[1, 2, 3, 4, 5].map(i => (
              <span 
                key={i} 
                className={i <= Math.round(promedioValoraciones) ? "estrella activa" : "estrella"}
              >
                ★
              </span>
            ))}
          </div>
          <span className="total-valoraciones">({valoraciones.length} valoraciones)</span>
        </div>
      </div>
      
      <div className="valoraciones-lista">
        {valoraciones.map(valoracion => (
          <div key={valoracion._id} className="valoracion-item">
            <div className="valoracion-header">
              <div className="valoracion-autor">
                <span className="autor-nombre">{valoracion.evaluador.name}</span>
                <span className="autor-rol">({valoracion.evaluador.role === 'musician' ? 'Músico' : 'Organizador'})</span>
              </div>
              <div className="valoracion-estrellas">
                {[1, 2, 3, 4, 5].map(i => (
                  <span 
                    key={i} 
                    className={i <= valoracion.calificacion ? "estrella activa" : "estrella"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            
            <div className="valoracion-evento">
              Evento: {valoracion.oferta?.titulo || 'No disponible'} - {formatearFecha(valoracion.oferta?.fechaEvento)}
            </div>
            
            {valoracion.comentario && (
              <div className="valoracion-comentario">
                "{valoracion.comentario}"
              </div>
            )}
            
            <div className="valoracion-fecha">
              Valorado el {formatearFecha(valoracion.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRatings;