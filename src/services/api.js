// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Ajusta la URL según tu backend
  timeout: 10000,
});

export default api;
