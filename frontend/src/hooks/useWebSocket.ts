import { useEffect, useState } from "react";
import WebSocketService from "../services/websocketService";

export function useWebSocket() {
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const wsService = WebSocketService.getInstance();

    useEffect(() => {
        // Subscribe to messages when the component mounts
        const unsubscribe = wsService.subscribe((data: string) => {
            setLastMessage(data);
        });

        // Unsubscribe when the component unmounts to prevent memory leaks
        return () => unsubscribe();
    }, [wsService]);

    const sendMessage = (data: string) => {
        wsService.send(data);
    };

    return { lastMessage, sendMessage };
}
