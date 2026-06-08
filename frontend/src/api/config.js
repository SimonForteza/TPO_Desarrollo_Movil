// 10.0.2.2 = Android emulator → localhost del host
// localhost = browser (web) o iOS simulator
const isWeb = typeof document !== 'undefined';
export const API_URL = isWeb ? 'http://localhost:8080' : 'http://10.0.2.2:8080';
