export type MessageListener = (data: string) => void;

class WebSocketService {
    private static instance: WebSocketService;

    private socket: WebSocket | null = null;
    private intentionalDisconnect: boolean = false;

    private listeners: Set<MessageListener> = new Set();

    private constructor() {}

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }

        return WebSocketService.instance;
    }

    public connect(): void {
        if (this.socket) return;
        this.intentionalDisconnect = false;
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log("Connected");
        };

        this.socket.onmessage = (event: MessageEvent) => {
            this.listeners.forEach((listener) => listener(event.data));
        };

        this.socket.onclose = (event: CloseEvent) => {
            console.log(`Disconnected. Code: ${event.code}`);

            this.socket = null;

            // 1008 is Policy Violation (Unauthorized). Do not retry if rejected by server.
            if (event.code === 1008) {
                this.intentionalDisconnect = true;
            }

            if (!this.intentionalDisconnect) {
                setTimeout(() => {
                    this.connect();
                }, 3000);
            }
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
        this.intentionalDisconnect = true;
        this.socket?.close();
        this.socket = null;
    }
}

export default WebSocketService;