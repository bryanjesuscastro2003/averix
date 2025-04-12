import { DeliveryTrackingLogsTable } from '../../../../components/grez/delivery/DeliveryTrackingLogsTable';
import React from 'react'

interface TrackingLog {
  id: string;
  timestamp: string;
  currentLocation: string;
  oldLocation: string;
  createdAt: string;
  updatedAt: string;
}

export const TrackingLogsPage = () => {
  // Datos de ejemplo (reemplaza con tus datos reales)
  const logsData: TrackingLog[] = [
    {
      id: "log-1",
      timestamp: new Date().toISOString(),
      currentLocation: "Zona B",
      oldLocation: "Zona A",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // Ayer
      currentLocation: "Zona C",
      oldLocation: "Zona B",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return (
    <div className="page-container">
      <h2>Registros de Seguimiento</h2>
      <DeliveryTrackingLogsTable data={logsData} />
    </div>
  );
};