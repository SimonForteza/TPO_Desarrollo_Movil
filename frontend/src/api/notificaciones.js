import api from './axiosConfig';

export async function getNotificaciones(leida = null) {
  const params = leida !== null ? { leida } : {};
  const res = await api.get('/notificaciones', { params });
  return res.data?.data ?? res.data;
}

export async function marcarLeida(id) {
  const res = await api.put(`/notificaciones/${id}/leer`);
  return res.data?.data ?? res.data;
}

export async function marcarTodasLeidas() {
  await api.put('/notificaciones/leer-todas');
}

export async function getContadorNoLeidas() {
  const res = await api.get('/notificaciones/no-leidas/count');
  return res.data?.data ?? 0;
}
