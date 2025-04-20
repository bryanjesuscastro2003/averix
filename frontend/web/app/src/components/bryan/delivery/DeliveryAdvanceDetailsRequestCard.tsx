import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { StartDeliveryModal } from "../../chris/delivery/StartDeliveryModal";
import { DeliveryData, Location } from "../../../types/data/IDelivery";
import { AcceptDeliveryModal } from "./AcceptDeliveryModal";
import { ShareKeysModal } from "./ShareKeysModal";
import { ConfirmationModal } from "../ConfirmationModal";
import { useAuth } from "../../../context/AuthContext";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../../socket/WebSocketConn";
import { ResponseDeliveryModal } from "./ResponseDeliveryModal";

export const DeliveryAdvanceDetailsRequestCard: React.FC<{
  dataPacket: DeliveryData;
}> = ({ dataPacket }) => {
  // Parse locations
  const [data, setData] = useState<DeliveryData>(dataPacket);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState(data.delivery.id);
  const [verificationLinkCode, setVerificationLinkCode] = useState(
    "https://7vlx93vd-5175.usw3.devtunnels.ms/dashboard/deliveries/" +
      data.delivery.id
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { sendMessage, isConnected, addMessageHandler } = useWebSocket(
    "wss://12voeaacae.execute-api.us-east-1.amazonaws.com/development"
  );

  const { userData } = useAuth();
  const navigate = useNavigate();

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

  type point = {
    lat: number;
    lng: number;
    name: string;
  } | null;

  const [trackingPoints, setTrackingPoints] = useState<{
    locationA: point;
    locationB: point;
    locationZ: point;
    locationT: point;
  }>({
    locationA: locationA !== null ? { name: "Tienda", ...locationA } : null,
    locationB: locationB !== null ? { name: "Cliente", ...locationB } : null,
    locationZ: locationZ !== null ? { name: "Central", ...locationZ } : null,
    locationT:
      locationT !== null ? { name: "Ubicación actual", ...locationT } : null,
  });

  const acceptService = async () => {
    try {
      const response = await fetch(
        DashboardEndpoints.acceptDeliveryTripEndpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("idToken"),
          },
          body: JSON.stringify({
            deliveryId: data.delivery.id,
            instanceId: data.delivery.instanceId,
          }),
        }
      );
      const dataResponse = await response.json();
      console.log("Response:", dataResponse);
      if (!response.ok) {
        // Handle error
      } else {
        if (isConnected) {
          sendMessage({
            action: "acceptTrip",
            data: {
              targetUserId: data.delivery.secondaryUser,
              user: userData?.email || "",
              message: "Hello from the client!",
            },
          });
        }
        navigate("/dashboard/deliveries");
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      console.log("Service accepted");
      setIsAcceptModalOpen(false);
    }
  };

  const cancelService = async () => {
    try {
      const response = await fetch(
        DashboardEndpoints.cancelDeliveryTripEndpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("idToken"),
          },
          body: JSON.stringify({
            deliveryId: data.delivery.id,
            instanceId: data.delivery.instanceId,
          }),
        }
      );
      const dataResponse = await response.json();
      console.log("Response:", dataResponse);
      if (!response.ok) {
      } else {
        navigate("/dashboard/deliveries");
      }
    } catch (e) {
    } finally {
    }
  };

  const startTrankingService = () => {
    if (isConnected && data.delivery.dstate === "RUNNING") {
      console.log("Sending startTracking message");
      sendMessage({
        action: "trackingStart",
        data: {
          targetUserId: "",
          user: userData?.email || "",
          sessionId: localStorage.getItem("idToken"),
          message: "Hello from the client!",
          deliveryId: data.delivery.id,
        },
      });
    }
    setIsModalOpen(true);
  };

  const finishTrankingService = () => {
    if (isConnected) {
      sendMessage({
        action: "trackingFinish",
        data: {
          targetUserId: "",
          user: userData?.email || "",
          sessionId: localStorage.getItem("idToken"),
          message: "Hello from the client!",
        },
      });
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    const cleanup = addMessageHandler(
      (dataMessage: { lat: string; lng: string; mfstate: string }) => {
        try {
          const lat = parseFloat(dataMessage.lat);
          const lng = parseFloat(dataMessage.lng);
          const mfstate = dataMessage.mfstate;
          if (mfstate !== data.tracking.mfstate) {
            setData((prev) => ({
              ...prev,
              tracking: {
                ...prev.tracking,
                mfstate: mfstate,
              },
            }));
          }
          const location = {
            lat: lat,
            lng: lng,
            name: "Ubicación actual",
          };
          setTrackingPoints((prev) => ({
            ...prev,
            locationT: location,
          }));
          console.log("Received location update:", location);
        } catch (error) {
          console.error("Error processing notification:", error);
        }
      }
    );

    return cleanup;
  }, [addMessageHandler]);

  useEffect(() => {
    console.log("Tracking Points:", trackingPoints);
    console.log("Location A:", data.delivery);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Panel de Seguimiento de Entregas
        </h1>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery Info Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Informacion del viaje
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Usuario Principal
                    </h3>
                    <p className="text-gray-900">{data.delivery.primaryUser}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Usuario Secundario
                    </h3>
                    <p className="text-gray-900">
                      {data.delivery.secondaryUser}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Iniciado En
                    </h3>
                    <p className="text-gray-900">
                      {formatDate(data.delivery.startedRequestAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Aceptado En
                    </h3>
                    <p className="text-gray-900">
                      {data.delivery.acceptedRequestAt !== null
                        ? formatDate(data.delivery.acceptedRequestAt)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Finalizado En
                    </h3>
                    <p className="text-gray-900">
                      {data.delivery.endedRequestAt !== null
                        ? formatDate(data.delivery.endedRequestAt)
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="gap-4">
                  <div className="grid grid-cols-1 mb-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      Descripción:
                    </h3>
                    <p className="text-gray-900">
                      {data.delivery.description
                        ? data.delivery.description
                        : "Sin descripción"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Progreso de la Ruta:
                      {data.tracking.mfstate === "ZA"
                        ? "  Recogiendo el producto"
                        : data.tracking.mfstate === "AB"
                        ? "  Entregando el producto"
                        : data.tracking.mfstate === "BZ"
                        ? "  Retornando a la central"
                        : data.tracking.mfstate === "BA"
                        ? "  Devolviendo el producto"
                        : "  Completado"}
                    </h3>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width:
                            data.tracking.mfstate === "ZA"
                              ? "30%"
                              : data.delivery.dstate === "AB"
                              ? "60%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 w-full mt-8 flex justify-center gap-4">
                  {data.delivery.dstate !== "PENDING" ? (
                    <>
                      {data.delivery.dstate === "CANCELED" ? (
                        <p className="text-red-500 text-sm">
                          Entrega cancelada
                        </p>
                      ) : data.delivery.dstate === "RUNNING" ? (
                        <button
                          onClick={startTrankingService}
                          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg w-full text-center w-full"
                        >
                          <p className="text-center w-full">Seguimiento</p>
                        </button>
                      ) : data.delivery.dstate === "COMPLETED" ? (
                        <p className="text-green-500 text-sm">
                          Entrega completada
                        </p>
                      ) : data.delivery.primaryUser === userData?.email &&
                        data.delivery.dstate === "CONFIRMED" ? (
                        <button
                          onClick={() => setIsAcceptModalOpen(true)}
                          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg w-full text-center"
                        >
                          <p className="text-center w-full">Aceptar</p>
                        </button>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          En espera de la aceptación del viaje
                        </p>
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
                          Claves de confirmación
                        </p>
                      </button>
                    </>
                  )}
                </div>
                <StartDeliveryModal
                  isOpen={isModalOpen}
                  onClose={finishTrankingService}
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
                      : "Completado"
                  }
                  deliveryId={data.delivery.id}
                />
                <AcceptDeliveryModal
                  isOpen={isAcceptModalOpen}
                  onClose={() => setIsAcceptModalOpen(false)}
                  onCancel={() => setIsCancelModalOpen(true)}
                  onConfirm={acceptService}
                  price={parseFloat(data.delivery.totalCost)}
                  distance={parseFloat(data.delivery.totalDistance)}
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
                  onConfirm={cancelService}
                  title="¿Estás seguro?"
                  message="Esta acción no se puede deshacer. La entrega será cancelada permanentemente."
                  confirmText="Sí, cancelar"
                  cancelText="No, mantener"
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
