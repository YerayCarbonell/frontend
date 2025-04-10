// src/components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';

const NotFound = () => {
  return (
    <div>
      <Navbar /> {/* Ahora Navbar está definido */}
      <div className="not-found">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>La página que estás buscando no existe o ha sido movida.</p>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    </div>
  );
};

export default NotFound;