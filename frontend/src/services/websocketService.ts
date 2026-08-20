export type MessageListener = (data: string) => void;

class WebSocketService {
    private static instance: WebSocketService;

    private socket: WebSocket | null = null;

    private listeners: Set<MessageListener> = new Set();

    private constructor() {
        this.connect();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }

        return WebSocketService.instance;
    }

    private connect(): void {
        this.socket = new WebSocket("ws://localhost:3000");

        this.socket.onopen = () => {
            console.log("Connected");
        };

        this.socket.onmessage = (event: MessageEvent) => {
            this.listeners.forEach((listener) => listener(event.data));
        };

        this.socket.onclose = () => {
            console.log("Disconnected");

            this.socket = null;

            setTimeout(() => {
                this.connect();
            }, 3000);
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }

    public subscribe(listener: MessageListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public send(data: string): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        } else {
            console.warn("WebSocket is not connected");
        }
    }

    public disconnect(): void {
        this.socket?.close();
    }
}

export default WebSocketService;