import React from "react";

const OrderHistoryPage: React.FC = () => {
  const orders = [
    { id: 1, date: "2023-10-01", status: "Delivered" },
    { id: 2, date: "2023-10-05", status: "In Transit" },
    { id: 3, date: "2023-10-10", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Order History
        </h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white bg-opacity-20 p-4 rounded-md"
            >
              <p className="text-white">Order ID: {order.id}</p>
              <p className="text-white">Date: {order.date}</p>
              <p className="text-white">Status: {order.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
