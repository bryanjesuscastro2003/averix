import React, { useState } from "react";

interface NotificationProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  id: string;
  onClose: (id: string, decision: boolean) => void;
  chatContent?: React.ReactNode;
  showForm?: boolean;
  setConfirmDecision:
    | React.Dispatch<React.SetStateAction<boolean>>
    | ((prev: boolean) => boolean);
}

export const InteractiveNotification: React.FC<NotificationProps> = ({
  type = "info",
  message,
  onClose,
  chatContent,
  showForm = false,
  setConfirmDecision,
  id,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [decision, setDecision] = useState<boolean>(false);

  // Estilos base
  const baseStyles =
    "fixed bottom-4 left-4 flex items-center p-4 rounded-lg shadow-md max-w-xs z-50 border-l-4 cursor-pointer";

  // Estilos según tipo
  const typeStyles = {
    success: "bg-green-50 border-green-500 text-green-800 hover:bg-green-100",
    error: "bg-red-50 border-red-500 text-red-800 hover:bg-red-100",
    warning:
      "bg-yellow-50 border-yellow-500 text-yellow-800 hover:bg-yellow-100",
    info: "bg-blue-50 border-blue-500 text-blue-800 hover:bg-blue-100",
  };

  // Iconos según tipo
  const icons = {
    success: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Notificación */}
      <div className={`${baseStyles} ${typeStyles[type]}`} onClick={toggleChat}>
        {icons[type]}
        <span className="flex-1">{message}</span>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(id, false);
            }}
            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Cerrar notificación"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Chat flotante */}
      {isChatOpen && (
        <div className="fixed bottom-20 left-4 w-80 h-96 bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
          {/* Header del chat */}
          <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">Bandeja de notificaciones</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenido del chat */}
          <div className="flex-1 p-4 overflow-y-auto">
            {chatContent || (
              <div className="text-center text-gray-500 mt-10">
                <p>Bienvenido al chat de soporte</p>
                <p>¿En qué podemos ayudarte?</p>
              </div>
            )}
          </div>

          {/* Input para mensajes */}
          <div className="p-3 border-t border-gray-200">
            {showForm && (
              <div className="flex justify-around">
                <button
                  className="bg-green-500 text-white px-4 mr-2 py-2 rounded-lg hover:bg-green-600"
                  onClick={() => {
                    setConfirmDecision(true);
                    setIsChatOpen(false);
                    onClose(id, true);
                  }}
                >
                  SI
                </button>
                <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                  NO
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
