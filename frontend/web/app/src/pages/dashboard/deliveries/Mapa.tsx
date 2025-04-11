import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Configuración del ícono del marcador
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  center: [number, number];
  zoom: number;
  onLocationChange?: (lat: number, lng: number) => void;
  draggable?: boolean;
}

// Componente para detectar clics en el mapa
const LocationMarker: React.FC<{
  initialPosition: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  draggable: boolean;
}> = ({ initialPosition, onPositionChange, draggable }) => {
  const [position, setPosition] = useState(initialPosition);

  const map = useMapEvents({
    click(e) {
      if (draggable) {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        onPositionChange(newPos[0], newPos[1]);
      }
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={defaultIcon}
      draggable={draggable}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          onPositionChange(newPos.lat, newPos.lng);
        },
      }}>
      <Popup>Ubicación seleccionada</Popup>
    </Marker>
  ) : null;
};

const Mapa: React.FC<MapProps> = ({
  center,
  zoom,
  onLocationChange,
  draggable = true,
}) => {
  // Solución para el renderizado del mapa en Next.js/React
  const [mapReady, setMapReady] = useState(false);

  React.useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady)
    return (
      <div className="h-64 w-full bg-gray-200 animate-pulse rounded-md"></div>
    );

  return (
    <div className="h-96 w-full rounded-md overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker
          initialPosition={center}
          onPositionChange={(lat, lng) => {
            if (onLocationChange) onLocationChange(lat, lng);
          }}
          draggable={draggable}
        />
      </MapContainer>
    </div>
  );
};

export default Mapa;
