// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import ProtectedRoute from './src/components/routing/ProtectedRoute';
import PublicRoute from './src/components/routing/PublicRoute';
import Dashboard from './src/components/dashboard/Dashboard';
import Profile from './src/components/dashboard/Profile';
import Login from './src/components/auth/Login';
import Register from './src/components/auth/Register';
import LandingPage from './src/components/LandingPage';
import NotFound from './src/components/NotFound';

// Componentes de ofertas
import OfertasList from './src/components/ofertas/OfertasList';
import OfertaDetail from './src/components/ofertas/OfertaDetail';
import OfertaForm from './src/components/ofertas/OfertaForm';
import PostularForm from './src/components/ofertas/PostularForm';
import PostulacionesList from './src/components/ofertas/PostulacionesList';
import MisOfertas from './src/components/ofertas/MisOfertas';
import MisPostulaciones from './src/components/ofertas/MisPostulaciones';
import Mensajes from './src/components/mensajes/Mensajes';
import ListaMensajes from './src/components/mensajes/ListaMensajes';

import HistorialEventos from './src/components/historial/HistorialEventos';

import PagoForm from './src/components/pagos/PagoForm';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
console.log("🌍 process.env:", process.env);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Rutas públicas */}
          <Route path="/login" element={<PublicRoute />}>
            <Route index element={<Login />} />
          </Route>
          
          <Route path="/register" element={<PublicRoute />}>
            <Route index element={<Register />} />
          </Route>
          
          {/* Rutas de ofertas públicas */}
          <Route path="/ofertas" element={<OfertasList />} />
          <Route path="/ofertas/:id" element={<OfertaDetail />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/perfil/:id" element={<Profile />} />
            <Route path="/mensajes" element={<ListaMensajes />} />
            <Route path="/mensajes/:userId" element={<Mensajes />} />
            <Route path="/historial" element={<HistorialEventos />} />
          </Route>

          {/* Rutas para músicos */}
          <Route element={<ProtectedRoute requiredRole="musician" />}>
            <Route path="/ofertas/:id/postular" element={<PostularForm />} />
            <Route path="/mis-postulaciones" element={<MisPostulaciones />} />
          </Route>

          {/* Rutas para organizadores */}
          <Route element={<ProtectedRoute requiredRole="organizer" />}>
            <Route path="/crear-oferta" element={<OfertaForm />} />
            <Route path="/ofertas/:id/editar" element={<OfertaForm />} />
            <Route path="/ofertas/:id/postulaciones" element={<PostulacionesList />} />
            <Route path="/mis-ofertas" element={<MisOfertas />} />
            <Route path="/pagos/:id/:postulacionId" element={<PagoForm />} />


          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={5000} />

      </AuthProvider>
    </Router>
  );
}

export default App;