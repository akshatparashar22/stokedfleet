import type { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { LiveFeedPublisher } from '../utils/livefeedgenerator.js';
import type { TelemetryTick } from '../types/telemetry.js';

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server });
  const publisher = new LiveFeedPublisher();
  publisher.init();

  wss.on('connection', (ws: WebSocket) => {
    console.log(`[WS] Client connected. Total: ${wss.clients.size}`);

    // subscribe this client to the live feed
    const onTick = (data: TelemetryTick) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    };
    publisher.subscribe(onTick);

    ws.on('message', (message: WebSocket.RawData) => {
      console.log(`[WS] Received: ${message.toString()}`);
    });

    ws.on('close', () => {
      publisher.unsubscribe(onTick);
      console.log(`[WS] Client disconnected. Total: ${wss.clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  });

  console.log('[WS] WebSocket server initialized with live feed');
  return wss;
}
