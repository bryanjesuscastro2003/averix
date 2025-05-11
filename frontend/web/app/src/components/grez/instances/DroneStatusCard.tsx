import React from "react";
import {
  FiBattery,
  FiThermometer,
  FiDroplet,
  FiAlertTriangle,
} from "react-icons/fi";
import { IInstanceStatus } from "../../../types/data/IInstance";

interface DroneStatusCardProps {
  status: IInstanceStatus;
}

export const DroneStatusCard: React.FC<DroneStatusCardProps> = ({ status }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getBatteryColor = (level: number) => {
    if (level > 70) return "text-green-500";
    if (level > 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getSystemIcon = (isOk: boolean) =>
    isOk ? (
      <span className="text-green-500 font-bold">✓</span>
    ) : (
      <span className="text-red-500 font-bold">✗</span>
    );

  return (
    <div className="w-full max-w-md mx-auto sm:max-w-full sm:px-4 md:px-6 lg:px-8 mb-6 border border-gray-600 shadow-md p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Dron #{status.id}
          </h2>
          <p className="text-sm text-gray-500">{status.description}</p>
        </div>
        <span className="text-xs text-gray-400">
          Actualizado: {formatDate(status.updatedAt)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <FiBattery
            className={`mx-auto text-2xl ${getBatteryColor(status.battery)}`}
          />
          <p
            className={`text-lg font-semibold ${getBatteryColor(
              status.battery
            )}`}
          >
            {status.battery}%
          </p>
          <p className="text-xs text-gray-500">Batería</p>
        </div>
        <div>
          <FiThermometer className="mx-auto text-2xl text-orange-500" />
          <p className="text-lg font-semibold">{status.temperature}°C</p>
          <p className="text-xs text-gray-500">Temperatura</p>
        </div>
        <div>
          <FiDroplet className="mx-auto text-2xl text-blue-500" />
          <p className="text-lg font-semibold">{status.humidity}%</p>
          <p className="text-xs text-gray-500">Humedad</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Estado de Sistemas
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          <div className="flex items-center">
            {getSystemIcon(status.isCameraOk)}
            <span className="ml-2">Cámara</span>
          </div>
          <div className="flex items-center">
            {getSystemIcon(status.isGpsOk)}
            <span className="ml-2">GPS</span>
          </div>
          <div className="flex items-center">
            {getSystemIcon(status.isImuOk)}
            <span className="ml-2">IMU</span>
          </div>
          <div className="flex items-center">
            {getSystemIcon(status.isWifiOk)}
            <span className="ml-2">WiFi</span>
          </div>
          <div className="flex items-center">
            {getSystemIcon(status.isChargerOk)}
            <span className="ml-2">Cargador</span>
          </div>
        </div>
      </div>

      {status.message && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 flex items-start gap-2">
          <FiAlertTriangle className="text-yellow-500 mt-0.5" />
          <p className="text-sm text-yellow-800">{status.message}</p>
        </div>
      )}

      <div className="border-t pt-3 text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Capacidad:</span>
          <span className="font-mono">
            {status.capacity.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Creado:</span>
          <span>{formatDate(status.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
