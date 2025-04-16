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
              <th>ID</th>
              <th>Usuario Principal</th>
              <th>Usuario Secundario</th>
              <th>Estado</th>
              <th>Hora de inicio</th>
              <th>Hora de aceptación</th>
              <th>Hora de entrega</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id}>
                <td>{delivery.id}</td>
                <td>{delivery.primaryUser}</td>
                <td>{delivery.secondaryUser}</td>
                <td>
                  <span className={`estado ${delivery.dstate}`}>
                    {delivery.dstate}
                  </span>
                </td>
                <td>{formatDate(delivery.startedRequestAt)}</td>
                <td>{formatDate(delivery.acceptedRequestAt)}</td>
                <td>{formatDate(delivery.startedRequestAt)}</td>
                <td>
                  <button
                    className="btn-detalles"
                    onClick={() => navigate("details/" + delivery.instanceId)}>
                    Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="table-mobile">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="mobile-card">
            <div className="card-header">
              <p>ID: {delivery.id}</p>
              <button
                className="btn-detalles"
                onClick={() => navigate("details/" + delivery.instanceId)}>
                Detalles
              </button>
            </div>
            <div className="card-body">
              <span className={`estado ${delivery.dstate}`}>
                {delivery.dstate}
              </span>
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
