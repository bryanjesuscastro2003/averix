import React, { useState, useEffect } from "react";
import { DeliveryTable } from "../../../components/chris/delivery/DeliveryTable";
import { StartDeliveryModal } from "../../../components/chris/delivery/StartDeliveryModal";
import { Delivery } from "../../../types/data/IDelivery";
import Louder from "../../../components/chris/louder";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { IResponse } from "../../../types/responses/IResponse";
import { fi } from "date-fns/locale";
import { set } from "date-fns";
import { useAuth } from "../../../context/AuthContext";

const DeliveriesPage: React.FC = () => {
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [filterDestination, setFilterDestination] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { userData } = useAuth();

  const filteredDeliveries = allDeliveries.filter((delivery) => {
    const stateMatch = filter === "" || delivery.dstate === filter;
    const destinationMatch =
      filterDestination === "" || // Add empty check like you did with filter
      (filterDestination === "e" && delivery.primaryUser === userData?.email) ||
      (filterDestination === "r" && delivery.secondaryUser === userData?.email);

    const searchMatch =
      searchTerm === "" || // Add empty check
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.primaryUser || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (delivery.secondaryUser || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Combine all conditions
    return stateMatch && destinationMatch && searchMatch;
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

  const fetchStartDelivery = async (lat: number, lng: number) => {
    try {
      setIsModalLoading(true);
      const response = await fetch(
        DashboardEndpoints.createDeliveryTripEndpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
          body: JSON.stringify({
            locationA: {
              lat,
              lng,
            },
          }),
          mode: "cors",
        }
      );
      const data: IResponse<any> = await response.json();
      if (!data.ok) {
        setError(data.message);
      } else {
        setMessage("Viaje iniciado con éxito");
        fetchDeliveries();
      }
    } catch (error) {
      setError("Error al iniciar el viaje");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleStartNewDelivery = (userLocation: [number, number] | null) => {
    console.log("User location:", userLocation);
    if (!userLocation) {
      setError("Ubicación no válida");
      return;
    }
    fetchStartDelivery(userLocation[0], userLocation[1]);
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

        <div className="flex items-center gap-2">
          <label
            htmlFor="state-filter"
            className="text-sm font-medium text-gray-700"
          >
            Filtrar por destino:
          </label>
          <select
            id="state-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filterDestination}
            onChange={(e) => setFilterDestination(e.target.value)}
          >
            <option value="">All</option>
            <option value="e">Emitente</option>
            <option value="r">Receptor</option>
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
        onClose={() => {
          setIsModalOpen(false);
          setMessage("");
          setError("");
        }}
        onStart={handleStartNewDelivery}
        message={message}
        error={error}
        isModalLoading={isModalLoading}
      />
    </div>
  );
};

export default DeliveriesPage;
