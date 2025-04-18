import React from "react";
import { IInstance } from "../../../types/data/IInstance";

interface DroneCardProps {
  drone: IInstance;
}

export const DroneCard: React.FC<DroneCardProps> = ({ drone }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNAVAILABLE":
        return "bg-red-100 text-red-800";
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "IN_USE":
        return "bg-blue-100 text-blue-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto sm:max-w-full sm:px-4 md:px-6 lg:px-8 mb-6 border border-gray-600 shadow-md">
      <div className="rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {drone.name}
            </h2>
            <span
              className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(
                drone.dstate
              )}`}
            >
              {drone.dstate.replace("_", " ")}
            </span>
          </div>

          <p className="text-gray-600 italic mb-4 text-sm sm:text-base">
            {drone.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500">
                Modelo
              </h3>
              <p className="text-base sm:text-lg font-medium">{drone.model}</p>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500">
                Capacidad
              </h3>
              <p className="text-base sm:text-lg font-medium">
                {drone.capacity.split("_").join(" ")}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID:</span>
              <span className="font-mono">{drone.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Creado:</span>
              <span>{formatDate(drone.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Actualizado:</span>
              <span>{formatDate(drone.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Asociado:</span>
              <span
                className={
                  drone.isAssociated ? "text-green-600" : "text-red-600"
                }
              >
                {drone.isAssociated ? "Sí" : "No"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] sm:text-xs text-gray-500 gap-1 sm:gap-4">
            <span>MQTT: {drone.mqttServiceId}</span>
            <span>Logs: {drone.logsServiceId}</span>
            <span>Creds: {drone.credentialsId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
