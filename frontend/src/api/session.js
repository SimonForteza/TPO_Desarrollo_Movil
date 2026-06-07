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
