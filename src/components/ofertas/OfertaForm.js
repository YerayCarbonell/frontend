// src/components/ofertas/OfertaForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Ofertas.css';
import Navbar from '../layout/Navbar';

const OfertaForm = () => {
  const { id } = useParams(); // Si existe id, estamos editando; si no, creando
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechaEvento: '',
    genero: '',
    ubicacion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isEditing = !!id;

  // Verificar que el usuario sea organizador
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'organizer') {
      navigate('/');
      return;
    }
    
    // Si estamos editando, cargar los datos de la oferta
    if (isEditing) {
      const fetchOferta = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/ofertas/${id}`);
          
          // Corregido: Verificar que la oferta pertenece al organizador actual
          const organizadorId = res.data.organizer._id || res.data.organizer;
          
          if (organizadorId !== currentUser._id) {
            navigate('/ofertas');
            return;
          }
          
          // Formatear la fecha para el input type="datetime-local"
          let fechaEvento = '';
          if (res.data.fechaEvento) {
            const fecha = new Date(res.data.fechaEvento);
            fechaEvento = fecha.toISOString().slice(0, 16); // Formato: YYYY-MM-DDTHH:MM
          }
          
          setFormData({
            titulo: res.data.titulo || '',
            descripcion: res.data.descripcion || '',
            fechaEvento: fechaEvento,
            genero: res.data.genero || '',
            ubicacion: res.data.ubicacion || ''
          });
        } catch (err) {
          console.error(err);
          setError('No se pudo cargar los datos de la oferta.');
        }
      };
      
      fetchOferta();
    }
  }, [isAuthenticated, currentUser, navigate, id, isEditing]);

  // Añadiendo la función handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Manejar cambios en el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Asegurarnos que todos los campos requeridos tienen datos válidos
      if (!formData.titulo.trim()) {
        throw new Error('El título es obligatorio');
      }
      
      if (!formData.descripcion.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }
      
      // Configurar headers correctamente
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Preparar datos para enviar - evitar campos vacíos
      const dataToSend = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        // Para valores opcionales, enviar cadena vacía si no hay valor
        fechaEvento: formData.fechaEvento || null,
        genero: formData.genero || '',
        ubicacion: formData.ubicacion || ''
      };
      
      // Para depuración
      console.log('Enviando datos:', dataToSend);
      console.log('Headers:', config.headers);
      
      let res;
      if (isEditing) {
        // Actualizar oferta existente
        res = await axios.put(`http://localhost:5000/api/ofertas/${id}`, dataToSend, config);
        setSuccess('Oferta actualizada correctamente');
      } else {
        // Crear nueva oferta
        res = await axios.post('http://localhost:5000/api/ofertas', dataToSend, config);
        setSuccess('Oferta creada correctamente');
      }
      
      console.log('Respuesta del servidor:', res.data);
      
      // Redirigir después de un breve tiempo
      setTimeout(() => {
        navigate(isEditing ? `/ofertas/${id}` : `/ofertas/${res.data._id}`);
      }, 1500);
    } catch (err) {
      console.error('Error completo:', err);
      // Mostrar mensaje del error desde la API si está disponible
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error al guardar la oferta. Por favor, verifica los datos e inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-window">
      <Navbar />
      <div className="oferta-form-container">
        <h1>{isEditing ? 'Editar Oferta' : 'Crear Nueva Oferta'}</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="oferta-form">
          <div className="form-group">
            <label htmlFor="titulo">Título de la oferta*</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Ej: Buscamos guitarrista para evento corporativo"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="descripcion">Descripción detallada*</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              placeholder="Detalla el tipo de música, duración, requisitos, compensación, etc."
              className="form-control"
              rows="6"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="fechaEvento">Fecha y hora del evento</label>
            <input
              type="datetime-local"
              id="fechaEvento"
              name="fechaEvento"
              value={formData.fechaEvento}
              onChange={handleChange}
              className="form-control"
            />
            <small>Si la fecha no está definida, puedes dejarla en blanco.</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="genero">Género musical</label>
            <select
              id="genero"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Selecciona un género</option>
              <option value="Rock">Rock</option>
              <option value="Pop">Pop</option>
              <option value="Jazz">Jazz</option>
              <option value="Clásica">Clásica</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Folk">Folk</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="ubicacion">Ubicación</label>
            <select
              id="ubicacion"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Selecciona una ubicación</option>
              <option value="Madrid">Madrid</option>
              <option value="Barcelona">Barcelona</option>
              <option value="Valencia">Valencia</option>
              <option value="Sevilla">Sevilla</option>
              <option value="Bilbao">Bilbao</option>
              <option value="Málaga">Málaga</option>
              <option value="Otra">Otra</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(isEditing ? `/ofertas/${id}` : '/ofertas')} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Oferta' : 'Crear Oferta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfertaForm;