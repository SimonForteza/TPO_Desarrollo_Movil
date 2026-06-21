import api from './axiosConfig';

// GET /medios-pago -> ApiResponse<PagedResponse<MedioDePagoResponse>>
export async function getMediosPago() {
  const res = await api.get('/medios-pago');
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// Devuelve el primer medio verificado cuya moneda coincide con la subasta, o null.
export function elegirMedioParaSubasta(medios, moneda) {
  if (!Array.isArray(medios)) return null;
  return (
    medios.find((m) => m.estado === 'verificado' && m.moneda === moneda) ?? null
  );
}
