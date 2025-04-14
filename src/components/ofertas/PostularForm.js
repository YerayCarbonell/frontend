// src/components/ofertas/PostularForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Ofertas.css';
import Navbar from '../layout/Navbar';
import '../../components/common/variables.css';

const PostularForm = () => {
  const { id } = useParams(); // ID de la oferta
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [oferta, setOferta] = useState(null);
  const [motivacion, setMotivacion] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar que el usuario sea músico y cargar la oferta
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'musician') {
      navigate('/ofertas');
      return;
    }
    
    // Cargar los detalles de la oferta
    const fetchOferta = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/ofertas/${id}`);
        setOferta(res.data);

        // Verificar si ya se ha postulado a esta oferta
        const postulaciones = res.data.postulaciones || [];
        const yaPostulado = postulaciones.some(p => {
          if (typeof p === 'object') {
            return p.musician === currentUser._id || p.musician?._id === currentUser._id;
          }
          return p === currentUser._id;
        });
        
        if (yaPostulado) {
          setError('Ya te has postulado a esta oferta.');
          setTimeout(() => {
            navigate(`/ofertas/${id}`);
          }, 2000);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar la oferta. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOferta();
  }, [isAuthenticated, currentUser, navigate, id]);

  // Manejar cambios en el campo de motivación
  const handleChange = (e) => {
    setMotivacion(e.target.value);
  };

  // Enviar la postulación
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post(`http://localhost:5000/api/ofertas/${id}/postular`, { motivacion: motivacion });
      
      setSuccess('¡Postulación enviada correctamente!');
      
      // Redirigir después de un breve tiempo
      setTimeout(() => {
        navigate('/mis-postulaciones');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || 'Error al enviar la postulación. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Formatear la fecha para mostrarla
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Por determinar';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Cargando detalles de la oferta...</div>
      </div>
    );
  }

  if (!oferta && !error) {
    return (
      <div>
        <Navbar />
        <div className="loading">La oferta no existe o ha sido eliminada.</div>
      </div>
    );
  }

  return (
    <div className="full-window">
      <Navbar />
      <div className="postular-form-wrapper">
      <div className="postular-form-container">
        <h1>Postularse a: {oferta?.titulo}</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {!error && !success && (
          <div className="oferta-resumen">
            <div className="oferta-info">
              <p><strong>Organizador:</strong> {oferta?.organizer?.name || 'No especificado'}</p>
              <p><strong>Local:</strong> {oferta?.organizer?.profile?.local || 'No especificado'}</p>
              <p><strong>Fecha:</strong> {formatearFecha(oferta?.fechaEvento)}</p>
              <p><strong>Género:</strong> {oferta?.genero || 'No especificado'}</p>
              <p><strong>Ubicación:</strong> {oferta?.ubicacion || 'No especificada'}</p>
            </div>
          </div>
        )}
        
        {!error && !success && (
          <form onSubmit={handleSubmit} className="postular-form">
            <div className="form-group">
              <label htmlFor="motivacion">¿Por qué quieres participar en este evento?</label>
              <textarea
                id="motivacion"
                name="motivacion"
                value={motivacion}
                onChange={handleChange}
                required
                placeholder="Describe por qué eres adecuado para esta oferta, tus experiencias previas, tu estilo musical, etc."
                className="form-control"
                rows="6"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <Link 
                to={`/ofertas/${id}`} 
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancelar
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar postulación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </div>
  );
};

export default PostularForm;