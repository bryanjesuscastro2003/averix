import React from "react";
import { Delivery } from "../../../types/data/IDelivery";

import { useNavigate } from "react-router-dom";

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
    <div className="">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario Principal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario Secundario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora de inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora de aceptación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora de entrega
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {delivery.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {delivery.primaryUser}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {delivery.secondaryUser}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${
                    delivery.dstate === "completed"
                      ? "bg-green-100 text-green-800"
                      : delivery.dstate === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : delivery.dstate === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {delivery.dstate}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(delivery.startedRequestAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(delivery.acceptedRequestAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(delivery.startedRequestAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                  <button
                    className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300 transition"
                    onClick={() => navigate("details/" + delivery.instanceId)}>
                    Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
