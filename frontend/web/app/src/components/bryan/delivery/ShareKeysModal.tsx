import React, { useState } from "react";
import {
  CheckIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ShareKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  link: string;
}

export const ShareKeysModal: React.FC<ShareKeysModalProps> = ({
  isOpen,
  onClose,
  code,
  link,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in mt-20">
        {/* Modal Header */}
        <div className="relative bg-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Confirmación de Viaje
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-indigo-200 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              ¡Listo para compartir!
            </h3>
            <p className="mt-2 text-gray-600">
              Manda estas claves a tu cliente para confirmar el viaje
            </p>
          </div>

          {/* Code Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Verificacion por codigo
            </label>
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow focus-within:z-10">
                <input
                  type="text"
                  readOnly
                  value={code}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-3 pr-12 py-3 border border-gray-300 font-mono bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(code, "code")}
                  className="absolute inset-y-0 right-0 px-3 flex items-center bg-gray-100 hover:bg-gray-200 border-l border-gray-300 rounded-r-md transition-colors"
                >
                  {copiedCode ? (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {copiedCode && (
              <p className="text-sm text-green-600 animate-fade-in">
                ¡Código copiado!
              </p>
            )}
          </div>

          {/* Link Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Verificacion por enlace
            </label>
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow focus-within:z-10">
                <input
                  type="text"
                  readOnly
                  value={link}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-3 pr-12 py-3 border border-gray-300 text-sm bg-gray-50 truncate"
                />
                <button
                  onClick={() => copyToClipboard(link, "link")}
                  className="absolute inset-y-0 right-0 px-3 flex items-center bg-gray-100 hover:bg-gray-200 border-l border-gray-300 rounded-r-md transition-colors"
                >
                  {copiedLink ? (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {copiedLink && (
              <p className="text-sm text-green-600 animate-fade-in">
                ¡Enlace copiado!
              </p>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Comparte ambos elementos con tu cliente para
              que pueda verificar el viaje y seguir su progreso en tiempo real.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
