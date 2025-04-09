import React, { useState } from "react";
import { DeliveryTable } from "./DeliveryTable";
import { StartDeliveryModal } from "./StartDeliveryModal";
import { Delivery } from "./types";

const DeliveriesPage: React.FC = () => {
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([
    {
      id: "del-001",
      timestamp: "2025-04-07T11:52:10Z",
      primaryUser: "user1@example.com",
      secondaryUser: "user2@example.com",
      locationA: "Almacén Central",
      locationB: "Punto Intermedio",
      locationZ: "Cliente Final",
      instanceId: "inst-001",
      startedRequestAt: "2025-04-07T10:00:00Z",
      acceptedRequestAt: "2025-04-07T10:05:00Z",
      dstate: "in-progress",
      action: "Ver detalles",
      createdAt: "2025-04-07T09:30:00Z",
      updatedAt: "2025-04-07T11:52:10Z",
    },
    {
      id: "del-002",
      timestamp: "2025-04-07T11:55:10Z",
      primaryUser: "user3@example.com",
      secondaryUser: "user4@example.com",
      locationA: "Almacén Norte",
      locationB: "Punto Distribución",
      locationZ: "Cliente Empresarial",
      instanceId: "inst-002",
      startedRequestAt: "2025-04-07T09:00:00Z",
      acceptedRequestAt: "2025-04-07T09:10:00Z",
      dstate: "completed",
      action: "Ver detalles",
      createdAt: "2025-04-07T08:30:00Z",
      updatedAt: "2025-04-07T11:55:10Z",
    },
    {
      id: "del-003",
      timestamp: "2025-04-07T11:50:10Z",
      primaryUser: "user5@example.com",
      secondaryUser: "user6@example.com",
      locationA: "Almacén Sur",
      locationB: "Centro Logístico",
      locationZ: "Cliente Residencial",
      instanceId: "inst-003",
      startedRequestAt: "2025-04-07T11:30:00Z",
      acceptedRequestAt: "",
      dstate: "pending",
      action: "Ver detalles",
      createdAt: "2025-04-07T11:20:00Z",
      updatedAt: "2025-04-07T11:50:10Z",
    },
  ]);

  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredDeliveries = allDeliveries.filter((delivery) => {
    const stateMatch = filter === "all" || delivery.dstate === filter;
    const searchMatch =
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.primaryUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.secondaryUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.locationA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.locationZ.toLowerCase().includes(searchTerm.toLowerCase());
    return stateMatch && searchMatch;
  });

  const handleStartDelivery = (id: string) => {
    setAllDeliveries(
      allDeliveries.map((delivery) =>
        delivery.id === id
          ? {
              ...delivery,
              dstate: "in-progress",
              acceptedRequestAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : delivery
      )
    );
  };

  const handleCancelDelivery = (id: string) => {
    setAllDeliveries(
      allDeliveries.map((delivery) =>
        delivery.id === id
          ? {
              ...delivery,
              dstate: "cancelled",
              updatedAt: new Date().toISOString(),
            }
          : delivery
      )
    );
  };

  const handleStartNewDelivery = () => {
    const newDelivery: Delivery = {
      id: `del-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      primaryUser: "usuario_actual@example.com",
      secondaryUser: "",
      locationA: "Mi Ubicación Actual",
      locationB: "Punto Intermedio",
      locationZ: "Destino Automático",
      instanceId: `inst-${Math.floor(Math.random() * 1000)}`,
      startedRequestAt: new Date().toISOString(),
      acceptedRequestAt: "",
      dstate: "pending",
      action: "Ver detalles",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAllDeliveries([...allDeliveries, newDelivery]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Sistema de Entregas con Drones
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="state-filter"
            className="text-sm font-medium text-gray-700">
            Filtrar por estado:
          </label>
          <select
            id="state-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="in-progress">En progreso</option>
            <option value="completed">Completados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="Buscar por ID, usuario o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Mostrando {filteredDeliveries.length} de {allDeliveries.length} entregas
      </div>

      <DeliveryTable
        deliveries={filteredDeliveries}
        onStartDelivery={handleStartDelivery}
        onCancelDelivery={handleCancelDelivery}
      />

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Iniciar Viaje
        </button>
      </div>

      <StartDeliveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStartNewDelivery}
      />
    </div>
  );
};

export default DeliveriesPage;
