import React, { useState } from "react";
import { Delivery } from "../../../types/data/IDelivery";
import { useNavigate } from "react-router-dom";
import "./DeliveryTable.css";
import { IResponse } from "../../../types/responses/IResponse";
import { IInstance, PartialDroneData } from "../../../types/data/IInstance";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { DroneModal } from "../../bryan/instances/DroneModal";

interface DeliveryTableProps {
  deliveries: Delivery[];
  onStartDelivery: (id: string) => void;
  onCancelDelivery: (id: string) => void;
}

export const DeliveryTable: React.FC<DeliveryTableProps> = ({
  deliveries,
  onStartDelivery,
  onCancelDelivery,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [droneData, setDroneData] = useState<PartialDroneData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const fetchPartialDrone = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        DashboardEndpoints.getInstanceEndpoint +
          "?instanceId=" +
          id +
          "&action=PARTIAL",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("idToken"),
          },
        }
      );
      const data: IResponse<{
        ITEM: IInstance;
      }> = await response.json();
      console.log(data, "data");

      if (data.ok) {
        setDroneData({
          capacity: data.data.ITEM.capacity,
          description: data.data.ITEM.description,
          model: data.data.ITEM.model,
        });
        setIsModalOpen(true);
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="table-container">
      {/* Desktop Table */}
      <div className="table-desktop">
        <table className="delivery-table">
          <thead>
            <tr>
              <th>Usuario Principal</th>
              <th>Usuario Secundario</th>
              <th>Estado</th>
              <th>Descripcion</th>
              <th>Hora de inicio</th>
              <th>Hora de aceptación</th>
              <th>Hora de entrega</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id}>
                <td>{delivery.primaryUser}</td>
                <td>{delivery.secondaryUser}</td>
                <td>
                  <span className={`estado ${delivery.dstate}`}>
                    {delivery.dstate}
                  </span>
                </td>
                <td>
                  <span className="text-sm ">
                    {delivery.description
                      ? delivery.description
                      : "Sin descripción"}
                  </span>
                </td>
                <td>{formatDate(delivery.startedRequestAt)}</td>
                <td>{formatDate(delivery.acceptedRequestAt)}</td>
                <td>{formatDate(delivery.endedRequestAt)}</td>
                <td className="flex gap-2 ">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 border border-gray-300 hover:border-gray-400 shadow-sm"
                    onClick={() => navigate("details/" + delivery.id)}
                  >
                    Detalles
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      isLoading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={() =>
                      !isLoading && fetchPartialDrone(delivery.instanceId)
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Cargando...
                      </span>
                    ) : (
                      "Ver dron"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="table-mobile delivery-list-mobile">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="delivery-card">
            {/* Card Header */}
            <div className="card-header flex justify-between items-center p-3 bg-gray-50 border-b">
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500 mr-1">
                  ID:
                </span>
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {delivery.primaryUser}
                </p>
              </div>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 border border-gray-300 hover:border-gray-400 shadow-sm"
                onClick={() => navigate("details/" + delivery.id)}
              >
                Detalles
              </button>
            </div>

            {/* Card Body */}
            <div className="card-body p-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span
                  className={`status-pill ${delivery.dstate} px-2 py-1 text-xs font-medium rounded-full capitalize`}
                >
                  {delivery.dstate}
                </span>
                <button
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() =>
                    !isLoading && fetchPartialDrone(delivery.instanceId)
                  }
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Cargando...
                    </span>
                  ) : (
                    "Ver dron"
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {delivery.description || "Sin descripción"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {deliveries.length === 0 && (
        <div className="no-data">No se encontraron entregas</div>
      )}
      <DroneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        droneData={droneData}
      />
    </div>
  );
};
