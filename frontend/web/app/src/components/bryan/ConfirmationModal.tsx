import React from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="relative p-6">
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                danger ? "bg-red-100" : "bg-blue-100"
              } mx-auto sm:mx-0 sm:h-10 sm:w-10`}
            >
              <ExclamationTriangleIcon
                className={`h-6 w-6 ${
                  danger ? "text-red-600" : "text-blue-600"
                }`}
              />
            </div>
            <div className="mt-1 ml-4 text-left">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto px-4 py-2 rounded-md text-white font-medium ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors shadow-sm`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
