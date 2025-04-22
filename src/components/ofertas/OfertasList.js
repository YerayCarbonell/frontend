// src/components/ofertas/OfertasList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Ofertas.css';
import Navbar from '../layout/Navbar';
import { axiosInstance } from '../../context/AuthContext';

const OfertasList = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    genero: '',
    ubicacion: '',
    orden: ''
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const ofertasPorPagina = 6;

  const { currentUser, isAuthenticated } = useAuth();

  const cargarOfertas = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.genero) queryParams.append('genero', params.genero);
      if (params.ubicacion) queryParams.append('ubicacion', params.ubicacion);
      if (params.orden) queryParams.append('orden', params.orden);

      const res = await axiosInstance.get(`/ofertas?${queryParams.toString()}`);
      let ofertasOrdenadas = res.data;

      switch (params.orden) {
        case 'fechaAsc':
          ofertasOrdenadas.sort((a, b) => new Date(a.fechaEvento) - new Date(b.fechaEvento));
          break;
        case 'fechaDesc':
          ofertasOrdenadas.sort((a, b) => new Date(b.fechaEvento) - new Date(a.fechaEvento));
          break;
        default:
          break;
      }

      setOfertas(ofertasOrdenadas);
      setError('');
      setPaginaActual(1);
    } catch (err) {
      setError('Error al cargar las ofertas. Por favor, inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOfertas();
  }, []);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    cargarOfertas(filtros);
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const yaPostulado = (oferta) => {
    if (!isAuthenticated || !currentUser || currentUser.role !== 'musician') return false;
    if (!oferta.postulaciones || !Array.isArray(oferta.postulaciones)) return false;
    return oferta.postulaciones.some(p => {
      if (typeof p === 'object') return p.musician === currentUser._id;
      return p === currentUser._id;
    });
  };

  const indiceInicio = (paginaActual - 1) * ofertasPorPagina;
  const indiceFin = indiceInicio + ofertasPorPagina;
  const ofertasPaginadas = ofertas.slice(indiceInicio, indiceFin);

  const totalPages = Math.ceil(ofertas.length / ofertasPorPagina);

  const generatePageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    const leftSibling = Math.max(paginaActual - 1, 2);
    const rightSibling = Math.min(paginaActual + 1, totalPages - 1);

    if (paginaActual - 1 > 2) pages.push('...');

    for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);

    if (totalPages - paginaActual > 2) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="full-window">
      <Navbar />
      <div className="main-content-padding">
        <div className="ofertas-container">
          <div className="ofertas-header">
            <h1>Ofertas para músicos</h1>
            {isAuthenticated && currentUser?.role === 'organizador' && (
              <Link to="/crear-oferta" className="btn btn-primary">
                Publicar nueva oferta
              </Link>
            )}
          </div>

          <div className="filtros-container">
            <form onSubmit={aplicarFiltros} className="filtros-form">
              <div className="filtro-group">
                <label htmlFor="orden">Ordenar por:</label>
                <select
                  id="orden"
                  name="orden"
                  value={filtros.orden}
                  onChange={handleFiltroChange}
                >
                  <option value="">Por defecto</option>
                  <option value="fechaAsc">Fecha ascendente</option>
                  <option value="fechaDesc">Fecha descendente</option>
                </select>
              </div>

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

          {loading ? (
            <div className="loading">Cargando ofertas...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : ofertas.length === 0 ? (
            <div className="no-ofertas">
              No se encontraron ofertas con los filtros seleccionados.
            </div>
          ) : (
            <>
              <div className="ofertas-grid">
                {ofertasPaginadas.map(oferta => (
                  <div key={oferta._id} className="oferta-card">
                    <h3 className="oferta-titulo">{oferta.titulo}</h3>
                    <p className="oferta-organizador">
                      <span className="label">Organizador:</span> {oferta.organizer?.name || 'Anónimo'}
                    </p>
                    <p className="oferta-local">
                      <span className="label">Local:</span> {oferta.organizer?.profile?.venueName || 'No especificado'}
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
                      <p>{oferta.descripcion?.length > 100
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

              {totalPages > 1 && (
                <div className="paginacion">
                  {generatePageNumbers().map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={index} className="ellipsis">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => setPaginaActual(page)}
                        className={`btn ${paginaActual === page ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfertasList;
