import React, { useEffect, useState } from "react";
import { InteractiveNotification } from "../components/grez/notifications/InteractiveNotification";
import { useNotifications } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

export interface Notification {
  id: string;
  cd: string;
  type: "success" | "error" | "warning" | "info";
  instructions: string;
  content: string;
  title: string;
  isLink: boolean;
  linkValue: string;
  timestamp: number;
  coordinates: {
    lat: string;
    lng: string;
  };
  mfstate: string;
  instanceId: string;
}

export const SocketProvider = () => {
  const {
    notifications,
    setNotifications,
    setCurrentNotification,
    isSocketConnected,
    sendSocketMessage,
    currentNotification,
  } = useNotifications();

  const { userData, isAuthenticated } = useAuth();
  const [confirmDecision, setConfirmDecision] = useState<boolean>(false);

  useEffect(() => {
    if (isSocketConnected && userData !== null) {
      sendSocketMessage({
        action: "imhere",
        data: {
          targetUserId: "",
          user: userData?.email || "",
          sessionId: localStorage.getItem("idToken"),
          message: "Hello from the client!",
        },
      });
    }

    // The reconnection logic is now handled by the useWebSocket hook inside NotificationProvider
  }, [isSocketConnected, userData?.email, sendSocketMessage]);

  const handleCloseNotification = (id: string, decision: boolean) => {
    const notification = notifications.find(
      (notification) => notification.id === id
    );
    console.log("Notification to close:", notification);
    if (notification) {
      if (
        notification.title.includes("Puedes ver el dron sobre ti?") ||
        notification.title.includes("La carga esta lista ?") ||
        notification.title.includes("La entrega esta lista ?")
      ) {
        if (decision) {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id)
          );
          if (isSocketConnected) {
            console.log("Sending confirmation message", notification);
            sendSocketMessage({
              action: notification.title.includes(
                "Puedes ver el dron sobre ti?"
              )
                ? "confirm_arrived_st1"
                : "confirm_arrived_st2",
              data: {
                deliveryId: null,
                user: userData?.email || "",
                sessionId: localStorage.getItem("idToken"),
                instanceId: notification.instanceId,
              },
            });
          }
        }
      } else {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
      }
    }
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
                  id={notification.id}
                  setConfirmDecision={setConfirmDecision}
                  onClose={handleCloseNotification}
                  showForm={
                    notification.title
                      ? notification.title.includes(
                          "Puedes ver el dron sobre ti?"
                        ) ||
                        notification.title.includes("La carga esta lista ?") ||
                        notification.title.includes("La entrega esta lista ?")
                      : false
                  }
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
                      {notification.title && (
                        <p className="text-sm text-gray-700 mb-1">
                          {notification.title}
                        </p>
                      )}
                    </div>
                  }
                />
              </div>
            ))}
          </div>

          {/* Online status indicator */}
          <div className="fixed right-2 bottom-4 z-[1000] max-w-xs">
            <div className="flex right-4 items-center justify-end space-x-2 mt-3 w-20">
              <span
                className={`h-3 w-3 rounded-full ${
                  isSocketConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={isSocketConnected ? "Online" : "Offline"}
              ></span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
