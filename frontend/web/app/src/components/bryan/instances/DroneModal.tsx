import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { PartialDroneData } from "../../../types/data/IInstance";

interface DroneModalProps {
  isOpen: boolean;
  onClose: () => void;
  droneData: PartialDroneData | null;
}

export const DroneModal = ({ isOpen, onClose, droneData }: DroneModalProps) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !droneData) return null;

  const capacityData = {
    DRONAUTICA_SMALL_INSTANCE: {
      label: "Pequeño",
      color: "bg-blue-100 text-blue-800",
      icon: "📦",
    },
    DRONAUTICA_MEDIUM_INSTANCE: {
      label: "Mediano",
      color: "bg-purple-100 text-purple-800",
      icon: "📦📦",
    },
    DRONAUTICA_LARGE_INSTANCE: {
      label: "Grande",
      color: "bg-green-100 text-green-800",
      icon: "📦📦📦",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Animated overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal container with animation */}
      <div
        className={`relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalles del dron
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Información parcial del dispositivo
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-5">
          {/* Model card */}
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {droneData.model}
              </p>
            </div>
          </div>

          {/* Capacity card */}
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <span className="text-lg">
                {capacityData[droneData.capacity].icon}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Capacidad</h3>
              <div className="mt-1 flex items-center space-x-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    capacityData[droneData.capacity].color
                  }`}
                >
                  {capacityData[droneData.capacity].label}
                </span>
                <span className="text-xs text-gray-500">
                  {droneData.capacity.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Description card */}
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
              <p className="mt-1 text-sm text-gray-700">
                {droneData.description || "No hay descripción disponible"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
