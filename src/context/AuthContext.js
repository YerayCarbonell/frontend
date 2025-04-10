// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Configurar axios para enviar el token en cada solicitud
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Comprobar si hay un usuario autenticado al cargar la aplicación
  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        try {
          // Realiza la llamada al endpoint que devuelve el usuario autenticado.
          const res = await axios.get('http://localhost:5000/api/users/me');
          setCurrentUser(res.data);
          // Actualiza el usuario en localStorage para mantener la consistencia.
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          // Si el token ya no es válido o se produce un error, limpia la información.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };
  
    checkUser();
  }, [token]);

  // Función para login
  const login = async (formData) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', formData);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setCurrentUser(res.data.user);
    return res.data;
  };

  // Función para registro
  const register = async (formData) => {
    const res = await axios.post('http://localhost:5000/api/auth/register', formData);
    return res.data;
  };

  // Función para logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    navigate('/');
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;