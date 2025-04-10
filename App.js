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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Rutas públicas (accesibles sin estar autenticado) */}
          <Route path="/login" element={<PublicRoute />}>
            <Route index element={<Login />} />
          </Route>
          
          <Route path="/register" element={<PublicRoute />}>
            <Route index element={<Register />} />
          </Route>
          
          {/* Rutas de Ofertas (accesibles para todos) */}
          <Route path="/ofertas" element={<OfertasList />} />
          <Route path="/ofertas/:id" element={<OfertaDetail />} />

          {/* Rutas protegidas (requieren autenticación) */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
          </Route>
          
           {/* Rutas para músicos */}
           <Route path="/ofertas/:id/postular" element={
            <ProtectedRoute requiredRole="musician">
              <PostularForm />
            </ProtectedRoute>
          } />
          <Route path="/mis-postulaciones" element={
            <ProtectedRoute requiredRole="musician">
              <MisPostulaciones />
            </ProtectedRoute>
          } />

           {/* Rutas para organizadores */}
           <Route path="/crear-oferta" element={
            <ProtectedRoute requiredRole="organizador">
              <OfertaForm />
            </ProtectedRoute>
          } />
          <Route path="/ofertas/:id/editar" element={
            <ProtectedRoute requiredRole="organizador">
              <OfertaForm />
            </ProtectedRoute>
          } />
          <Route path="/ofertas/:id/postulaciones" element={
            <ProtectedRoute requiredRole="organizador">
              <PostulacionesList />
            </ProtectedRoute>
          } />
          <Route path="/mis-ofertas" element={
            <ProtectedRoute requiredRole="organizador">
              <MisOfertas />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={<ProtectedRoute />}>
            <Route index element={<Profile />} />
          </Route>
          
          {/* Ruta de 404 para manejar rutas no encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;