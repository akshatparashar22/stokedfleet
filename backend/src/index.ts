import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

dotenv.config();

const app = express();
if (!process.env) {
  console.error('Environment variables are not defined or file not found');
}
if (!process.env.PORT) {
  console.error('PORT is not defined in the environment variables');
}
const port = process.env.PORT || 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

app.get('/health-check', (req: Request, res: Response) => {
  res.json({ message: 'backend says hello' });
});

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected. Total clients:', wss.clients.size);
  // stimulating live data by incrementing a counter and sending it to the client every second
  let counter = 0;
  setInterval(() => {
    counter++;
    ws.send(`Server counter: ${counter}`);
  }, 5000);

  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        counter++;
        client.send(`Server counter: ${counter}`);
      }
    });
  });
  ws.on('close', () => {
    console.log('Client disconnected. Total clients:', wss.clients.size);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
