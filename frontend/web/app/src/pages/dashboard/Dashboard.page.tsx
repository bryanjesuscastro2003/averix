import React from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-4 text-white">
          Welcome to your drone delivery dashboard!
        </p>
        <div className="mt-6 space-y-4">
          <Link
            to="/orders"
            className="block w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"
          >
            View Order History
          </Link>
          <Link
            to="/track"
            className="block w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"
          >
            Track Delivery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
