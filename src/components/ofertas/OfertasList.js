// src/components/ofertas/OfertasList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Ofertas.css';
import Navbar from '../layout/Navbar';

const OfertasList = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    genero: '',
    ubicacion: ''
  });
  const { currentUser, isAuthenticated } = useAuth();
  
  // Función para cargar las ofertas
  const cargarOfertas = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.genero) queryParams.append('genero', params.genero);
      if (params.ubicacion) queryParams.append('ubicacion', params.ubicacion);
      
      const res = await axios.get(`http://localhost:5000/api/ofertas?${queryParams.toString()}`);
      setOfertas(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las ofertas. Por favor, inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar ofertas al montar el componente
  useEffect(() => {
    cargarOfertas();
  }, []);

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  // Aplicar filtros
  const aplicarFiltros = (e) => {
    e.preventDefault();
    cargarOfertas(filtros);
  };

  // Formatear la fecha para mostrarla
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Determinar si el usuario actual ya se ha postulado a una oferta
  const yaPostulado = (oferta) => {
    if (!isAuthenticated || !currentUser || currentUser.role !== 'musician') return false;
    return oferta.postulaciones?.some(p => p.musico === currentUser._id);
  };

  return (
    <div>
      <Navbar />
      <div className="ofertas-container">
        <div className="ofertas-header">
          <h1>Ofertas para Músicos</h1>
          {isAuthenticated && currentUser?.role === 'organizador' && (
            <Link to="/crear-oferta" className="btn btn-primary">
              Publicar nueva oferta
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="filtros-container">
          <form onSubmit={aplicarFiltros} className="filtros-form">
            <div className="filtro-group">
              <label htmlFor="genero">Género musical:</label>
              <select
                id="genero"
                name="genero"
                value={filtros.genero}
                onChange={handleFiltroChange}
              >
                <option value="">Todos los géneros</option>
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

            <div className="filtro-group">
              <label htmlFor="ubicacion">Ubicación:</label>
              <select
                id="ubicacion"
                name="ubicacion"
                value={filtros.ubicacion}
                onChange={handleFiltroChange}
              >
                <option value="">Todas las ubicaciones</option>
                <option value="Madrid">Madrid</option>
                <option value="Barcelona">Barcelona</option>
                <option value="Valencia">Valencia</option>
                <option value="Sevilla">Sevilla</option>
                <option value="Bilbao">Bilbao</option>
                <option value="Málaga">Málaga</option>
                <option value="Otra">Otra</option>
              </select>
            </div>

            <button type="submit" className="btn btn-secondary">
              Aplicar filtros
            </button>
          </form>
        </div>

        {/* Estado de carga */}
        {loading ? (
          <div className="loading">Cargando ofertas...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : ofertas.length === 0 ? (
          <div className="no-ofertas">
            No se encontraron ofertas con los filtros seleccionados.
          </div>
        ) : (
          <div className="ofertas-grid">
            {ofertas.map(oferta => (
              <div key={oferta._id} className="oferta-card">
                <h3 className="oferta-titulo">{oferta.titulo}</h3>
                <p className="oferta-organizador">
                  <span className="label">Organizador:</span> {oferta.organizador?.name || 'Anónimo'}
                </p>
                <p className="oferta-local">
                  <span className="label">Local:</span> {oferta.organizador?.profile?.local || 'No especificado'}
                </p>
                <p className="oferta-fecha">
                  <span className="label">Fecha del evento:</span> {oferta.fechaEvento ? formatearFecha(oferta.fechaEvento) : 'Por determinar'}
                </p>
                <p className="oferta-genero">
                  <span className="label">Género musical:</span> {oferta.genero || 'No especificado'}
                </p>
                <p className="oferta-ubicacion">
                  <span className="label">Ubicación:</span> {oferta.ubicacion || 'No especificada'}
                </p>
                <div className="oferta-descripcion">
                  <p>{oferta.descripcion.length > 100 
                    ? `${oferta.descripcion.substring(0, 100)}...` 
                    : oferta.descripcion}
                  </p>
                </div>
                <div className="oferta-actions">
                  <Link to={`/ofertas/${oferta._id}`} className="btn btn-secondary">
                    Ver detalles
                  </Link>
                  
                  {isAuthenticated && currentUser?.role === 'musician' && !yaPostulado(oferta) && (
                    <Link to={`/ofertas/${oferta._id}/postular`} className="btn btn-primary">
                      Postularme
                    </Link>
                  )}
                  
                  {isAuthenticated && currentUser?.role === 'musician' && yaPostulado(oferta) && (
                    <span className="postulado-badge">Ya postulado</span>
                  )}
                  
                  {isAuthenticated && currentUser?.role === 'organizador' && oferta.organizador?._id === currentUser._id && (
                    <>
                      <Link to={`/ofertas/${oferta._id}/editar`} className="btn btn-secondary">
                        Editar
                      </Link>
                      <Link to={`/ofertas/${oferta._id}/postulaciones`} className="btn btn-secondary">
                        Ver postulaciones
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default OfertasList;