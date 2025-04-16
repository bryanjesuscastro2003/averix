import React from 'react';

interface DroneData {
  capacity: string;
  createdAt: string;
  credentialsId: string;
  description: string;
  dstate: string;
  id: string;
  isAssociated: boolean;
  logsServiceId: string;
  model: string;
  mqttServiceId: string;
  name: string;
  stationLocation: string | null;
  updatedAt: string;
}

interface DroneCardProps {
  drone: DroneData;
}

export const DroneCard: React.FC<DroneCardProps> = ({ drone }) => {
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Función para determinar el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNAVAILABLE':
        return 'bg-red-100 text-red-800';
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-md rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
      <div className="px-6 py-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-gray-800">{drone.name}</h2>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(drone.dstate)}`}>
            {drone.dstate.replace('_', ' ')}
          </span>
        </div>
        
        <p className="text-gray-600 italic mb-4">{drone.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Modelo</h3>
            <p className="text-lg font-medium">{drone.model}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Capacidad</h3>
            <p className="text-lg font-medium">{drone.capacity.split('_').join(' ')}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ID:</span>
            <span className="font-mono">{drone.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Creado:</span>
            <span>{formatDate(drone.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Actualizado:</span>
            <span>{formatDate(drone.updatedAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Asociado:</span>
            <span className={drone.isAssociated ? 'text-green-600' : 'text-red-600'}>
              {drone.isAssociated ? 'Sí' : 'No'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-6 pt-4 pb-2 bg-gray-50">
        <div className="flex justify-between text-xs text-gray-500">
          <span>MQTT: {drone.mqttServiceId}</span>
          <span>Logs: {drone.logsServiceId}</span>
          <span>Creds: {drone.credentialsId}</span>
        </div>
      </div>
    </div>
  );
};

