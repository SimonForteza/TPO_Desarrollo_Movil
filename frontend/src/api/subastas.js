import api from './axiosConfig';

// Servicios de subastas. Usan la instancia central de Axios.

// GET /subastas -> ApiResponse<PagedResponse<SubastaListItem>>
export async function getSubastas(params = {}) {
  const res = await api.get('/subastas', { params });
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// GET /subastas/{id} -> ApiResponse<SubastaDetailResponse>
export async function getSubastaDetalle(id) {
  const res = await api.get(`/subastas/${id}`);
  return res.data?.data ?? res.data;
}

// GET /subastas/{id}/catalogo -> ApiResponse<PagedResponse<CatalogoItemListResponse>>
export async function getCatalogoSubasta(id) {
  const res = await api.get(`/subastas/${id}/catalogo`);
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// POST /subastas/{id}/inscribirse -> ApiResponse<InscripcionResponse>
// Requiere un medioPagoId verificado cuya moneda coincida con la subasta.
export async function unirseASubasta(id, medioPagoId) {
  const res = await api.post(`/subastas/${id}/inscribirse`, { medioPagoId });
  return res.data?.data ?? res.data;
}

// GET /subastas/{id}/pujas -> ApiResponse<PagedResponse<PujaHistoryItem>>
export async function getPujas(subastaId, params = {}) {
  const res = await api.get(`/subastas/${subastaId}/pujas`, { params });
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// POST /subastas/{id}/pujar -> ApiResponse<PujaResponse>
export async function realizarPuja(subastaId, { itemId, importe, medioPagoId }) {
  const res = await api.post(`/subastas/${subastaId}/pujar`, { itemId, importe, medioPagoId });
  return res.data?.data ?? res.data;
}
