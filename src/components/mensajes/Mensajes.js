import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import './Mensajes.css';

// Importamos iconos necesarios
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mensaje-leido-icon">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const Mensajes = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { currentUser, isAuthenticated } = useAuth();
    const [usuario, setUsuario] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ofertaRelacionada, setOfertaRelacionada] = useState(null);
    const mensajesListRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Obtener información del usuario
                const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUsuario(userRes.data);

                // Obtener mensajes entre el usuario actual y el usuario especificado
                const mensajesRes = await axios.get(`http://localhost:5000/api/chat/mensajes/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setMensajes(mensajesRes.data);
                
                // Buscar si hay algún mensaje con oferta relacionada
                let ofertaId = null;

                // Buscar la primera oferta asociada, sea ID o objeto populado
                for (const m of mensajesRes.data) {
                if (m.oferta && typeof m.oferta === 'string') {
                    ofertaId = m.oferta;
                    break;
                } else if (m.oferta && m.oferta._id) {
                    ofertaId = m.oferta._id;
                    break;
                }
                }

                if (ofertaId) {
                try {
                    const ofertaRes = await axios.get(`http://localhost:5000/api/ofertas/${ofertaId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                    });
                    setOfertaRelacionada(ofertaRes.data);
                } catch (err) {
                    console.error("Error al obtener la oferta relacionada:", err);
                }
                }

                
                // Marcar mensajes como leídos
                marcarComoLeidos();
                
                setError('');
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar los mensajes.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Limpiar el timeoutId cuando el componente se desmonte
        return () => {
            if (mensajesListRef.current) {
                mensajesListRef.current.scrollTop = mensajesListRef.current.scrollHeight;
            }
        };
    }, [userId, isAuthenticated, navigate]);

    // Efecto para desplazarse al último mensaje cuando se actualiza la lista
    useEffect(() => {
        if (mensajesListRef.current) {
            mensajesListRef.current.scrollTop = mensajesListRef.current.scrollHeight;
        }
    }, [mensajes]);
    
    // Ajustar la altura del textarea automáticamente
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [nuevoMensaje]);

    // Enviar mensaje
    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim()) return;

        try {
            setLoading(true);
            // Incluir el ID de la oferta si existe
            const mensajeData = {
                receiver: userId,
                content: nuevoMensaje
            };
            
            if (ofertaRelacionada) {
                mensajeData.oferta = ofertaRelacionada._id;
            }
            
            await axios.post(`http://localhost:5000/api/chat/mensajes`, mensajeData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const mensajesRes = await axios.get(`http://localhost:5000/api/chat/mensajes/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            setMensajes(mensajesRes.data);
            setNuevoMensaje('');
            
            // Resetear altura del textarea
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (err) {
            console.error(err);
            setError('Error al enviar el mensaje.');
        } finally {
            setLoading(false);
        }
    };

    // Formatear la fecha para mostrarla
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        
        // Verificar si es hoy
        const hoy = new Date();
        const esHoy = fecha.getDate() === hoy.getDate() && 
                      fecha.getMonth() === hoy.getMonth() && 
                      fecha.getFullYear() === hoy.getFullYear();
        
        if (esHoy) {
            return fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Verificar si es ayer
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        const esAyer = fecha.getDate() === ayer.getDate() && 
                      fecha.getMonth() === ayer.getMonth() && 
                      fecha.getFullYear() === ayer.getFullYear();
        
        if (esAyer) {
            return `Ayer, ${fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
        
        // Si es otro día
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Determinar si un mensaje es del usuario actual
    const esMensajePropio = (mensaje) => {
        return mensaje.sender === currentUser?._id;
    };
    
    // Marcar mensajes como leídos
    const marcarComoLeidos = async () => {
        try {
            await axios.put(`http://localhost:5000/api/chat/mensajes/leer/${userId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (err) {
            console.error("Error al marcar mensajes como leídos:", err);
        }
    };

    // Manejar cambios en el textarea y ajustar su altura
    const handleTextareaChange = (e) => {
        setNuevoMensaje(e.target.value);
    };
    
    // Manejar teclas en el textarea (Enter para enviar)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje(e);
        }
    };

    if (loading && !usuario) {
        return (
            <div className="full-window">
                <Navbar />
                <div className="main-content-padding">
                    <div className="loading">Cargando conversación...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="full-window">
            <Navbar />
            <div className="main-content-padding">
                <div className="mensajes-container">
                    <div className="mensajes-header flex-header">
                        <div>
                            <h1>{usuario?.name}</h1>
                            {ofertaRelacionada && (
                                <div className="oferta-badge">
                                    Oferta: {ofertaRelacionada.titulo}
                                </div>
                            )}
                        </div>
                        <div className="mensajes-actions">
                            <button 
                                onClick={() => navigate('/mensajes')} 
                                className="back-button"
                            >
                                <ArrowLeftIcon /> Volver
                            </button>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    
                    {ofertaRelacionada && (
                        <div className="oferta-relacionada">
                            <h3 className="oferta-relacionada-titulo">Conversación sobre: {ofertaRelacionada.titulo}</h3>
                            <p className="oferta-relacionada-texto">
                                {ofertaRelacionada.descripcion?.substring(0, 120)}
                                {ofertaRelacionada.descripcion?.length > 120 ? '...' : ''}
                            </p>
                            <Link to={`/ofertas/${ofertaRelacionada._id}`} className="oferta-relacionada-enlace">
                                Ver oferta completa <ExternalLinkIcon />
                            </Link>
                        </div>
                    )}

                    <div className="mensajes-lista" ref={mensajesListRef}>
                        {mensajes.length === 0 ? (
                            <p className="no-mensajes">Aún no hay mensajes. ¡Inicia la conversación!</p>
                        ) : (
                            mensajes.map((mensaje) => {
                                const propio = esMensajePropio(mensaje);
                                return (
                                    <div 
                                        key={mensaje._id} 
                                        className={`mensaje ${propio ? 'mensaje-propio' : 'mensaje-otro'}`}
                                    >
                                        <span className="mensaje-etiqueta">
                                            {propio ? 'Tú' : usuario?.name}
                                        </span>
                                        
                                        <div className="mensaje-contenido">
                                            <p>{mensaje.content}</p>
                                            <span className="mensaje-fecha">
                                                {formatearFecha(mensaje.createdAt)}
                                                {mensaje.read && propio && (
                                                    <span className="mensaje-leido">
                                                        <CheckIcon /> Leído
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    <form onSubmit={enviarMensaje} className="mensaje-form">
                        <textarea
                            ref={textareaRef}
                            value={nuevoMensaje}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu mensaje..."
                            disabled={loading}
                            rows={1}
                        ></textarea>
                        <button type="submit" disabled={loading || !nuevoMensaje.trim()}>
                            {loading ? 'Enviando...' : <><SendIcon /> Enviar</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Mensajes;