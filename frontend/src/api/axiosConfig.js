import axios from 'axios';
import { API_URL } from './config';
import { getAccessToken } from './session';

// Creamos una instancia configurada de Axios
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor: Antes de que salga CUALQUIER petición, le pegamos el Token
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;