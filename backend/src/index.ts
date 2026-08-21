import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initWebSocket } from './websocket/index.js';

const server = createServer(app);

// Initialize WebSocket server
initWebSocket(server);

server.listen(env.PORT, () => {
  console.log(`[Server] Running at http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
