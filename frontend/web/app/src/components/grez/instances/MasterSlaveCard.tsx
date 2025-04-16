import React from 'react';

interface MasterData {
  createdAt: string;
  id: string;
  participants: number;
  timestream: string;
  topicMaster: string;
  updatedAt: string;
}

interface SlaveData {
  createdAt: string;
  id: string;
  instanceId: string;
  masterId: string;
  tiimestamp: string;
  topicSlave: string;
  updatedAt: string;
}

interface MasterSlaveCardProps {
  master: MasterData;
  slave: SlaveData;
}

export const MasterSlaveCard: React.FC<MasterSlaveCardProps> = ({ master, slave }) => {
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Función para formatear el timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseFloat(timestamp) * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-md rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
      {/* Encabezado */}
      <div className="px-6 py-4 bg-indigo-50 border-b">
        <h2 className="text-xl font-bold text-indigo-800">Relación Master-Slave</h2>
        <p className="text-sm text-indigo-600 mt-1">
          Conectado desde: {formatDate(slave.createdAt)}
        </p>
      </div>

      <div className="px-6 py-4">
        {/* Sección Master */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Master</h3>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
              Líder
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-mono">{master.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Participantes</p>
              <p>{master.participants}</p>
            </div>
            <div>
              <p className="text-gray-500">Topic</p>
              <p className="font-mono truncate">{master.topicMaster}</p>
            </div>
            <div>
              <p className="text-gray-500">Creado</p>
              <p>{formatDate(master.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Conexión visual */}
        <div className="flex justify-center my-2">
          <div className="h-8 w-0.5 bg-indigo-300"></div>
        </div>

        {/* Sección Slave */}
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Slave</h3>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              Seguidor
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-mono">{slave.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Instancia</p>
              <p className="font-mono">{slave.instanceId}</p>
            </div>
            <div>
              <p className="text-gray-500">Topic</p>
              <p className="font-mono truncate">{slave.topicSlave}</p>
            </div>
            <div>
              <p className="text-gray-500">Conectado</p>
              <p>{formatDate(slave.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Información de sincronización */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Sincronización</h3>
          <div className="text-xs text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Timestream Master:</span>
              <span>{formatTimestamp(master.timestream)}</span>
            </div>
            <div className="flex justify-between">
              <span>Timestamp Slave:</span>
              <span>{formatTimestamp(slave.tiimestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span>Última actualización:</span>
              <span>{formatDate(master.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

