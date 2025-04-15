import React from "react";

interface AcceptDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  price: number;
}

export const AcceptDeliveryModal: React.FC<AcceptDeliveryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  price,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in mt-20">
        {/* Modal Header */}
        <div className="bg-indigo-600 p-10">
          <h2 className="text-2xl font-bold text-white text-center">
            Confirm Delivery
          </h2>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-indigo-500"
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
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              Delivery Service Summary
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Base Rate:</span>
              <span className="font-medium">$5.00</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Distance Fee:</span>
              <span className="font-medium">${(price - 5).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-bold">Total:</span>
              <span className="text-indigo-600 font-bold text-xl">
                ${price.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center">
            By confirming, you agree to our terms of service and will be
            responsible for completing this delivery.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse sm:justify-start gap-3">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Confirm Delivery
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            Cancel Delivery
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
