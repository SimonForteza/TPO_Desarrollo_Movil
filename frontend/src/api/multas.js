import api from './axiosConfig';

// Servicios de multas (penalidad por no pagar un lote ganado).

// GET /multas?estado=... -> ApiResponse<PagedResponse<MultaListItem>>
export async function getMultas(estado) {
  const res = await api.get('/multas', { params: estado ? { estado } : {} });
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// GET /multas/{id} -> ApiResponse<MultaDetail>
export async function getMulta(id) {
  const res = await api.get(`/multas/${id}`);
  return res.data?.data ?? res.data;
}

// POST /multas/{id}/pagar -> ApiResponse<MultaDetail>
// body: { medioPagoId }
export async function pagarMulta(id, medioPagoId) {
  const res = await api.post(`/multas/${id}/pagar`, { medioPagoId });
  return res.data?.data ?? res.data;
}
