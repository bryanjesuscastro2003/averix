import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type MessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  messageData: {
    ok: boolean;
    message: string;
  };
};

type MessageType = "success" | "error" | "info";

export const ResponseDeliveryModal = ({
  isOpen,
  onClose,
  messageData,
}: MessageModalProps) => {
  // Determine message type based on the 'ok' status
  const messageType: MessageType = messageData.ok
    ? "success"
    : messageData.ok === false
    ? "error"
    : "info";

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get appropriate colors based on message type
  const getColors = () => {
    switch (messageType) {
      case "success":
        return {
          bg: "bg-green-50",
          text: "text-green-800",
          icon: "text-green-400",
          button: "bg-green-600 hover:bg-green-700",
        };
      case "error":
        return {
          bg: "bg-red-50",
          text: "text-red-800",
          icon: "text-red-400",
          button: "bg-red-600 hover:bg-red-700",
        };
      default:
        return {
          bg: "bg-blue-50",
          text: "text-blue-800",
          icon: "text-blue-400",
          button: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-lg ${colors.bg} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute right-3 top-3 rounded-md p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
          </button>

          {/* Content */}
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
              {messageType === "success" ? (
                <svg
                  className={`h-6 w-6 ${colors.icon}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : messageType === "error" ? (
                <svg
                  className={`h-6 w-6 ${colors.icon}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className={`h-6 w-6 ${colors.icon}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className={`text-lg font-medium leading-6 ${colors.text}`}>
                {messageType === "success"
                  ? "Success"
                  : messageType === "error"
                  ? "Error"
                  : "Notice"}
              </h3>
              <div className="mt-2">
                <p className={`text-sm ${colors.text}`}>
                  {messageData.message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${colors.button}`}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
