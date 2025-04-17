import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import './Mensajes.css';
import { axiosInstance } from '../../context/AuthContext';

const ListaMensajes = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchConversaciones = async () => {
      try {
        const res = await axiosInstance.get('/chat/conversaciones', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        setConversaciones(res.data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las conversaciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversaciones();

    // Configurar un intervalo para actualizar las conversaciones cada 30 segundos
    const intervalId = setInterval(fetchConversaciones, 30000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [isAuthenticated, navigate]);

  // Función para formatear la fecha de manera amigable
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    
    // Verificar si es hoy
    if (fecha.toDateString() === hoy.toDateString()) {
      return fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Verificar si es ayer
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    if (fecha.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    }
    
    // Verificar si es esta semana
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    if (fecha >= inicioSemana) {
      return fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    }
    
    // Si es anterior, mostrar fecha
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
          <div className="loading">Cargando conversaciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-window">
      <Navbar />
      <div className="main-content-padding">
        <div className="mensajes-container">
          <div className="mensajes-header">
            <h1>Mis conversaciones</h1>
          </div>
          {error && <div className="error-message">{error}</div>}
          {conversaciones.length === 0 ? (
            <p className="no-mensajes">No tienes conversaciones activas.</p>
          ) : (
            <div className="conversaciones-lista">
              {conversaciones.map(conv => (
                <Link
                  key={conv.userId}
                  to={`/mensajes/${conv.userId}`}
                  className={`conversacion-item ${conv.noLeidos > 0 ? 'unread' : ''}`}
                >
                  <div className="conversacion-info">
                    <h3>{conv.userName}</h3>
                    {conv.ofertaTitulo && (
                      <div className="offer-badge">Oferta: {conv.ofertaTitulo}</div>
                    )}
                    <p className="ultimo-mensaje">{conv.ultimoMensaje}</p>
                  </div>
                  <div className="conversacion-meta">
                    <span className="fecha-mensaje">
                      {formatearFecha(conv.fecha)}
                    </span>
                    {conv.noLeidos > 0 && (
                      <span className="mensajes-no-leidos">{conv.noLeidos}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaMensajes;
