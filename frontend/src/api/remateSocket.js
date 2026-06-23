import { Client } from '@stomp/stompjs';
import { API_URL } from './config';

// URL del WebSocket derivada de la API (http -> ws). Android emulator: ws://10.0.2.2:8080/ws.
const WS_URL = API_URL.replace(/^http/, 'ws') + '/ws';

// Suscribe al estado del remate en vivo de una subasta vía STOMP.
// - onEstado(estado): recibe el RemateEstadoResponse crudo en cada push del server.
// - onStatus(connected): true al conectar, false al cerrarse el socket (para el indicador EN VIVO).
// Devuelve una función de limpieza que desactiva el cliente.
export function subscribeRemate(subastaId, onEstado, onStatus) {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
    onConnect: () => {
      onStatus?.(true);
      client.subscribe(`/topic/subastas/${subastaId}`, (msg) => {
        try {
          onEstado(JSON.parse(msg.body));
        } catch (_) {
          // Mensaje no parseable: lo cubre el polling de fallback.
        }
      });
    },
    onWebSocketClose: () => onStatus?.(false),
    onStompError: () => onStatus?.(false),
  });

  client.activate();
  return () => {
    onStatus?.(false);
    client.deactivate();
  };
}
