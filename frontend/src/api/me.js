import api from './axiosConfig';

// Historial de participaciones y métricas del usuario actual (frame "Mi historial").

// GET /me/participaciones?resultado=todas|ganada|perdida|pujas
// -> ApiResponse<{ stats: { participadas, ganadas, gastado }, items: [...] }>
export async function getParticipaciones(resultado = 'todas') {
  const res = await api.get('/me/participaciones', { params: { resultado } });
  const data = res.data?.data ?? res.data;
  return {
    stats: data?.stats ?? { participadas: 0, ganadas: 0, gastado: 0 },
    items: data?.items ?? [],
  };
}
