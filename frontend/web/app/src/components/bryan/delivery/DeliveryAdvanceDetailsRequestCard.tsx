import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { StartDeliveryModal } from "../../chris/delivery/StartDeliveryModal";
import { DeliveryData, Location } from "../../../types/data/IDelivery";
import { AcceptDeliveryModal } from "./AcceptDeliveryModal";
import { ShareKeysModal } from "./ShareKeysModal";
import { ConfirmationModal } from "../ConfirmationModal";

export const DeliveryAdvanceDetailsRequestCard: React.FC<{
  data: DeliveryData;
}> = ({ data }) => {
  // Parse locations
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState<boolean>(false);
  const [deliveryPrice, setDeliveryPrice] = useState<number>(12.5);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState(data.delivery.id);
  const [verificationLinkCode, setVerificationLinkCode] = useState(
    "https://7vlx93vd-5175.usw3.devtunnels.ms/dashboard/deliveries/" +
      data.delivery.id
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const locationA: Location =
    data.delivery.locationA !== null
      ? JSON.parse(data.delivery.locationA)
      : null;
  const locationB: Location =
    data.delivery.locationB !== null
      ? JSON.parse(data.delivery.locationB)
      : null;
  const locationZ: Location =
    data.delivery.locationZ !== null
      ? JSON.parse(data.delivery.locationZ)
      : null;
  const locationT: Location =
    data.trackingLogs.currentLocation !== null
      ? JSON.parse(data.trackingLogs.currentLocation)
      : null;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Status colors
  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    STARTED: "bg-blue-100 text-blue-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
    ZA: "bg-purple-100 text-purple-800",
    AB: "bg-indigo-100 text-indigo-800",
    BZ: "bg-pink-100 text-pink-800",
    COMPLETED: "bg-gray-100 text-gray-800",
  };

  const trackingPoints = {
    locationA: locationA !== null ? { name: "Tienda", ...locationA } : null,
    locationB: locationB !== null ? { name: "Cliente", ...locationB } : null,
    locationZ: locationZ !== null ? { name: "Central", ...locationZ } : null,
    locationT:
      locationT !== null ? { name: "Ubicación actual", ...locationT } : null,
  };

  useEffect(() => {
    console.log("Tracking Points:", trackingPoints);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Delivery Tracking Dashboard
        </h1>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery Info Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Delivery Information
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColors[data.delivery.dstate]
                  }`}
                >
                  {data.delivery.dstate}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Tracking ID
                  </h3>
                  <p className="text-gray-900 font-mono">
                    {data.delivery.trackingId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Primary User
                    </h3>
                    <p className="text-gray-900">{data.delivery.primaryUser}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Secondary User
                    </h3>
                    <p className="text-gray-900">
                      {data.delivery.secondaryUser}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Started At
                    </h3>
                    <p className="text-gray-900">
                      {formatDate(data.delivery.startedRequestAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Accepted At
                    </h3>
                    <p className="text-gray-900">
                      {data.delivery.acceptedRequestAt !== null
                        ? formatDate(data.delivery.acceptedRequestAt)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Ended At
                    </h3>
                    <p className="text-gray-900">
                      {data.delivery.acceptedRequestAt !== null
                        ? formatDate(data.delivery.acceptedRequestAt)
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Route Progress
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: data.tracking.mfZA_endedAt ? "100%" : "50%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 w-full mt-8 flex justify-center gap-4">
                  {data.delivery.dstate !== "PENDING" ? (
                    <>
                      <button
                        onClick={() => setIsAcceptModalOpen(true)}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg w-full text-center"
                      >
                        <p className="text-center w-full">Aceptar</p>
                      </button>
                      {data.delivery.dstate === "RUNNING" && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg w-full text-center w-full"
                        >
                          <p className="text-center w-full">Seguimiento</p>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsCancelModalOpen(true)}
                        className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-lg font-semibold shadow-lg w-full text-center w-full"
                      >
                        <p className="text-center w-full">Cancelar</p>
                      </button>
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 text-lg font-semibold shadow-lg w-full text-center w-full"
                      >
                        <p className="text-center w-full">
                          Claves de confirmacion
                        </p>
                      </button>
                    </>
                  )}
                </div>
                <StartDeliveryModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onStart={() => {}}
                  points={trackingPoints}
                  draggable={false}
                  headingTo={
                    data.tracking.mfstate === "ZA"
                      ? "Recogiendo su producto"
                      : data.tracking.mfstate === "AB"
                      ? "Entregando su producto"
                      : data.tracking.mfstate === "BZ"
                      ? "Retornando a la central"
                      : data.tracking.mfstate === "BA"
                      ? "Devolviendo el producto"
                      : "Completed"
                  }
                />
                <AcceptDeliveryModal
                  isOpen={isAcceptModalOpen}
                  onClose={() => setIsAcceptModalOpen(false)}
                  onConfirm={() => {
                    // Handle the confirmation logic here
                    console.log("Delivery accepted!");
                    setIsAcceptModalOpen(false);
                  }}
                  price={deliveryPrice}
                />
                <ShareKeysModal
                  isOpen={isShareModalOpen}
                  onClose={() => setIsShareModalOpen(false)}
                  code={verificationCode}
                  link={verificationLinkCode}
                />
                <ConfirmationModal
                  isOpen={isCancelModalOpen}
                  onClose={() => setIsCancelModalOpen(false)}
                  onConfirm={() => {
                    // Your cancellation logic here
                    console.log("Action confirmed!");
                  }}
                  title="Are you sure?"
                  message="This action cannot be undone. The delivery will be permanently cancelled."
                  confirmText="Yes, cancel"
                  cancelText="No, keep it"
                  danger={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
