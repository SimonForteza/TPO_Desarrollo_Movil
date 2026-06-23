import api from './axiosConfig';

// Historial de participaciones y métricas del usuario actual (frame "Mi historial").

// GET /me/participaciones?resultado=todas|ganada|perdida|pujas
// -> ApiResponse<{ stats: { participadas, ganadas, gastado }, items: [...] }>
export async function getParticipaciones(resultado = 'todas') {
  const res = await api.get('/me/participaciones', { params: { resultado } });
  const data = res.data?.data ?? res.data;
  return {
    stats: data?.stats ?? { participadas: 0, ganadas: 0, gastado: 0, ofertado: 0, porCategoria: [] },
    items: data?.items ?? [],
  };
}

// GET /me/limite-disponible
// -> ApiResponse<{ limites: [{ moneda, garantia, utilizado, disponible }], tieneGarantia }>
export async function getLimiteDisponible() {
  const res = await api.get('/me/limite-disponible');
  const data = res.data?.data ?? res.data;
  return {
    limites: data?.limites ?? [],
    tieneGarantia: data?.tieneGarantia ?? false,
  };
}

// GET /me/categoria
// -> ApiResponse<{ actual, siguiente, tiposVerificados, participadas, ganadas,
//                  reqTipos, reqParticipadas, reqGanadas }>
// 'siguiente' y los 'req*' son null cuando el usuario ya es platino.
export async function getCategoria() {
  const res = await api.get('/me/categoria');
  return res.data?.data ?? res.data;
}
