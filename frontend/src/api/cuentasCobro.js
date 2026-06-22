import api from './axiosConfig';

// Servicios de "cuentas de cobro" (cuentas declaradas para cobrar bienes consignados).
// Usan la instancia central de Axios (baseURL + token ya configurados).

// GET /cuentas-cobro -> ApiResponse<PagedResponse<CuentaCobroResponse>>
export async function listarCuentas() {
  const res = await api.get('/cuentas-cobro');
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// POST /cuentas-cobro -> ApiResponse<CuentaCobroResponse>
export async function crearCuenta({ banco, pais, numeroCuenta }) {
  const res = await api.post('/cuentas-cobro', { banco, pais, numeroCuenta });
  return res.data?.data ?? res.data;
}
