import React from 'react';
import { DeliveryTrackingTable } from '../../../../components/grez/delivery/DeliveryTrackingTable';  


export const DeliveryTrackingPage = () => {
  return (
    <div className="delivery-page">
      <h1>AVIREN - Seguimiento de Entregas</h1>
      <p>Registro de movimientos de paquetes</p>
      <DeliveryTrackingTable />
    </div>
  );
};