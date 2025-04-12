// components/DeliveryTrackingLogsTable.tsx
import { format } from 'date-fns';
import React from 'react'

interface DeliveryTrackingLog {
  id: string;
  timestamp: string;
  currentLocation: string;
  oldLocation: string;
  createdAt: string;
  updatedAt: string;
}

export const DeliveryTrackingLogsTable = ({ data }: { data: DeliveryTrackingLog[] }) => {
  return (
    <div className="aviren-container" style={{ marginTop: '40px' }}>
      <div className="aviren-header" style={{ backgroundColor: '#4a5568' }}>
        <h1>AVIREN - Registros de Seguimiento</h1>
        <p>Historial de cambios de ubicación</p>
      </div>

      <div className="table-wrapper">
        <table className="instance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>Ubicación Actual</th>
              <th>Ubicación Anterior</th>
              <th>Creado</th>
              <th>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={`${item.id}-${item.timestamp}`}>
                <td className="id-cell">{item.id}</td>
                <td>{format(new Date(item.timestamp), 'dd/MM/yy HH:mm:ss')}</td>
                <td className="name-cell">{item.currentLocation}</td>
                <td>{item.oldLocation}</td>
                <td>{format(new Date(item.createdAt), 'dd/MM/yy')}</td>
                <td>{format(new Date(item.updatedAt), 'dd/MM/yy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};