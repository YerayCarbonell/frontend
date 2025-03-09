// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.2.2:5000/api', // Ajusta la URL según tu backend
  timeout: 10000,
});

export default api;
