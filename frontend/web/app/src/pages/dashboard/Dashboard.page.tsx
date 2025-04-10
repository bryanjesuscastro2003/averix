import React from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#072146] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full text-center border border-[#e0e0e0]">
        <div className="mb-8">
          <div className="bg-[#072146] text-white font-bold text-2xl px-4 py-2 rounded-sm inline-block">
            OLI<span className="text-[#00a0d2]">VIA</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#072146] mb-4">
          Panel de Control
        </h1>
        <p className="text-[#5f6c7a] mb-8">
          Bienvenido a su panel de entregas con drones
        </p>

        <div className="space-y-4">
          <Link
            to="/orders"
            className="block w-full py-3 px-4 bg-[#00a0d2] text-white font-medium rounded-sm hover:bg-[#0088b8] transition-colors"
          >
            Historial de Pedidos
          </Link>
          <Link
            to="/track"
            className="block w-full py-3 px-4 bg-[#00a0d2] text-white font-medium rounded-sm hover:bg-[#0088b8] transition-colors"
          >
            Seguimiento de Envío
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#e0e0e0]">
          <p className="text-sm text-[#5f6c7a]">
            Sistema de gestión de entregas con drones
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
