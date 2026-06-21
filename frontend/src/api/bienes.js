import api from './axiosConfig';

// Servicios de "bienes en consignación" (productos del usuario).
// Usan la instancia central de Axios (baseURL + token ya configurados).

// GET /bienes -> ApiResponse<PagedResponse<BienListItem>>
export async function getMisBienes() {
  const res = await api.get('/bienes');
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// GET /bienes/{id} -> ApiResponse<BienDetail>
export async function getBienDetalle(id) {
  const res = await api.get(`/bienes/${id}`);
  return res.data?.data ?? res.data;
}

// POST /bienes -> ApiResponse<BienDetail>
export async function crearBien(payload) {
  const res = await api.post('/bienes', payload);
  return res.data?.data ?? res.data;
}
