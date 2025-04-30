import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Notification } from "../socket/SocketProvider";
import { useWebSocket } from "../socket/WebSocketConn";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import useSound from 'use-sound';


interface NotificationContextType {
  notifications: Notification[];
  currentNotification: Notification | null;
  isSocketConnected: boolean;
  sendSocketMessage: (data: any) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setCurrentNotification: React.Dispatch<
    React.SetStateAction<Notification | null>
  >;
  handleCloseNotification: (cd: string, decision: boolean) => void;
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
  const { userData } = useAuth();
  const [notificationsRegister, setNotificationsRegister] = useState({
    A: false,
    B: false,
    C: false,
    X: false,
    D: false,
    F: false,
    G: false,
    H: false,
    K: false,
    L: false,
    E: false,
    M: false,
    I: false,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Inicializamos el audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/tone.mp3');
    audioRef.current.volume = 0.7; // Volumen al 70%
    
    // Manejo de errores
    audioRef.current.addEventListener('error', (e) => {
      console.error('Error de audio:', e);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = () => {
    if (!audioRef.current) return;
    
    try {
      audioRef.current.currentTime = 0; // Reinicia si ya está reproduciendo
      audioRef.current.play().catch(error => {
        console.error('Error al reproducir:', error);
        // Solución para navegadores que bloquean autoplay
        document.body.addEventListener('click', () => {
          audioRef.current?.play();
        }, { once: true });
      });
    } catch (error) {
      console.error('Error general de audio:', error);
    }
  };

  

  const {
    isConnected: isSocketConnected,
    sendMessage: sendSocketMessage,
    connect,
    addMessageHandler,
  } = useWebSocket(
    "wss://12voeaacae.execute-api.us-east-1.amazonaws.com/development"
  );

  useEffect(() => {
    console.log("dnddjdkd -", notificationsRegister);
  }, [notificationsRegister]);

  const handleCloseNotification = (cd: string, decision: boolean) => {
    const notificationToClose = notifications.find((n) => n.cd === cd);
    console.log("Notification to close:", notifications);
    if (cd === "G" || cd === "H") {
      if (decision) {
        setNotifications((prev) => prev.filter((n) => n.cd !== cd));
        setNotificationsRegister((prev) => ({
          ...prev,
          [cd]: false,
        }));
        if (isSocketConnected) {
          console.log("Sending confirmation message", notificationToClose);
          sendSocketMessage({
            action: cd === "G" ? "confirm_arrived_st1" : "confirm_arrived_st2",
            data: {
              deliveryId: null,
              user: userData?.email || "",
              sessionId: localStorage.getItem("idToken"),
              instanceId: notificationToClose!.instanceId,
            },
          });
          if (cd === "H") window.location.reload();
        }
      }
    } else {
      setNotifications((prev) => prev.filter((n) => n.cd !== cd));
      setNotificationsRegister((prev) => ({
        ...prev,
        [cd]: false,
      }));
    }
  };

  // Handle incoming WebSocket messages
  useEffect(() => {
    const cleanup = addMessageHandler((data: Notification) => {
      console.log("WebSocket message received:", data);

      // NOTIFICATIONS SOUND
      const playNotificationSound = () => {
        const audio = new Audio("/sounds/livechat-129007.mp3");
        audio.play().catch((e) => {
          console.warn("Error playing notification sound:", e);
        });
      };
      if (data.cd !== "A" && data.cd !== "E"){
      playSound();
      }
      

      if (
        data.cd === "A" ||
        data.cd === "B" ||
        data.cd === "C" ||
        data.cd === "X" ||
        data.cd === "D" ||
        data.cd === "F" ||
        data.cd === "G" ||
        data.cd === "H" ||
        data.cd === "K" ||
        data.cd === "L"
      ) {
        if (
          data.cd === "B" ||
          data.cd === "C" ||
          data.cd === "G" ||
          data.cd === "H"
        ) {
          setCurrentNotification(data);
        }
        if (notificationsRegister[data.cd] === true) {
          console.log("Notification already registered:", data);
          return;
        }
        notificationsRegister[data.cd] = true;
        setNotifications((prev) => [data, ...prev]);

        if (data.cd === "G" || data.cd === "H") {
          ["A", "B", "C", "X", "D", "F", "K", "L", "E", "M", "I"].forEach(
            (cd) => handleCloseNotification(cd, true)
          );
        }
      } else if (data.cd === "E") {
        setCurrentNotification(data);
      } else if (data.cd === "M") {
        setCurrentNotification(data);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        if (data.cd === "I") handleCloseNotification(data.cd, true);
        setNotifications((prev) => [data, ...prev]);
      }
    });

    return cleanup;
  }, [addMessageHandler]);

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
        handleCloseNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
