import axios from 'axios';
import { API_URL } from './config';
import { getAccessToken } from './session';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  console.log("Token recuperado por el interceptor:", token); // <-- AGREGÁ ESTO
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("No se encontró token en AsyncStorage"); // <-- AGREGÁ ESTO
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;