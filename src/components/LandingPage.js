// src/components/LandingPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './LandingPage.css';
import Navbar from './layout/Navbar'; // Importamos el componente Navbar
import heroImage from '../assets/images/hero-image.jpg';
import musician from '../assets/images/musician1.jpg';
import organizer from '../assets/images/organizer1.jpg';
import { useAuth } from '../context/AuthContext'; // Usamos el mismo hook que usa Navbar

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('musicians');
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth(); // Usamos el hook de autenticación, igual que Navbar

  // Handle anchor links and smooth scroll
  const scrollToSection = (sectionId, e) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      // Considerar la altura del header fijo al hacer scroll
      const headerOffset = 80; // Altura definida en tu CSS (--header-height)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
      });
      // Update URL without refreshing the page to maintain history
      window.history.pushState(null, '', `/#${sectionId}`);
    }
  };

  // Handle hash changes and scroll to section on page load
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
            // Considerar la altura del header fijo al hacer scroll inicial
            const headerOffset = 80; // Altura definida en tu CSS (--header-height)
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

             window.scrollTo({
                 top: offsetPosition,
                 behavior: 'smooth'
             });
        }
      }, 100); // Un pequeño retraso puede ser necesario
    }
  }, [location]);

  // Determinar el tipo de usuario (músico u organizador)
  const isMusician = currentUser?.role === 'musico';
  const isOrganizer = currentUser?.role === 'organizador';
  
  // Procesamos las URLs de las imágenes
  const heroImageUrl = typeof heroImage === 'object' && heroImage.uri ? heroImage.uri : heroImage;
  const musicianImageUrl = typeof musician === 'object' && musician.uri ? musician.uri : musician;
  const organizerImageUrl = typeof organizer === 'object' && organizer.uri ? organizer.uri : organizer;

  return (
    <div className="landing-page">
      {/* Usamos el componente Navbar importado en lugar del header estático */}
      <Navbar />

      {/* Hero Section - personalizado según autenticación */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            {isAuthenticated ? (
              // --- Contenido Hero para usuario AUTENTICADO ---
              <>
                <h1>¡Bienvenido de nuevo, {currentUser?.name || 'Usuario'}!</h1>
                <p>
                  {isMusician
                    ? 'Explora las últimas ofertas y gestiona tus postulaciones.'
                    : 'Encuentra el talento perfecto o gestiona tus eventos publicados.'}
                </p>
                <div className="hero-buttons">
                  {isMusician ? (
                    <>
                      <Link to="/ofertas" className="btn btn-primary btn-lg">Ver Ofertas</Link>
                      <Link to="/profile" className="btn btn-secondary btn-lg">Mi Perfil</Link>
                      <Link to="/mis-postulaciones" className="btn btn-secondary btn-lg">Mis Postulaciones</Link>
                    </>
                  ) : ( // Es Organizador
                    <>
                      <Link to="/crear-oferta" className="btn btn-primary btn-lg">Publicar Oferta</Link>
                      <Link to="/profile" className="btn btn-secondary btn-lg">Mi Perfil</Link>
                      <Link to="/mis-ofertas" className="btn btn-secondary btn-lg">Gestionar Ofertas</Link>
                    </>
                  )}
                </div>
              </>
            ) : (
               // --- Contenido Hero para usuario NO AUTENTICADO ---
              <>
                <h1>Conectando talento musical con oportunidades reales</h1>
                <p>La plataforma que une a músicos con organizadores de eventos, restaurantes y locales que buscan música en directo</p>
                <div className="hero-buttons">
                  <Link to="/register?type=musico" className="btn btn-primary btn-lg">Soy Músico</Link>
                  <Link to="/register?type=organizador" className="btn btn-secondary btn-lg">Soy Organizador</Link>
                </div>
              </>
            )}
          </div>
          <div className="hero-image">
            {/* Usamos la URL procesada */}
            <img src={heroImageUrl} alt="Músicos tocando en directo" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works" id="como-funciona">
        <div className="container">
          <h2 className="section-title">¿Cómo Funciona?</h2>

          <div className="tabs">
            <div className="tab-buttons">
              <button
                className={activeTab === 'musicians' ? 'active' : ''}
                onClick={() => setActiveTab('musicians')}
              >
                Para Músicos
              </button>
              <button
                className={activeTab === 'organizers' ? 'active' : ''}
                onClick={() => setActiveTab('organizers')}
              >
                Para Organizadores
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'musicians' ? (
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <h3>Crea tu perfil artístico</h3>
                    <p>Registra tu perfil como músico, añade tus habilidades, experiencia, fotos, vídeos y ejemplos de tu trabajo.</p>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <h3>Encuentra oportunidades</h3>
                    <p>Explora las ofertas publicadas por organizadores de eventos, restaurantes y locales.</p>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <h3>Postúlate y conecta</h3>
                    <p>Aplica a las ofertas que te interesen y comunícate directamente con los organizadores.</p>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <h3>Actúa y recibe valoraciones</h3>
                    <p>Después de cada actuación, recibe valoraciones que mejorarán tu perfil y visibilidad.</p>
                  </div>
                </div>
              ) : (
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <h3>Registra tu local o evento</h3>
                    <p>Crea tu perfil como organizador, describe tu local, tipo de eventos y público habitual.</p>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <h3>Publica tus necesidades</h3>
                    <p>Crea ofertas especificando el tipo de música, duración, fechas y condiciones.</p>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <h3>Selecciona a los mejores talentos</h3>
                    <p>Revisa los perfiles de los músicos que se postulan y selecciona el que mejor se adapte.</p>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <h3>Evalúa la experiencia</h3>
                    <p>Después del evento, valora a los músicos para ayudar a otros organizadores.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits" id="beneficios">
        <div className="container">
          <h2 className="section-title">Beneficios</h2>

          <div className="benefits-container">
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Búsqueda Simplificada</h3>
              <p>Encuentra el talento musical o la oportunidad perfecta en minutos, no en días.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Confianza</h3>
              <p>Sistema de valoraciones y perfiles verificados que garantizan profesionalidad.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>Comunicación Directa</h3>
              <p>Mensaje directo entre músicos y organizadores sin intermediarios.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-percentage"></i>
              </div>
              <h3>Sin Comisiones</h3>
              <p>Plataforma sin comisiones por contratación, solo conectamos talento con oportunidades.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonios">
        <div className="container">
          <h2 className="section-title">Lo que dicen nuestros usuarios</h2>

          <div className="testimonial-cards">
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src={musicianImageUrl} alt="Músico" />
              </div>
              <div className="testimonial-text">
                <p>"Gracias a MúsicaConnect he conseguido actuaciones regulares en varios restaurantes de mi ciudad. Ha cambiado completamente mi carrera musical."</p>
                <h4>Carlos Martínez</h4>
                <p className="testimonial-role">Guitarrista & Cantante</p>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src={organizerImageUrl} alt="Organizador" />
              </div>
              <div className="testimonial-text">
                <p>"Encontrar músicos de calidad para nuestro restaurante nunca había sido tan fácil. Ahora tenemos música en vivo todos los fines de semana."</p>
                <h4>Elena Gómez</h4>
                <p className="testimonial-role">Gerente de Restaurante</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - personalizado según autenticación */}
      <section className="cta">
        <div className="container">
          {isAuthenticated ? (
             // --- Contenido CTA para usuario AUTENTICADO ---
            <>
              <h2>¿Quieres sacar más partido a tu cuenta?</h2>
              <p>Explora las funcionalidades que hemos diseñado específicamente para ti</p>
              <div className="cta-buttons">
                {isMusician ? (
                  <>
                    <Link to="/ofertas" className="btn btn-primary btn-lg">Explorar Ofertas</Link>
                    <Link to="/profile" className="btn btn-secondary btn-lg">Completar mi Perfil</Link>
                  </>
                ) : ( // Es Organizador
                  <>
                    <Link to="/crear-oferta" className="btn btn-primary btn-lg">Crear Oferta</Link>
                    <Link to="/explorar-musicos" className="btn btn-secondary btn-lg">Explorar Músicos</Link>
                  </>
                )}
              </div>
            </>
          ) : (
             // --- Contenido CTA para usuario NO AUTENTICADO ---
            <>
              <h2>¿Listo para empezar?</h2>
              <p>Únete a la comunidad que está revolucionando la música en directo</p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">Crear una cuenta</Link>
                <a href="#como-funciona" onClick={(e) => scrollToSection('como-funciona', e)} className="btn btn-secondary btn-lg">Saber más</a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h2>MúsicaConnect</h2>
              <p>Conectando música y oportunidades</p>
              <div className="social-icons">
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h3>Navegación</h3>
                <ul>
                  <li><a href="#como-funciona" onClick={(e) => scrollToSection('como-funciona', e)}>Cómo Funciona</a></li>
                  <li><a href="#beneficios" onClick={(e) => scrollToSection('beneficios', e)}>Beneficios</a></li>
                  <li><a href="#testimonios" onClick={(e) => scrollToSection('testimonios', e)}>Testimonios</a></li>
                  {/* Mostrar enlaces adicionales si está logueado */}
                  {isAuthenticated && (
                    <>
                      <li><Link to="/ofertas">Ofertas</Link></li>
                      <li><Link to="/profile">Mi Perfil</Link></li>
                    </>
                  )}
                </ul>
              </div>

              <div className="footer-column">
                <h3>Legal</h3>
                <ul>
                  <li><Link to="/terms">Términos y Condiciones</Link></li>
                  <li><Link to="/privacy">Política de Privacidad</Link></li>
                  <li><Link to="/cookies">Política de Cookies</Link></li>
                </ul>
              </div>

              <div className="footer-column">
                <h3>Contacto</h3>
                <ul>
                  <li><a href="mailto:info@musicaconnect.es">info@musicaconnect.es</a></li>
                  <li><a href="tel:+34900000000">+34 900 000 000</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} MúsicaConnect. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;