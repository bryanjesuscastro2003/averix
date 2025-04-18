import React, { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketConn";
import { InteractiveNotification } from "../components/grez/notifications/InteractiveNotification";
import { useAuth } from "../context/AuthContext";

export const SocketProvider = () => {
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [messageInstructions, setMessageInstructions] = useState<string>("");
  const [messageContent, setMessageContent] = useState<string>("");
  const [messageTitle, setMessageTitle] = useState<string>("");
  const [isLink, setIsLink] = useState<boolean>(false);
  const [linkValue, setLinkValue] = useState<string>("");
  const [isAnyNotificationOpen, setIsAnyNotificationOpen] =
    useState<boolean>(false);

  const { sendMessage, isConnected, addMessageHandler } = useWebSocket(
    "wss://12voeaacae.execute-api.us-east-1.amazonaws.com/development"
  );
  const { userData } = useAuth();

  useEffect(() => {
    const cleanup = addMessageHandler((data: any) => {
      console.log("Received message:", data.message);
      // Handle incoming messages
      try {
        setIsAnyNotificationOpen(true);
        setMessageType(data.type || "info");
        setMessageInstructions(data.instructions);
        setMessageContent(data.content);
        setMessageTitle(data.title);
        if (data.link) {
          setIsLink(true);
          setLinkValue(data.link);
        }
      } catch (error) {
        setIsAnyNotificationOpen(false);
      }
    });

    return cleanup; // Cleanup on unmount
  }, [addMessageHandler]);

  useEffect(() => {
    console.log("WebSocket is connected:", isConnected);
    if (isConnected && userData !== null) {
      sendMessage({
        action: "imhere",
        data: {
          targetUserId: "",
          user: userData?.email || "",
          message: "Hello from the client!",
        },
      });
      setInterval(() => {
        console.log("Refreshing...");
        if (isConnected && userData !== null) {
          sendMessage({
            action: "refresh",
            data: {
              targetUserId: "",
              user: userData?.email || "",
              message: "Hello from the client!",
            },
          });
        }
      }, 4000);
    }
  }, [isConnected, userData?.email]);

  const handleCloseNotification = () => {
    setIsAnyNotificationOpen(false);
    setMessageType("info");
    setMessageInstructions("");
    setMessageContent("");
    setMessageTitle("");
  };

  const handleSend = () => {
    sendMessage({
      action: "sendMessage",
      data: {
        targetUserId: "user123",
        user: userData?.email || "",
        message: "Hello from the client!",
      },
    });
  };

  return (
    <div>
      {isAnyNotificationOpen && (
        <InteractiveNotification
          type={messageType}
          message={messageTitle}
          onClose={handleCloseNotification}
          chatContent={
            <div>
              <p>{messageInstructions}</p>
              <p>{messageContent}</p>
              {isLink && (
                <a
                  href={linkValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {linkValue}
                </a>
              )}
            </div>
          }
        />
      )}

      {/*SocketProvider
      <button onClick={handleSend}>Send Message</button>
      {isConnected ? (
        <p>WebSocket is connected</p>
      ) : (
        <p>WebSocket is not connected</p>
      )}*/}
    </div>
  );
};
