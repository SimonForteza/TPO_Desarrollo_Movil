import AsyncStorage from '@react-native-async-storage/async-storage';

let _accessToken = null;
let _refreshToken = null;

export function setTokens({ accessToken, refreshToken }) {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
}

export function getAccessToken() {
  return _accessToken;
}

export function getRefreshToken() {
  return _refreshToken;
}

export function clearTokens() {
  _accessToken = null;
  _refreshToken = null;
}

const PENDING_KEY = 'pendingRegistrationUsuarioId';

export async function setPendingRegistration(usuarioId) {
  await AsyncStorage.setItem(PENDING_KEY, String(usuarioId));
}

export async function getPendingRegistration() {
  return AsyncStorage.getItem(PENDING_KEY);
}

export async function clearPendingRegistration() {
  await AsyncStorage.removeItem(PENDING_KEY);
}
