import React, { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketConn";
import { InteractiveNotification } from "../components/grez/notifications/InteractiveNotification";
import { useAuth } from "../context/AuthContext";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  instructions: string;
  content: string;
  title: string;
  isLink: boolean;
  linkValue: string;
  timestamp: number;
}

export const SocketProvider = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { sendMessage, isConnected, addMessageHandler, connect } = useWebSocket(
    "wss://12voeaacae.execute-api.us-east-1.amazonaws.com/development"
  );
  const { userData, isAuthenticated } = useAuth();

  useEffect(() => {
    const cleanup = addMessageHandler((data: any) => {
      console.log("Received message:", data.message);
      try {
        const newNotification: Notification = {
          id: Math.random().toString(36).substring(2, 9),
          type: data.type || "info",
          instructions: data.instructions || "",
          content: data.content || "",
          title: data.title || "",
          isLink: !!data.link,
          linkValue: data.link || "",
          timestamp: Date.now(),
        };

        setNotifications((prev) => {
          const updated = [newNotification, ...prev];
          return updated.slice(0, 5); // Limit to 5 notifications
        });
      } catch (error) {
        console.error("Error processing notification:", error);
      }
    });

    return cleanup;
  }, [addMessageHandler]);

  useEffect(() => {
    if (isConnected && userData !== null) {
      sendMessage({
        action: "imhere",
        data: {
          targetUserId: "",
          user: userData?.email || "",
          sessionId: localStorage.getItem("idToken"),
          message: "Hello from the client!",
        },
      });
    }
    // if is not connected, try to reconnect
    if (!isConnected) {
      console.log("WebSocket not connected, trying to reconnect...");
      // interval to reconnect until connected
      const interval = setInterval(() => {
        console.log("Trying to reconnect...");
        if (!isConnected) {
          connect();
        } else {
          clearInterval(interval);
        }
      }, 5000); // Try to reconnect every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, userData?.email]);

  const handleCloseNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1000] w-full max-w-xs">
      {isAuthenticated && (
        <>
          {/* Notification stack container */}
          <div className="flex flex-col items-end space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="w-full animate-fade-in-up animate-duration-300 animate-ease-out"
              >
                <InteractiveNotification
                  type={notification.type}
                  message={notification.title}
                  onClose={() => handleCloseNotification(notification.id)}
                  chatContent={
                    <div className="p-2 space-y-1">
                      {notification.instructions && (
                        <p className="text-sm text-gray-700 mb-1">
                          {notification.instructions}
                        </p>
                      )}
                      {notification.content && (
                        <p className="text-sm text-gray-800">
                          {notification.content}
                        </p>
                      )}
                      {notification.isLink && (
                        <a
                          href={notification.linkValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                          {notification.linkValue}
                        </a>
                      )}
                    </div>
                  }
                />
              </div>
            ))}
          </div>

          {/* Online status - unchanged */}
          <div className="flex items-center justify-end space-x-2 mt-3">
            <span
              className={`h-3 w-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Online" : "Offline"}
            ></span>
            <p>{isConnected ? "Online" : "Offline"}</p>
          </div>
        </>
      )}
    </div>
  );
};
