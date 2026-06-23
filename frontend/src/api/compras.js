import api from './axiosConfig';

// Servicios de compras (lotes ganados). Usan la instancia central de Axios.

// GET /compras -> ApiResponse<PagedResponse<CompraListItem>>
export async function getCompras(params = {}) {
  const res = await api.get('/compras', { params });
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// GET /compras/{id} -> ApiResponse<CompraDetail>
export async function getCompra(id) {
  const res = await api.get(`/compras/${id}`);
  return res.data?.data ?? res.data;
}

// POST /compras/{id}/pagar -> ApiResponse<CompraDetail>
// body: { medioPagoId, retiraPersonalmente, conSeguroEnvio }
export async function pagarCompra(id, body) {
  const res = await api.post(`/compras/${id}/pagar`, body);
  return res.data?.data ?? res.data;
}

// GET /compras/{id}/factura?formato=json|pdf -> ApiResponse<FacturaResponse>
export async function getFactura(id, formato = 'json') {
  const res = await api.get(`/compras/${id}/factura`, { params: { formato } });
  return res.data?.data ?? res.data;
}
