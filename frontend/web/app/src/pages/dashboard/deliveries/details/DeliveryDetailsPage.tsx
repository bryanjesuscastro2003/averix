import React from "react";
import { DeliveryDetailsRequestCard } from "./DeliveryDetailsRequestCard";

export const DeliveryDetailsPage = () => {
  const requestData = {
    locationB: '{"lat": 45.333222, "lng": 76.999909}',
    acceptedRequestAt: "2025-04-07T22:20:24.770430",
    timestamp: "2025-04-07T20:51:55.938688",
    primaryUser: "jesusbryam624@gmail.com",
    secondaryUser: "jesusbryan155@gmail.com",
    startedRequestAt: "2025-04-07T20:51:55.938714",
    dstate: "CONFIRMED",
  };

  const trackingPoints = {
    locationA: {
      lat: 18.47697270356747,
      lng: -97.3986123559981,
      name: "Mi casa",
    },
    locationB: {
      lat: 18.473350088972822,
      lng: -97.39535078974275,
      name: "Tacos BB",
    },
    locationZ: {
      lat: 18.475324219897843,
      lng: -97.40245327941716,
      name: "Drone center",
    },
    locationT: {
      lat: 18.47239354313521,
      lng: -97.39775404908877,
      name: "Drone Position",
    },
  };
  return (
    <div className="p-4">
      <DeliveryDetailsRequestCard
        data={requestData}
        trackingPoints={trackingPoints}
      />
    </div>
  );
};
