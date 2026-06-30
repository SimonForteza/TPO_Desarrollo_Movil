// Cambiá USE_REMOTE a false para desarrollar contra el backend local.
const USE_REMOTE = false;

// Backend deployado en Railway (Supabase vía Session pooler).
const REMOTE_URL = 'https://tpodesarrollomovil-production.up.railway.app';

// 10.0.2.2 = emulador Android → localhost del host; localhost = web / iOS sim.
const isWeb = typeof document !== 'undefined';
const LOCAL_URL = isWeb ? 'http://localhost:8080' : 'http://10.0.2.2:8080';

export const API_URL = USE_REMOTE ? REMOTE_URL : LOCAL_URL;
