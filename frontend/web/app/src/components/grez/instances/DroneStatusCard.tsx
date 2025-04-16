import React from 'react';

interface DroneStatusData {
  battery: number;
  capacity: string;
  createdAt: string;
  description: string;
  humidity: number;
  id: string;
  isCameraOk: boolean;
  isChargerOk: boolean;
  isGpsOk: boolean;
  isImuOk: boolean;
  isWifiOk: boolean;
  message: string | null;
  temperature: number;
  updatedAt: string;
}

interface DroneStatusCardProps {
  status: DroneStatusData;
}

export const DroneStatusCard: React.FC<DroneStatusCardProps> = ({ status }) => {
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Función para el color de la batería según el nivel
  const getBatteryColor = (level: number) => {
    if (level > 70) return 'text-green-500';
    if (level > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Función para el ícono de estado del sistema
  const getSystemIcon = (isOk: boolean) => {
    return isOk ? (
      <span className="text-green-500">✓</span>
    ) : (
      <span className="text-red-500">✗</span>
    );
  };

  return (
    <div className="max-w-md rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Estado del Dron #{status.id}</h2>
          <span className="text-xs text-gray-500">
            Actualizado: {formatDate(status.updatedAt)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mt-1">{status.description}</p>
      </div>

      <div className="px-6 py-4">
        {/* Sección de Métricas Ambientales */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold flex items-center justify-center">
              <span className={`text-3xl mr-1 ${getBatteryColor(status.battery)}`}>
                {status.battery}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Batería</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {status.temperature}°C
            </div>
            <p className="text-xs text-gray-500">Temperatura</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {status.humidity}%
            </div>
            <p className="text-xs text-gray-500">Humedad</p>
          </div>
        </div>

        {/* Sección de Estado de Sistemas */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Estado de Sistemas</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              {getSystemIcon(status.isCameraOk)} <span className="ml-2">Cámara</span>
            </div>
            <div className="flex items-center">
              {getSystemIcon(status.isGpsOk)} <span className="ml-2">GPS</span>
            </div>
            <div className="flex items-center">
              {getSystemIcon(status.isImuOk)} <span className="ml-2">IMU</span>
            </div>
            <div className="flex items-center">
              {getSystemIcon(status.isWifiOk)} <span className="ml-2">WiFi</span>
            </div>
            <div className="flex items-center">
              {getSystemIcon(status.isChargerOk)} <span className="ml-2">Cargador</span>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {status.message && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{status.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información técnica */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Capacidad:</span>
            <span className="font-mono">{status.capacity.split('_').join(' ')}</span>
          </div>
          <div className="flex justify-between">
            <span>Creado:</span>
            <span>{formatDate(status.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

