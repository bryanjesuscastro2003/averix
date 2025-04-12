import React, { useState } from "react";
import { StartDeliveryModal } from "../StartDeliveryModal";

// Define types for your data
type Location = {
  lat: number;
  lng: number;
};

type RequestData = {
  locationB: string; // This is a JSON string that we'll parse
  acceptedRequestAt: string;
  timestamp: string;
  primaryUser: string;
  secondaryUser: string;
  startedRequestAt: string;
  dstate: string;
};

interface TrackingPoints {
  locationA: { lat: number; lng: number; name: string };
  locationB: { lat: number; lng: number; name: string };
  locationZ: { lat: number; lng: number; name: string };
  locationT: { lat: number; lng: number; name: string };
}

type RequestCardProps = {
  data: RequestData;
  trackingPoints: TrackingPoints;
};

export const DeliveryDetailsRequestCard: React.FC<RequestCardProps> = ({
  data,
  trackingPoints,
}) => {
  // Parse the location JSON
  const location: Location = JSON.parse(data.locationB);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Format date/time for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Status color mapping
  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
    // Add more statuses as needed
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Detalles de la entrega
          </h2>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              statusColors[data.dstate] || "bg-gray-100 text-gray-800"
            }`}
          >
            {data.dstate}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Primary User</h3>
            <p className="text-gray-900">{data.primaryUser}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Secondary User
            </h3>
            <p className="text-gray-900">{data.secondaryUser}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Started At</h3>
            <p className="text-gray-900">
              {formatDateTime(data.startedRequestAt)}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Accepted At</h3>
            <p className="text-gray-900">
              {formatDateTime(data.acceptedRequestAt)}
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg"
            >
              Seguimiento
            </button>
          </div>
          <StartDeliveryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onStart={() => {}}
            points={trackingPoints}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};
