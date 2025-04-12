import React, { useState } from "react";
import Mapa from "./Mapa";

interface TrackingPoints {
  locationA: { lat: number; lng: number; name: string };
  locationB: { lat: number; lng: number; name: string };
  locationZ: { lat: number; lng: number; name: string };
  locationT: { lat: number; lng: number; name: string };
}

interface StartDeliveryModalProps {
  isOpen: boolean;
  points?: TrackingPoints;
  draggable?: boolean;
  onClose: () => void;
  onStart: () => void;
}

export const StartDeliveryModal: React.FC<StartDeliveryModalProps> = ({
  isOpen,
  onClose,
  onStart,
  points,
  draggable = true,
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    !draggable ? [points!.locationA.lat, points!.locationA.lng] : null
  );

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        () => {
          // Fallback a una ubicación por defecto si hay error
          setUserLocation([19.4326, -99.1332]); // Ciudad de México
        }
      );
    } else {
      alert("Geolocalización no soportada en este navegador");
      setUserLocation([19.4326, -99.1332]); // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Confirmar Ubicación</h2>
        </div>

        <div className="p-4">
          {userLocation ? (
            <div className="mb-4">
              <Mapa
                center={
                  points === undefined
                    ? userLocation
                    : [points.locationA.lat, points.locationA.lng]
                }
                zoom={15}
                onLocationChange={(lat: number, lng: number) =>
                  // console.log(lat, lng)
                  setUserLocation([lat, lng])
                }
                draggable={draggable}
                points={points}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <button
                onClick={getUserLocation}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Obtener mi ubicación
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            {draggable ? "Cancelar" : "Cerrar"}
          </button>

          {draggable && (
            <>
              <button
                onClick={() => {
                  onStart();
                  onClose();
                }}
                disabled={!userLocation}
                className={`px-4 py-2 rounded-md text-white ${
                  userLocation
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Confirmar Ubicacion
                {/*userLocation*/}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
