import React from "react";

const TrackDeliveryPage: React.FC = () => {
  const delivery = {
    id: 1,
    status: "In Transit",
    location: "123 Main St, City",
    estimatedDelivery: "2023-10-15",
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Track Delivery
        </h1>
        <div className="space-y-4">
          <p className="text-white">Delivery ID: {delivery.id}</p>
          <p className="text-white">Status: {delivery.status}</p>
          <p className="text-white">Location: {delivery.location}</p>
          <p className="text-white">
            Estimated Delivery: {delivery.estimatedDelivery}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackDeliveryPage;
