import React from "react";
import { Delivery } from "../../../types/data/IDelivery";
import { useNavigate } from "react-router-dom";
import "./DeliveryTable.css";

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
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
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
                <td>
                  <button
                    className="btn-detalles"
                    onClick={() => navigate("details/" + delivery.id)}
                  >
                    Detalles
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
                className="btn-details px-3 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                onClick={() => navigate("details/" + delivery.id)}
              >
                Detalles
              </button>
            </div>

            {/* Card Body */}
            <div className="card-body p-3 space-y-2">
              <div className="flex items-center">
                <span
                  className={`status-pill ${delivery.dstate} px-2 py-1 text-xs font-medium rounded-full capitalize`}
                >
                  {delivery.dstate}
                </span>
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
    </div>
  );
};
