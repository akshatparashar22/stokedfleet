import type { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log(`[WS] Client connected. Total: ${wss.clients.size}`);

    ws.on('message', (message: WebSocket.RawData) => {
      console.log(`[WS] Received: ${message.toString()}`);
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected. Total: ${wss.clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  });

  console.log('[WS] WebSocket server initialized with live feed');
  return wss;
}
