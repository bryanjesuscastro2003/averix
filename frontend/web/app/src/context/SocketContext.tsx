import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Notification } from "../socket/SocketProvider";
import { useWebSocket } from "../socket/WebSocketConn";
import { useNavigate } from "react-router-dom";

interface NotificationContextType {
  notifications: Notification[];
  currentNotification: Notification | null;
  isSocketConnected: boolean;
  sendSocketMessage: (data: any) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setCurrentNotification: React.Dispatch<
    React.SetStateAction<Notification | null>
  >;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] =
    useState<Notification | null>(null);
  // Initialize WebSocket connection
  const {
    isConnected: isSocketConnected,
    sendMessage: sendSocketMessage,
    connect,
    addMessageHandler,
  } = useWebSocket(
    "wss://12voeaacae.execute-api.us-east-1.amazonaws.com/development"
  );

  // Handle incoming WebSocket messages
  useEffect(() => {
    const cleanup = addMessageHandler((data: Notification) => {
      console.log("WebSocket message received:", data);
      //alert("New notification received");

      console.log("Received message:", data);
      if (
        data.cd === "B" ||
        data.cd === "C" ||
        data.cd === "G" ||
        data.cd === "H"
      ) {
        setNotifications((prev) => [data, ...prev]);
        setCurrentNotification(data);
      } else if (data.cd !== "E" && data.cd !== "M") {
        // Add new notification to the list
        setNotifications((prev) => [data, ...prev]);
      }
      // Set as current notification
      else if (data.cd === "M")
        // time out 3 seconds then reload the page with window.location.reload()
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      else setCurrentNotification(data);
    });

    return cleanup;
  }, [addMessageHandler]);

  // Reconnect WebSocket if not connected
  useEffect(() => {
    if (!isSocketConnected) {
      connect();
    }
  }, [isSocketConnected, connect]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        currentNotification,
        isSocketConnected,
        sendSocketMessage,
        setNotifications,
        setCurrentNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
