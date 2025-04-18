// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from "react";

type MessageHandler = (data: any) => void;

interface UseWebSocketReturn {
  sendMessage: (data: any) => void;
  isConnected: boolean;
  disconnect: () => void;
  connect: () => void;
  addMessageHandler: (handler: MessageHandler) => () => void; // Add this line
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageHandlersRef = useRef<MessageHandler[]>([]);

  const addMessageHandler = useCallback((handler: MessageHandler) => {
    messageHandlersRef.current.push(handler);
    return () => {
      messageHandlersRef.current = messageHandlersRef.current.filter(
        (h) => h !== handler
      );
    };
  }, []);

  const connect = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl = url; ///.replace(/\/development$/, "");
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        messageHandlersRef.current.forEach((handler) => handler(data));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, [url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      wsRef.current.send(message);
    } else {
      console.error("Cannot send message - WebSocket not connected");
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    sendMessage,
    isConnected,
    disconnect,
    connect,
    addMessageHandler, // Now this matches the interface
  };
};
