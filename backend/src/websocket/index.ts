import type { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { LiveFeedPublisher } from '../utils/livefeedgenerator.js';
import type { TelemetryTick } from '../types/telemetry.js';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server });
  const publisher = new LiveFeedPublisher();
  publisher.init().catch(err => console.error('[Publisher Init Error]', err));
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_in_production';

  wss.on('connection', async (ws: WebSocket, req) => {
    try {
      // Basic cookie parsing for the 'token'
      const cookieHeader = req.headers.cookie || '';
      const match = cookieHeader.match(/token=([^;]+)/);
      const token = match ? match[1] : null;

      if (!token) {
         console.log('[WS] Rejected: No token provided');
         ws.close(1008, 'Unauthorized');
         return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      
      if (!user) {
        throw new Error('User no longer exists in database');
      }

      console.log(`[WS] Client connected (User: ${user.username}). Total: ${wss.clients.size}`);

      // subscribe this client to the live feed
      const onTick = (data: TelemetryTick) => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify(data));
          } catch (e) {
            console.error('[WS] Send error:', e);
          }
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
        console.error('[WS] Client Error:', err.message);
      });

    } catch (err) {
      console.log('[WS] Connection rejected or error occurred:', err instanceof Error ? err.message : err);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1008, 'Unauthorized / Error');
      }
    }
  });

  wss.on('error', (err) => {
    console.error('[WS] Server Error:', err);
  });

  console.log('[WS] WebSocket server initialized with live feed');
  return wss;
}
