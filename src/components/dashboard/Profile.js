// src/components/dashboard/Profile.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import './Profile.css';
import axios from 'axios';
// Importamos la imagen por defecto
import defaultProfile from '../../assets/images/default-profile.png';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [postulaciones, setPostulaciones] = useState([]);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false);
  const [errorPostulaciones, setErrorPostulaciones] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const { id } = useParams();
  const isOwnProfile = !id || id === currentUser?._id;
  
  
  useEffect(() => {
    // Establece el título del documento
    document.title = isOwnProfile ? 
      `Mi Perfil | EscenArte` : 
      `Perfil de Usuario | EscenArte`;
    
    const cargarPerfil = async () => {
      setLoadingProfile(true);
      
      if (isOwnProfile) {
        // Cargar perfil propio
        const initData = {
          name: currentUser.name || '',
          email: currentUser.email || '',
          role: currentUser.role || '',
          profile: {
            bio: currentUser.profile?.bio || '',
            phone: currentUser.profile?.phone || '',
            location: currentUser.profile?.location || '',
            // Datos específicos para Músicos
            genres: currentUser.profile?.genres || [],
            instruments: currentUser.profile?.instruments || [],
            experience: currentUser.profile?.experience || '',
            // Datos específicos para Organizadores
            venueName: currentUser.profile?.venueName || '',
            venueType: currentUser.profile?.venueType || '',
            capacity: currentUser.profile?.capacity || '',
            eventTypes: currentUser.profile?.eventTypes || []
          },
          multimedia: {
            profilePhoto: currentUser.multimedia?.profilePhoto || '',
            fotos: currentUser.multimedia?.fotos || [],
            audio: currentUser.multimedia?.audio || []
          }
        };

        setProfileData(initData);
        setOriginalData(initData); // Guardamos una copia de los datos originales
        
        // Si el usuario es músico, cargar sus postulaciones
        if (currentUser.role === 'musician') {
          fetchMisPostulaciones();
        }
      } else {
        // Cargar perfil de otro usuario
        try {
          const res = await axios.get(`http://localhost:5000/api/users/${id}`);
          const usuario = res.data;

          const initData = {
            name: usuario.name || '',
            email: usuario.email || '',
            role: usuario.role || '',
            profile: {
              bio: usuario.profile?.bio || '',
              phone: usuario.profile?.phone || '',
              location: usuario.profile?.location || '',
              genres: usuario.profile?.genres || [],
              instruments: usuario.profile?.instruments || [],
              experience: usuario.profile?.experience || '',
              venueName: usuario.profile?.venueName || '',
              venueType: usuario.profile?.venueType || '',
              capacity: usuario.profile?.capacity || '',
              eventTypes: usuario.profile?.eventTypes || []
            },
            multimedia: {
              profilePhoto: usuario.multimedia?.profilePhoto || '',
              fotos: usuario.multimedia?.fotos || [],
              audio: usuario.multimedia?.audio || []
            }
          };

          setProfileData(initData);
          setOriginalData(initData);
          setProfileError('');
        } catch (err) {
          console.error("Error al cargar el perfil:", err);
          setProfileError('No se pudo cargar el perfil del usuario. El usuario podría no existir o no estar disponible.');
        }
      }
      setLoadingProfile(false);
    };
    
    if (currentUser) {
      cargarPerfil();
    }
  }, [currentUser, id, isOwnProfile]);

  // Función para cargar las postulaciones del músico
  const fetchMisPostulaciones = async () => {
    setLoadingPostulaciones(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/postulaciones/usuario/${currentUser._id}`);
      setPostulaciones(res.data);
      setErrorPostulaciones('');
    } catch (err) {
      console.error(err);
      setErrorPostulaciones('Error al cargar tus postulaciones. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoadingPostulaciones(false);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setProfileData(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [field]: value
        }
      }));
    } else {
      setProfileData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleArrayInputChange = (e, section, field) => {
    const values = e.target.value.split(',').map(item => item.trim());
    setProfileData(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: values
      }
    }));
  };

  // Función para obtener solo los cambios respecto a la data original
  const getUpdatedPayload = () => {
    const payload = {};
  
    if (profileData.name !== originalData.name) {
      payload.name = profileData.name;
    }
  
    if (profileData.email !== originalData.email) {
      payload.email = profileData.email;
    }
  
    const updatedProfile = {};
  
    for (const key in profileData.profile) {
      if (Array.isArray(profileData.profile[key])) {
        if (profileData.profile[key].join(',') !== originalData.profile[key].join(',')) {
          updatedProfile[key] = profileData.profile[key];
        }
      } else if (profileData.profile[key] !== originalData.profile[key]) {
        updatedProfile[key] = profileData.profile[key];
      }
    }
  
    if (currentUser.role === 'organizer') {
      if (!updatedProfile.venueName && profileData.profile.venueName) {
        updatedProfile.venueName = profileData.profile.venueName;
      }
      if (!updatedProfile.eventTypes && profileData.profile.eventTypes) {
        updatedProfile.eventTypes = profileData.profile.eventTypes;
      }
    }
  
    if (Object.keys(updatedProfile).length > 0) {
      payload.profile = updatedProfile;
    }
  
    if (JSON.stringify(profileData.multimedia) !== JSON.stringify(originalData.multimedia)) {
      payload.multimedia = {
        ...originalData.multimedia,
        ...profileData.multimedia
      };
    }
    
  
    return payload;
  };
  

  const handleUploadFile = async (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append(tipo, file);
  
    try {
      const res = await axios.post(`http://localhost:5000/api/upload/${tipo}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const url = res.data.url;
  
      // Actualiza el estado local
      const updatedMultimedia = {
        ...profileData.multimedia,
        [tipo === 'foto' ? 'fotos' : 'audio']: [
          ...(profileData.multimedia?.[tipo === 'foto' ? 'fotos' : 'audio'] || []),
          url
        ]
      };
  
      setProfileData(prev => ({
        ...prev,
        multimedia: updatedMultimedia
      }));
  
      await axios.put('http://localhost:5000/api/users/profile', {
        multimedia: updatedMultimedia
      });
  
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('No se pudo subir el archivo.');
    }
  };
  
  const handleDeleteFile = async (tipo, url, index) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/upload/${tipo}`, {
        data: { url }
      });
      
      // Actualiza el estado local eliminando el archivo
      const updatedMultimedia = {
        ...profileData.multimedia,
        [tipo === 'foto' ? 'fotos' : 'audio']: profileData.multimedia[tipo === 'foto' ? 'fotos' : 'audio']
          .filter((_, i) => i !== index)
      };
      
      setProfileData(prev => ({
        ...prev,
        multimedia: updatedMultimedia
      }));
      
      // Actualiza en el backend
      await axios.put('http://localhost:5000/api/users/profile', {
        multimedia: updatedMultimedia
      });
      
      alert('Archivo eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('No se pudo eliminar el archivo.');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = getUpdatedPayload();
    
    // Si no hay cambios, no se envía nada
    if (Object.keys(payload).length === 0) {
      alert("No se detectaron cambios para actualizar.");
      setIsEditing(false);
      return;
    }
    
    try {
      const response = await axios.put('http://localhost:5000/api/users/profile', payload);
      alert(response.data.msg);  // "Perfil actualizado exitosamente"
      setIsEditing(false);
      // Actualiza los datos originales con la nueva data del backend
      setOriginalData(prev => ({
        ...prev,
        ...payload,
        profile: { ...prev.profile, ...(payload.profile || {}) }
      }));
    } catch (error) {
      console.error("Error al actualizar:", error.response || error.message);
      alert(`Error: ${error.response?.data?.msg || error.message}`);
    }
  };

  // Renderiza la sección de postulaciones para músicos
  const renderPostulacionesSection = () => {
    if (!isOwnProfile || currentUser.role !== 'musician') return null;

    return (
      <div className="profile-section postulaciones-section">
        <div className="section-header">
          <h2>Mis Postulaciones</h2>
          <Link to="/ofertas" className="btn btn-primary btn-sm">
            Explorar ofertas
          </Link>
        </div>

        {loadingPostulaciones ? (
          <p className="loading-text">Cargando tus postulaciones...</p>
        ) : errorPostulaciones ? (
          <div className="error-message">{errorPostulaciones}</div>
        ) : postulaciones.length === 0 ? (
          <div className="empty-state">
            <p>Aún no te has postulado a ninguna oferta.</p>
            <Link to="/ofertas" className="btn btn-outline">
              Explorar ofertas disponibles
            </Link>
          </div>
        ) : (
          <div className="postulaciones-grid">
            {postulaciones.slice(0, 3).map(postulacion => {
              const estadoInfo = getEstadoInfo(postulacion.estado);
              return (
                <div key={postulacion._id} className="postulacion-card">
                  <div className="postulacion-header">
                    <h3>{postulacion.oferta?.titulo || 'Oferta no disponible'}</h3>
                    <span className={`estado-badge ${estadoInfo.class}`}>
                      {estadoInfo.text}
                    </span>
                  </div>
                  
                  <div className="postulacion-details">
                    <p>
                      <span className="label">Organizador:</span> {postulacion.oferta?.organizador?.name || 'No disponible'}
                    </p>
                    <p>
                      <span className="label">Fecha del evento:</span> {formatearFecha(postulacion.oferta?.fechaEvento)}
                    </p>
                  </div>
                  
                  <div className="postulacion-actions">
                    <Link to={`/ofertas/${postulacion.oferta?._id}`} className="btn btn-secondary btn-sm">
                      Ver oferta
                    </Link>
                    
                    {postulacion.estado === 'ACEPTADA' && (
                      <Link to={`/mensajes/${postulacion.oferta?.organizador?._id}`} className="btn btn-primary btn-sm">
                        Contactar
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            
            {postulaciones.length > 3 && (
              <Link to="/mis-postulaciones" className="ver-todas-link">
                Ver todas mis postulaciones ({postulaciones.length})
              </Link>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLightbox = () => {
    if (!lightboxImage) return null;
    
    return (
      <div className="lightbox" onClick={() => setLightboxImage(null)}>
        <div className="lightbox-content">
          <span className="lightbox-close">&times;</span>
          {lightboxTitle && <h3 className="lightbox-title">{lightboxTitle}</h3>}
          <img src={lightboxImage} alt="Vista ampliada" />
        </div>
      </div>
    );
  };

  const handleUploadProfilePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('foto', file);
  
    try {
      const res = await axios.post('http://localhost:5000/api/upload/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const url = res.data.url;
  
      // Actualiza el backend
      await axios.put('http://localhost:5000/api/users/profile', {
        multimedia: {
          ...profileData.multimedia,
          profilePhoto: url
        }
      });
  
      // Actualiza el estado local
      setProfileData(prev => ({
        ...prev,
        multimedia: {
          ...prev.multimedia,
          profilePhoto: url
        }
      }));
      alert("Foto de perfil actualizada");
  
    } catch (err) {
      console.error(err);
      alert("Error al subir la foto de perfil");
    }
  };
  

  const renderMusicianProfile = () => (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
        <img src={profileData.multimedia?.profilePhoto ? `http://localhost:5000${profileData.multimedia.profilePhoto}` : defaultProfile} />

        </div>
        <div className="profile-title">
          <h1>{profileData.name}</h1>
          <p className="profile-role">Músico</p>
          {isOwnProfile && !isEditing && (
            <button 
              className="btn btn-primary edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          )}
          {!isOwnProfile && currentUser?.role === 'organizer' && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/mensajes/${id}`)}
            >
              Contactar Músico
            </button>
          )}
        </div>
      </div>

      {isOwnProfile && isEditing ? (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-section">
          <div className="form-group">
            <label htmlFor="profilePhoto">Cambiar foto de perfil</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleUploadProfilePhoto(e)} 
            />
          </div>

            <h2>Información personal</h2>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.bio">Biografía</label>
              <textarea
                id="profile.bio"
                name="profile.bio"
                value={profileData.profile?.bio}
                onChange={handleInputChange}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.phone">Teléfono</label>
              <input
                type="tel"
                id="profile.phone"
                name="profile.phone"
                value={profileData.profile?.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.location">Ubicación</label>
              <input
                type="text"
                id="profile.location"
                name="profile.location"
                value={profileData.profile?.location}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Información musical</h2>
            <div className="form-group">
              <label htmlFor="profile.genres">Géneros musicales (separados por comas)</label>
              <input
                type="text"
                id="profile.genres"
                name="profile.genres"
                value={profileData.profile?.genres.join(', ')}
                onChange={(e) => handleArrayInputChange(e, 'profile', 'genres')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.instruments">Instrumentos (separados por comas)</label>
              <input
                type="text"
                id="profile.instruments"
                name="profile.instruments"
                value={profileData.profile?.instruments.join(', ')}
                onChange={(e) => handleArrayInputChange(e, 'profile', 'instruments')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.experience">Experiencia</label>
              <select
                id="profile.experience"
                name="profile.experience"
                value={profileData.profile?.experience}
                onChange={handleInputChange}
              >
                <option value="">Selecciona tu experiencia</option>
                <option value="Menos de 1 año">Menos de 1 año</option>
                <option value="1-3 años">1-3 años</option>
                <option value="3-5 años">3-5 años</option>
                <option value="5-10 años">5-10 años</option>
                <option value="Más de 10 años">Más de 10 años</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Multimedia</h2>
           
          <div className="form-group">
            <label htmlFor="foto">Subir Foto</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleUploadFile(e, 'foto')} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="audio">Subir Audio</label>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={(e) => handleUploadFile(e, 'audio')} 
            />
          </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Guardar cambios</button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-view">
          <div className="profile-section">
            <h2>Información personal</h2>
            <div className="profile-info">
              <div className="info-item">
                <h3>Email</h3>
                <p>{profileData.email}</p>
              </div>
              {profileData.profile?.phone && (
                <div className="info-item">
                  <h3>Teléfono</h3>
                  <p>{profileData.profile.phone}</p>
                </div>
              )}
              {profileData.profile?.location && (
                <div className="info-item">
                  <h3>Ubicación</h3>
                  <p>{profileData.profile.location}</p>
                </div>
              )}
            </div>
            {profileData.profile?.bio && (
              <div className="bio-section">
                <h3>Biografía</h3>
                <p>{profileData.profile.bio}</p>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Información musical</h2>
            <div className="profile-info">
              {profileData.profile?.genres.length > 0 && (
                <div className="info-item">
                  <h3>Géneros musicales</h3>
                  <div className="tags-container">
                    {profileData.profile.genres.map((genre, index) => (
                      <span key={index} className="tag">{genre}</span>
                    ))}
                  </div>
                </div>
              )}
              {profileData.profile?.instruments.length > 0 && (
                <div className="info-item">
                  <h3>Instrumentos</h3>
                  <div className="tags-container">
                    {profileData.profile.instruments.map((instrument, index) => (
                      <span key={index} className="tag">{instrument}</span>
                    ))}
                  </div>
                </div>
              )}
              {profileData.profile?.experience && (
                <div className="info-item">
                  <h3>Experiencia</h3>
                  <p>{profileData.profile.experience}</p>
                </div>
              )}
            </div>
          </div>

          {/* Renderiza la sección de postulaciones solo para el perfil propio */}
          {renderPostulacionesSection()}

          <div className="profile-section">
            <h2>Mi Galería Fotográfica</h2>
            {profileData.multimedia?.fotos.length > 0 ? (
              <div className="gallery-container">
                {profileData.multimedia.fotos.map((foto, index) => (
                  <div key={index} className="gallery-item">
                    <img 
                      src={`http://localhost:5000${foto}`} 
                      alt={`Foto ${index + 1}`} 
                      onClick={() => {
                        setLightboxImage(`http://localhost:5000${foto}`);
                        setLightboxTitle(`Fotografía ${index + 1} - ${profileData.name}`);
                      }}
                    />
                    {isOwnProfile && (
                      <button 
                        className="delete-media-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile('foto', foto, index);
                        }}
                        title="Eliminar foto"
                      >
                        <span>&times;</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-gallery-message">No hay fotos disponibles</p>
            )}
          </div>

          <div className="profile-section">
            <h2>Mi Biblioteca de Audio</h2>
            {profileData.multimedia?.audio.length > 0 ? (
              <div className="audio-container">
                {profileData.multimedia.audio.map((audioUrl, index) => (
                  <div key={index} className="audio-item">
                    <div className="audio-header">
                      <h3>Pista {index + 1}</h3>
                      {isOwnProfile && (
                        <button 
                          className="delete-audio-btn" 
                          onClick={() => handleDeleteFile('audio', audioUrl, index)}
                          title="Eliminar audio"
                        >
                          <span>&times;</span>
                        </button>
                      )}
                    </div>
                    <audio controls src={`http://localhost:5000${audioUrl}`}></audio>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-audio-message">No hay pistas de audio disponibles</p>
            )}
          </div>

        </div>
      )}
    </div>
  );

  const renderOrganizerProfile = () => (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
        <img src={profileData.multimedia?.profilePhoto ? `http://localhost:5000${profileData.multimedia.profilePhoto}` : defaultProfile} />

        </div>
        <div className="profile-title">
          <h1>{profileData.name}</h1>
          <p className="profile-role">Organizador</p>
          {isOwnProfile && !isEditing && (
            <button 
              className="btn btn-primary edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          )}
          {!isOwnProfile && currentUser?.role === 'musician' && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/mensajes/${id}`)}
            >
              Contactar Organizador
            </button>
          )}
        </div>
      </div>

      {isOwnProfile && isEditing ? (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-section">
          <div className="form-group">
  <label htmlFor="profilePhoto">Cambiar foto de perfil</label>
  <input 
    type="file" 
    accept="image/*"
    onChange={(e) => handleUploadProfilePhoto(e)} 
  />
</div>

            <h2>Información personal</h2>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.bio">Descripción</label>
              <textarea
                id="profile.bio"
                name="profile.bio"
                value={profileData.profile?.bio}
                onChange={handleInputChange}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.phone">Teléfono</label>
              <input
                type="tel"
                id="profile.phone"
                name="profile.phone"
                value={profileData.profile?.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.location">Ubicación</label>
              <input
                type="text"
                id="profile.location"
                name="profile.location"
                value={profileData.profile?.location}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Información del local/evento</h2>
            <div className="form-group">
              <label htmlFor="profile.venueName">Nombre del local</label>
              <input
                type="text"
                id="profile.venueName"
                name="profile.venueName"
                value={profileData.profile?.venueName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.venueType">Tipo de local</label>
              <select
                id="profile.venueType"
                name="profile.venueType"
                value={profileData.profile?.venueType}
                onChange={handleInputChange}
              >
                <option value="">Selecciona un tipo</option>
                <option value="Restaurante">Restaurante</option>
                <option value="Bar">Bar</option>
                <option value="Sala de conciertos">Sala de conciertos</option>
                <option value="Teatro">Teatro</option>
                <option value="Eventos privados">Eventos privados</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="profile.capacity">Capacidad</label>
              <input
                type="number"
                id="profile.capacity"
                name="profile.capacity"
                value={profileData.profile?.capacity}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile.eventTypes">Tipos de eventos (separados por comas)</label>
              <input
                type="text"
                id="profile.eventTypes"
                name="profile.eventTypes"
                value={profileData.profile?.eventTypes.join(', ')}
                onChange={(e) => handleArrayInputChange(e, 'profile', 'eventTypes')}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Multimedia</h2>
            <div className="form-group">
              <label htmlFor="foto">Subir Foto</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleUploadFile(e, 'foto')} 
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Guardar cambios</button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-view">
          <div className="profile-section">
          <h2>Información personal</h2>
            <div className="profile-info">
              <div className="info-item">
                <h3>Email</h3>
                <p>{profileData.email}</p>
              </div>
              {profileData.profile?.phone && (
                <div className="info-item">
                  <h3>Teléfono</h3>
                  <p>{profileData.profile.phone}</p>
                </div>
              )}
              {profileData.profile?.location && (
                <div className="info-item">
                  <h3>Ubicación</h3>
                  <p>{profileData.profile.location}</p>
                </div>
              )}
            </div>
            {profileData.profile?.bio && (
              <div className="bio-section">
                <h3>Descripción</h3>
                <p>{profileData.profile.bio}</p>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Información del local/evento</h2>
            <div className="profile-info">
              {profileData.profile?.venueName && (
                <div className="info-item">
                  <h3>Nombre del local</h3>
                  <p>{profileData.profile.venueName}</p>
                </div>
              )}
              {profileData.profile?.venueType && (
                <div className="info-item">
                  <h3>Tipo de local</h3>
                  <p>{profileData.profile.venueType}</p>
                </div>
              )}
              {profileData.profile?.capacity && (
                <div className="info-item">
                  <h3>Capacidad</h3>
                  <p>{profileData.profile.capacity} personas</p>
                </div>
              )}
              {profileData.profile?.eventTypes.length > 0 && (
                <div className="info-item">
                  <h3>Tipos de eventos</h3>
                  <div className="tags-container">
                    {profileData.profile.eventTypes.map((type, index) => (
                      <span key={index} className="tag">{type}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          

          <div className="profile-section">
            <h2>Galería del Local</h2>
            {profileData.multimedia?.fotos.length > 0 ? (
              <div className="gallery-container">
                {profileData.multimedia.fotos.map((foto, index) => (
                  <div key={index} className="gallery-item">
                    <img 
                      src={`http://localhost:5000${foto}`} 
                      alt={`Foto ${index + 1}`} 
                      onClick={() => {
                        setLightboxImage(`http://localhost:5000${foto}`);
                        setLightboxTitle(`${profileData.profile?.venueName || 'Local'} - Foto ${index + 1}`);
                      }}
                    />
                    {isOwnProfile && (
                      <button 
                        className="delete-media-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile('foto', foto, index);
                        }}
                        title="Eliminar foto"
                      >
                        <span>&times;</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-gallery-message">No hay fotos disponibles</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Renderiza el perfil basado en el rol del usuario
  const renderProfileBasedOnRole = () => {
    if (loadingProfile) {
      return <div className="loading-container">Cargando perfil...</div>;
    }

    if (profileError) {
      return <div className="error-container">{profileError}</div>;
    }

    if (profileData.role === 'musician') {
      return renderMusicianProfile();
    } else if (profileData.role === 'organizer') {
      return renderOrganizerProfile();
    } else {
      return <div className="error-container">Tipo de perfil no reconocido</div>;
    }
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        {renderProfileBasedOnRole()}
        {renderLightbox()}
      </div>
    </>
  );
};

export default Profile;
