import React from "react";
import { IInstanceMaster, IInstanceSlave } from "../../../types/data/IInstance";

interface MasterSlaveCardProps {
  master: IInstanceMaster;
  slave: IInstanceSlave;
}

export const MasterSlaveCard: React.FC<MasterSlaveCardProps> = ({
  master,
  slave,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseFloat(timestamp) * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="w-full max-w-md mx-auto sm:max-w-full sm:px-4 md:px-6 lg:px-8 mb-6 border border-gray-600 shadow-md">
      {/* Encabezado */}
      <div className="bg-indigo-50 border-b rounded-t-2xl">
        <h2 className="text-xl font-bold text-indigo-800">
          Relación Master-Slave
        </h2>
        <p className="text-sm text-indigo-600 mt-1">
          Conectado desde: {formatDate(slave.createdAt)}
        </p>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sección Master */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Master</h3>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
              Líder
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-mono break-all">{master.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Participantes</p>
              <p>{master.participants}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500">Topic</p>
              <p className="font-mono break-all">{master.topicMaster}</p>
            </div>
            <div>
              <p className="text-gray-500">Creado</p>
              <p>{formatDate(master.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Sección Slave */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Slave</h3>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              Seguidor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-mono break-all">{slave.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Instancia</p>
              <p className="font-mono break-all">{slave.instanceId}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500">Topic</p>
              <p className="font-mono break-all">{slave.topicSlave}</p>
            </div>
            <div>
              <p className="text-gray-500">Conectado</p>
              <p>{formatDate(slave.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Sección de sincronización (abajo en pantallas pequeñas, al lado en grandes) */}
        <div className="lg:col-span-2 mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Sincronización
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600">
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
