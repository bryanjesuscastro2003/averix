import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface TrackingData {
  id: string;
  timestamp: string;
  dstate: string;
  mfZA_startedAt: string;
  mfZA_endedAt: string;
  mfAB_startedAt: string;
  mfAB_endedAt: string;
  mfBA_startedAt: string;
  mfBA_endedAt: string;
  mfBZ_startedAt: string;
  mfBZ_endedAt: string;
}

export const DeliveryTrackingTable = () => {
  const [data, setData] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://tu-api.com/api/delivery-tracking')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="aviren-container">
      <div className="aviren-header" style={{ backgroundColor: '#2d3748' }}>
        <h1>AVIREN - Seguimiento</h1>
      </div>

      <table className="instance-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Estado</th>
            <th>ZA</th>
            <th>AB</th>
            <th>BA</th>
            <th>BZ</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{format(new Date(item.timestamp), 'dd/MM/yy HH:mm')}</td>
              <td className={`status-${item.dstate.toLowerCase()}`}>{item.dstate}</td>
              <td>{formatTime(item.mfZA_startedAt)} - {formatTime(item.mfZA_endedAt)}</td>
              <td>{formatTime(item.mfAB_startedAt)} - {formatTime(item.mfAB_endedAt)}</td>
              <td>{formatTime(item.mfBA_startedAt)} - {formatTime(item.mfBA_endedAt)}</td>
              <td>{formatTime(item.mfBZ_startedAt)} - {formatTime(item.mfBZ_endedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  function formatTime(dateString: string) {
    return dateString ? format(new Date(dateString), 'HH:mm') : '-';
  }
};