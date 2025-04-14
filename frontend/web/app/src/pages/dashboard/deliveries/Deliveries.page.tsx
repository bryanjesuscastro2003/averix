import React, { useState, useEffect } from "react";
import { DeliveryTable } from "./DeliveryTable";
import { StartDeliveryModal } from "./StartDeliveryModal";
import { Delivery } from "./types";
import Louder from "../../../components/chris/louder";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { IResponse } from "../../../types/responses/IResponse";
import { fi } from "date-fns/locale";

const DeliveriesPage: React.FC = () => {
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const filteredDeliveries = allDeliveries.filter((delivery) => {
    const stateMatch = filter === "" || delivery.dstate === filter;
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

  const handleStartNewDelivery = (userLocation: [number, number] | null) => {
    console.log("User location:", userLocation);
  };

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(DashboardEndpoints.getDeliveriesEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
        },
        mode: "cors",
      });
      const data: IResponse<{ count: number; items: Delivery[] }> =
        await response.json();
      if (!data.ok) {
        setMessage(data.message);
      } else {
        setAllDeliveries(data.data.items);
      }
      console.log("Fetched deliveries:", data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Sistema de Entregas con Drones
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="state-filter"
            className="text-sm font-medium text-gray-700"
          >
            Filtrar por estado:
          </label>
          <select
            id="state-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            {allDeliveries
              .map((delivery) => delivery.dstate)
              .filter((value, index, self) => self.indexOf(value) === index)
              .map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
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
      {isLoading && (
        <div className="flex justify-center">
          <Louder />
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
