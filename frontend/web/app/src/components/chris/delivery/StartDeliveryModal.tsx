import React, { useState } from "react";
import Mapa from "./Mapa";
import Louder from "../louder";
import { se } from "date-fns/locale";

interface TrackingPoints {
  locationA: { lat: number; lng: number; name: string } | null;
  locationB: { lat: number; lng: number; name: string } | null;
  locationZ: { lat: number; lng: number; name: string } | null;
  locationT: { lat: number; lng: number; name: string } | null;
}

interface StartDeliveryModalProps {
  isOpen: boolean;
  points?: TrackingPoints;
  draggable?: boolean;
  headingTo?: string;
  onClose: () => void;
  onStart: (userLocation: [number, number] | null) => void;
}

export const StartDeliveryModal: React.FC<StartDeliveryModalProps> = ({
  isOpen,
  onClose,
  onStart,
  points,
  draggable = true,
  headingTo = "",
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    !draggable
      ? points?.locationA !== null
        ? [points!.locationA.lat, points!.locationA.lng]
        : [19.4326, -99.1332]
      : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getUserLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          setIsLoading(false);
        },
        () => {
          // Fallback a una ubicación por defecto si hay error
          setUserLocation([19.4326, -99.1332]); // Ciudad de México
          setIsLoading(false);
        }
      );
    } else {
      alert("Geolocalización no soportada en este navegador");
      setUserLocation([19.4326, -99.1332]); // Fallback
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">
            {draggable ? "Confirmar Ubicación" : "Rastreo de Entrega"}
          </h2>
          <h3 className="text-sm text-blue-500 font-bold">{headingTo}</h3>
        </div>

        <div className="p-4">
          {userLocation ? (
            <div className="mb-4">
              <Mapa
                center={
                  points === undefined
                    ? userLocation
                    : points.locationA !== null
                    ? [points.locationA.lat, points.locationA.lng]
                    : [19.4326, -99.1332]
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
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-white ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Obtener mi ubicación
              </button>
              {isLoading && (
                <div className="mt-2">
                  <Louder />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              setUserLocation(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            {draggable ? "Cancelar" : "Cerrar"}
          </button>

          {draggable && (
            <>
              <button
                onClick={() => {
                  onStart(userLocation);
                  onClose();
                  setUserLocation(null);
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
