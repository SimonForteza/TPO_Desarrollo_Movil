import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves para el storage
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const PENDING_KEY = 'pendingRegistrationUsuarioId';

// Guardamos los tokens en memoria Y en el disco
export async function setTokens(accessToken, refreshToken) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

// Recuperamos los tokens del disco cuando la app inicia
export async function getAccessToken() {
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

// Borramos todo al cerrar sesión
export async function clearTokens() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}

// --- Gestión de registro pendiente ---
export async function setPendingRegistration(usuarioId) {
  await AsyncStorage.setItem(PENDING_KEY, String(usuarioId));
}

export async function getPendingRegistration() {
  return await AsyncStorage.getItem(PENDING_KEY);
}

export async function clearPendingRegistration() {
  await AsyncStorage.removeItem(PENDING_KEY);
}

// --- Datos del usuario logueado (en memoria) ---
let _userData = null;
export function setUserData(data) { _userData = data; }
export function getUserData() { return _userData; }
export function clearUserData() { _userData = null; }

// --- Guard de autenticación ---
// Muestra alerta si el usuario no está logueado y opcionalmente navega al Login.
// Retorna true si está logueado, false si no.
export function requireLogin(navigation, mensaje = 'Debés iniciar sesión para realizar esta acción.') {
  if (_userData) return true;
  const { Alert } = require('react-native');
  Alert.alert(
    'Iniciá sesión',
    mensaje,
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') },
    ]
  );
  return false;
}