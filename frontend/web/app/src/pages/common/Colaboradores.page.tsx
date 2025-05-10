import React from "react";

export const Colaboradores = () => {
  return (
    <div className="bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800">Sobre Nosotros</h2>
        <p className="mt-4 text-gray-600 text-lg">
          En <strong>AVIREN</strong>, desarrollamos un sistema inteligente de entrega de paquetes mediante drones autónomos, optimizando rutas en tiempo real con tecnologías como IoT y AWS. Nuestro objetivo es revolucionar la logística urbana, haciendo las entregas más rápidas, seguras y eficientes.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-200"></div>
          <h3 className="mt-4 text-xl font-semibold text-gray-700">Jesús Emmanuel Grez García</h3>
          <p className="text-gray-500">Líder de Proyecto / Desarrollador Frontend</p>
        </div>

        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-200"></div>
          <h3 className="mt-4 text-xl font-semibold text-gray-700">[Nombre del colaborador]</h3>
          <p className="text-gray-500">Desarrollador Backend</p>
        </div>

        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-200"></div>
          <h3 className="mt-4 text-xl font-semibold text-gray-700">[Nombre del colaborador]</h3>
          <p className="text-gray-500">Especialista en IoT</p>
        </div>

        {/* Agrega más colaboradores si es necesario */}
      </div>
    </div>
  );
};
