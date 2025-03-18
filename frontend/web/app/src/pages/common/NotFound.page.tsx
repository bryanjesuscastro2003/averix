import React from "react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white">404 - Not Found</h1>
        <p className="mt-4 text-white">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
