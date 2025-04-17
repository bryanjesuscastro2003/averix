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

const createCustomIcon = (iconUrl: string) => {
  return new L.Icon({
    iconUrl,
    iconSize: [32, 40],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const avirenIcon = createCustomIcon(
  "https://png.pngtree.com/png-vector/20230915/ourmid/pngtree-computation-of-big-data-center-information-processing-database-png-image_10082281.png"
);

const houseIcon = createCustomIcon(
  "https://cdn-icons-png.flaticon.com/512/25/25694.png"
);

const houseServiceIcon = createCustomIcon(
  "https://upload.wikimedia.org/wikipedia/commons/b/b6/Home_icon_red-1.png"
);

const droneIcon = createCustomIcon(
  "https://assets.streamlinehq.com/image/private/w_240,h_240,ar_1/f_auto/v1/icons/robot/drone-q58dx91u8xcta11y58usm.png/drone-5qwuwfpyckq26m2pcygdyj.png?_a=DAJFJtWIZAAC"
);

interface TrackingPoints {
  locationA: { lat: number; lng: number; name: string } | null;
  locationB: { lat: number; lng: number; name: string } | null;
  locationZ: { lat: number; lng: number; name: string } | null;
  locationT: { lat: number; lng: number; name: string } | null;
}

interface MapProps {
  center: [number, number];
  zoom: number;
  onLocationChange?: (lat: number, lng: number) => void;
  draggable?: boolean;
  points?: TrackingPoints;
}

// Componente para detectar clics en el mapa
const LocationMarker: React.FC<{
  initialPosition: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  draggable: boolean;
}> = ({ initialPosition, onPositionChange, draggable }) => {
  const [position, setPosition] = useState(initialPosition);

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
      }}
    >
      <Popup>Ubicación seleccionada</Popup>
    </Marker>
  ) : null;
};

const Mapa: React.FC<MapProps> = ({
  center,
  zoom,
  onLocationChange,
  draggable = true,
  points,
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
    <div className="h-80 w-full rounded-md overflow-hidden">
  <MapContainer
    center={center}
    zoom={zoom}
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores'
    />
    
    {/* Marcadores de ubicaciones */}
    {points?.locationA && (
      <Marker
        position={[points.locationA.lat, points.locationA.lng]}
        icon={houseIcon}
      >
        <Popup>
          <div className="font-semibold">{points.locationA.name}</div>
          <div>Ubicación A</div>
          <div className="text-sm text-gray-600">
            Latitud: {points.locationA.lat.toFixed(6)}, Longitud:{" "}
            {points.locationA.lng.toFixed(6)}
          </div>
        </Popup>
      </Marker>
    )}

    {points?.locationB && (
      <Marker
        position={[points.locationB.lat, points.locationB.lng]}
        icon={houseServiceIcon}
      >
        <Popup>
          <div className="font-semibold">{points.locationB.name}</div>
          <div>Ubicación B</div>
          <div className="text-sm text-gray-600">
            Latitud: {points.locationB.lat.toFixed(6)}, Longitud:{" "}
            {points.locationB.lng.toFixed(6)}
          </div>
        </Popup>
      </Marker>
    )}

    {points?.locationZ && (
      <Marker
        position={[points.locationZ.lat, points.locationZ.lng]}
        icon={avirenIcon}
      >
        <Popup>
          <div className="font-semibold">{points.locationZ.name}</div>
          <div>Ubicación Z</div>
          <div className="text-sm text-gray-600">
            Latitud: {points.locationZ.lat.toFixed(6)}, Longitud:{" "}
            {points.locationZ.lng.toFixed(6)}
          </div>
        </Popup>
      </Marker>
    )}

    {points?.locationT && (
      <Marker
        position={[points.locationT.lat, points.locationT.lng]}
        icon={droneIcon}
      >
        <Popup>
          <div className="font-semibold">{points.locationT.name}</div>
          <div className="text-blue-600">Ubicación del dron</div>
          <div className="text-sm text-gray-600">
            Latitud: {points.locationT.lat.toFixed(6)}, Longitud:{" "}
            {points.locationT.lng.toFixed(6)}
          </div>
        </Popup>
      </Marker>
    )}

    {/* Marcador de ubicación actual */}
    {points === undefined && (
      <LocationMarker
        initialPosition={center}
        onPositionChange={(lat, lng) => {
          if (onLocationChange) onLocationChange(lat, lng);
        }}
        draggable={draggable}
      />
    )}
  </MapContainer>
</div>

  );
};

export default Mapa;
