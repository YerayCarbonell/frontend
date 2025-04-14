// src/components/auth/Register.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Extraer tipo de usuario de la URL si existe
  const queryParams = new URLSearchParams(location.search);
  const userTypeFromURL = queryParams.get('type');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: userTypeFromURL || 'musician', // Valor por defecto
    profile: {
      bio: '',
      phone: '',
      location: '',
      // Campos específicos para músicos
      genres: [],
      instruments: [],
      experience: '',
      // Campos específicos para organizadores
      venueName: '',
      venueType: '',
      capacity: '',
      eventTypes: []
    }
  });

  // Si cambia el tipo de usuario en la URL, actualizar el estado
  useEffect(() => {
    if (userTypeFromURL) {
      setFormData(prev => ({
        ...prev,
        role: userTypeFromURL
      }));
    }
  }, [userTypeFromURL]);

  const handleChange = (e) => {
    if (e.target.name.includes('.')) {
      // Manejo de campos anidados (para el objeto profile)
      const [parent, child] = e.target.name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.value
        }
      });
    } else {
      // Manejo de campos de primer nivel
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\]{};':"\\|,.<>?]/.test(password)) strength++;
    
    if (strength === 5) return "Fuerte";
    else if (strength >= 3) return "Moderada";
    else return "Débil";
};

const [passwordStrengthStatus, setPasswordStrengthStatus] = useState('');
const [showPassword, setShowPassword] = useState(false);

const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
};

const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPasswordStrengthStatus(passwordStrength(password));
    handleChange(e); // Llamar a handleChange para actualizar el estado
};



  const handleMultiSelect = (e, field) => {
    // Para manejar selecciones múltiples (géneros, instrumentos, tipos de eventos)
    const options = Array.from(e.target.selectedOptions, option => option.value);
    
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        [field]: options
      }
    });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep1()) {
        setError('Todos los campos son obligatorios'); // Muestra el mensaje solo si intenta avanzar
    } else {
        setError('');
        setStep(2);
    }
};


  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Eliminar confirmPassword antes de enviar al servidor
      const { confirmPassword, ...dataToSend } = formData;
      
      await axios.post('http://localhost:5000/api/auth/register', dataToSend);
      
      // Redirigir al login después de registro exitoso
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <Link to="/" className="auth-logo">
        <h1><span className="special">Escen</span><span className="highlight">Arte</span></h1>
        </Link>
        <h2>Crear una cuenta</h2>
        <p>
          {formData.role === 'musician' 
            ? 'Registra tu perfil como músico y encuentra oportunidades' 
            : 'Registra tu perfil como organizador y encuentra talento musical'}
        </p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <div className="register-type-selector">
          <div 
            className={`type-option ${formData.role === 'musician' ? 'active' : ''}`}
            onClick={() => setFormData({...formData, role: 'musician'})}
          >
            <i className="fas fa-guitar"></i>
            <span>Soy Músico</span>
          </div>
          <div 
            className={`type-option ${formData.role === 'organizer' ? 'active' : ''}`}
            onClick={() => setFormData({...formData, role: 'organizer'})}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Soy Organizador</span>
          </div>
        </div>
        <div>
            {step === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2'}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {step === 1 ? (
            // Paso 1: Información básica
            <>
              <div className="form-group">
                <label htmlFor="name">Nombre completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Tu correo electrónico"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="Crea una contraseña"
                  required
                />
                <button className="toggle-password-btn" onClick={togglePasswordVisibility}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
                <p>Fortaleza de la contraseña: {passwordStrengthStatus}</p>

              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>
              
              <button type="button" className="btn btn-primary btn-block" onClick={nextStep}>
                Continuar
              </button>
            </>
          ) : (
            // Paso 2: Información específica según el rol
            <>
              <div className="form-group">
                <label htmlFor="profile.bio">Biografía</label>
                <textarea
                  id="profile.bio"
                  name="profile.bio"
                  value={formData.profile.bio}
                  onChange={handleChange}
                  placeholder={formData.role === 'musician' ? 'Cuéntanos sobre ti como músico' : 'Cuéntanos sobre tu local o evento'}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="profile.phone">Teléfono</label>
                <input
                  type="tel"
                  id="profile.phone"
                  name="profile.phone"
                  value={formData.profile.phone}
                  onChange={handleChange}
                  placeholder="Tu número de contacto"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="profile.location">Ubicación</label>
                <input
                  type="text"
                  id="profile.location"
                  name="profile.location"
                  value={formData.profile.location}
                  onChange={handleChange}
                  placeholder="Ciudad, País"
                />
              </div>
              
              {formData.role === 'musician' ? (
                // Campos específicos para músicos
                <>
                  <div className="form-group">
                    <label htmlFor="profile.genres">Géneros musicales</label>
                    <select
                      id="profile.genres"
                      multiple
                      onChange={(e) => handleMultiSelect(e, 'genres')}
                      className="multi-select"
                    >
                      <option value="rock">Rock</option>
                      <option value="pop">Pop</option>
                      <option value="jazz">Jazz</option>
                      <option value="blues">Blues</option>
                      <option value="clásica">Clásica</option>
                      <option value="electrónica">Electrónica</option>
                      <option value="folk">Folk</option>
                      <option value="rap">Rap/Hip-Hop</option>
                      <option value="latina">Música Latina</option>
                      <option value="flamenco">Flamenco</option>
                    </select>
                    <small>Mantén presionado Ctrl/Cmd para seleccionar varios</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="profile.instruments">Instrumentos</label>
                    <select
                      id="profile.instruments"
                      multiple
                      onChange={(e) => handleMultiSelect(e, 'instruments')}
                      className="multi-select"
                    >
                      <option value="voz">Voz</option>
                      <option value="guitarra">Guitarra</option>
                      <option value="piano">Piano/Teclado</option>
                      <option value="bajo">Bajo</option>
                      <option value="batería">Batería</option>
                      <option value="violín">Violín</option>
                      <option value="saxofón">Saxofón</option>
                      <option value="trompeta">Trompeta</option>
                      <option value="dj">DJ</option>
                      <option value="otro">Otro</option>
                    </select>
                    <small>Mantén presionado Ctrl/Cmd para seleccionar varios</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="profile.experience">Experiencia</label>
                    <select
                      id="profile.experience"
                      name="profile.experience"
                      value={formData.profile.experience}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona tu nivel de experiencia</option>
                      <option value="principiante">Principiante (0-2 años)</option>
                      <option value="intermedio">Intermedio (3-5 años)</option>
                      <option value="avanzado">Avanzado (6-10 años)</option>
                      <option value="profesional">Profesional (10+ años)</option>
                    </select>
                  </div>
                </>
              ) : (
                // Campos específicos para organizadores
                <>
                  <div className="form-group">
                    <label htmlFor="profile.venueName">Nombre del local/evento</label>
                    <input
                      type="text"
                      id="profile.venueName"
                      name="profile.venueName"
                      value={formData.profile.venueName}
                      onChange={handleChange}
                      placeholder="Nombre de tu local o evento"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="profile.venueType">Tipo de local</label>
                    <select
                      id="profile.venueType"
                      name="profile.venueType"
                      value={formData.profile.venueType}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona el tipo de local</option>
                      <option value="restaurante">Restaurante</option>
                      <option value="bar">Bar</option>
                      <option value="cafe">Café</option>
                      <option value="sala">Sala de conciertos</option>
                      <option value="discoteca">Discoteca/Club</option>
                      <option value="hotel">Hotel</option>
                      <option value="teatro">Teatro</option>
                      <option value="centro">Centro cultural</option>
                      <option value="festival">Festival</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="profile.capacity">Capacidad aproximada</label>
                    <input
                      type="number"
                      id="profile.capacity"
                      name="profile.capacity"
                      value={formData.profile.capacity}
                      onChange={handleChange}
                      placeholder="Número aproximado de personas"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="profile.eventTypes">Tipos de eventos</label>
                    <select
                      id="profile.eventTypes"
                      multiple
                      onChange={(e) => handleMultiSelect(e, 'eventTypes')}
                      className="multi-select"
                    >
                      <option value="concierto">Conciertos</option>
                      <option value="jam">Jam Sessions</option>
                      <option value="ambiente">Música de ambiente</option>
                      <option value="fiestas">Fiestas privadas</option>
                      <option value="bodas">Bodas y celebraciones</option>
                      <option value="corporativos">Eventos corporativos</option>
                      <option value="festivales">Festivales</option>
                    </select>
                    <small>Mantén presionado Ctrl/Cmd para seleccionar varios</small>
                  </div>
                </>
              )}
              
              <div className="form-buttons">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                  Volver
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="auth-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;