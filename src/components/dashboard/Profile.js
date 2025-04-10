// src/components/dashboard/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import './Profile.css';
import axios from 'axios';
// Importamos la imagen por defecto
import defaultProfile from '../../assets/images/default-profile.png';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    // Establece el título del documento
    document.title = `Mi Perfil | MúsicaConnect`;
    
    // Inicializa profileData y originalData desde currentUser
    if (currentUser) {
      const initData = {
        name: currentUser.name || '',
        email: currentUser.email || '',
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
          fotos: currentUser.multimedia?.fotos || [],
          audio: currentUser.multimedia?.audio || []
        }
      };

      setProfileData(initData);
      setOriginalData(initData); // Guardamos una copia de los datos originales
    }
  }, [currentUser]);

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

    // Compara el nombre
    if (profileData.name !== originalData.name) {
      payload.name = profileData.name;
    }

    // Compara el email
    if (profileData.email !== originalData.email) {
      payload.email = profileData.email;
    }

    // Compara cada propiedad del objeto profile
    const updatedProfile = {};
    for (const key in profileData.profile) {
      // Para arrays, se compara convirtiéndolos a string
      if (Array.isArray(profileData.profile[key])) {
        if (profileData.profile[key].join(',') !== originalData.profile[key].join(',')) {
          updatedProfile[key] = profileData.profile[key];
        }
      } else if (profileData.profile[key] !== originalData.profile[key]) {
        updatedProfile[key] = profileData.profile[key];
      }
    }
    if (Object.keys(updatedProfile).length > 0) {
      payload.profile = updatedProfile;
    }

    return payload;
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

  const renderMusicianProfile = () => (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={profileData.multimedia?.fotos[0] || defaultProfile.uri} 
            alt={profileData.name} 
          />
        </div>
        <div className="profile-title">
          <h1>{profileData.name}</h1>
          <p className="profile-role">Músico</p>
          {!isEditing && (
            <button 
              className="btn btn-primary edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-section">
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
            <p>Funcionalidad para subir fotos y audio estará disponible próximamente</p>
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

          <div className="profile-section">
            <h2>Galería</h2>
            {profileData.multimedia?.fotos.length > 0 ? (
              <div className="gallery-container">
                {profileData.multimedia.fotos.map((foto, index) => (
                  <div key={index} className="gallery-item">
                    <img src={foto} alt={`Foto ${index + 1}`} />
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay fotos disponibles</p>
            )}
          </div>

          {profileData.multimedia?.audio.length > 0 && (
            <div className="profile-section">
              <h2>Audio</h2>
              <div className="audio-container">
                {profileData.multimedia.audio.map((audioUrl, index) => (
                  <div key={index} className="audio-item">
                    <h3>Pista {index + 1}</h3>
                    <audio controls src={audioUrl}></audio>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderOrganizerProfile = () => (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={profileData.multimedia?.fotos[0] || defaultProfile} 
            alt={profileData.name} 
          />
        </div>
        <div className="profile-title">
          <h1>{profileData.name}</h1>
          <p className="profile-role">Organizador</p>
          {!isEditing && (
            <button 
              className="btn btn-primary edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-section">
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
            <p>Funcionalidad para subir fotos estará disponible próximamente</p>
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
                    {profileData.profile.eventTypes.map((eventType, index) => (
                      <span key={index} className="tag">{eventType}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h2>Galería</h2>
            {profileData.multimedia?.fotos.length > 0 ? (
              <div className="gallery-container">
                {profileData.multimedia.fotos.map((foto, index) => (
                  <div key={index} className="gallery-item">
                    <img src={foto} alt={`Foto ${index + 1}`} />
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay fotos disponibles</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="main-content">
        {currentUser?.role === 'musician' ? renderMusicianProfile() : renderOrganizerProfile()}
      </div>
    </div>
  );
};

export default Profile;
