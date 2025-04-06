import React from "react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center border border-gray-200">
      <h1 className="text-2xl font-bold text-blue-900">404 - Página no encontrada</h1>
      <p className="mt-3 text-gray-600">
        Lo sentimos, la página que buscas no está disponible.
      </p>
    </div>
  </div>
  );
};

export default NotFoundPage;
