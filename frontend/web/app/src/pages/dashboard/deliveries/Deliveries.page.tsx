import React, { useState, useEffect } from "react";
import { DeliveryTable } from "../../../components/chris/delivery/DeliveryTable";
import { StartDeliveryModal } from "../../../components/chris/delivery/StartDeliveryModal";
import { Delivery } from "../../../types/data/IDelivery";
import Louder from "../../../components/chris/louder";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { IResponse } from "../../../types/responses/IResponse";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Pagination } from "../../../components/bryan/Pagination";
import { useWebSocket } from "../../../socket/WebSocketConn";
import { ResponseDeliveryModal } from "../../../components/bryan/delivery/ResponseDeliveryModal";

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
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [isConfirmationCodeLoaded, setIsConfirmationCodeLoaded] =
    useState<boolean>(false);
  const [isConfirmationCodeValid, setIsConfirmationCodeValid] =
    useState<boolean>(true);
  const [showCategory, setShowCategory] = useState<boolean>(true);
  const { userData } = useAuth();
  const { deliveryId } = useParams();

  const { sendMessage, isConnected } = useWebSocket(
    "wss://12voeaacae.execute-api.us-east-1.amazonaws.com/development"
  );
  const navigate = useNavigate();

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Mostrar 4 elementos por página

  const filteredDeliveries = allDeliveries.filter((delivery) => {
    const stateMatch = filter === "" || delivery.dstate === filter;
    const destinationMatch =
      filterDestination === "" ||
      (filterDestination === "e" && delivery.primaryUser === userData?.email) ||
      (filterDestination === "r" && delivery.secondaryUser === userData?.email);

    const searchMatch =
      searchTerm === "" ||
      (delivery.primaryUser || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (delivery.secondaryUser || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (delivery.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return stateMatch && destinationMatch && searchMatch;
  });

  // Calcular elementos para la página actual
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeliveries.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, filterDestination, searchTerm]);

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

  const fetchStartDelivery = async (
    lat: number,
    lng: number,
    capacity: string,
    description: string
  ) => {
    try {
      setIsModalLoading(true);

      const bodyData = !isConfirmationCodeLoaded
        ? {
            locationA: {
              lat,
              lng,
            },
            capacity,
            description,
          }
        : {
            deliveryId: confirmationCode,
            locationB: {
              lat,
              lng,
            },
          };
      const response = await fetch(
        !isConfirmationCodeLoaded
          ? DashboardEndpoints.createDeliveryTripEndpoint
          : DashboardEndpoints.confirmDeliveryTripEndpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
          body: JSON.stringify(bodyData),
          mode: "cors",
        }
      );
      const data:
        | IResponse<{
            deliveryId: string;
            primaryUser: string;
          }>
        | any = await response.json();
      console.log("Response from fetchStartDelivery:", data);
      if (!data.ok) {
        !isConfirmationCodeLoaded
          ? setError(
              data.message ||
                "Error al iniciar el viaje, no hay drones disponibles."
            )
          : setError(
              data.message ||
                "Error al confirmar el viaje, porfavor intente de nuevo"
            );
        setMessage("");
      } else {
        if (!isConfirmationCodeLoaded) {
          navigate("details/" + data.data.deliveryId);
        } else {
          setMessage("Viaje confirmado con éxito. espera instrucciones");
          setError("");
          if (isConnected) {
            sendMessage({
              action: "confirmTrip",
              data: {
                targetUserId: data.data.primaryUser,
                user: userData?.email || "",
                message: "Hello from the client!",
                sessionId: localStorage.getItem("idToken"),
                deliveryId: confirmationCode,
              },
            });
          }
          setIsConfirmationCodeValid(false);
          fetchDeliveries();
          setTimeout(() => {
            // -> go to /dashboard/deliveries with window
            window.location.href = "/dashboard/deliveries";
          }, 2000);
        }
      }
    } catch (error) {
      setError("Error al iniciar el viaje");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleStartNewDelivery = (
    userLocation: [number, number] | null,
    capacity: string,
    description: string
  ) => {
    console.log("User location:", userLocation);
    if (!userLocation) {
      setError("Ubicación no válida");
      return;
    }
    fetchStartDelivery(userLocation[0], userLocation[1], capacity, description);
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
        setMessage("Error al obtener entregas, porfavor recarga la página");
      } else {
        setAllDeliveries(data.data.items);
      }
    } catch (error) {
      setMessage("Error al obtener entregas, porfavor recarga la página");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmationCodeAction = async (deliveryId?: string) => {
    try {
      setIsModalLoading(true);
      setIsModalOpen(true);
      setIsConfirmationCodeValid(false);
      setShowCategory(false);
      console.log(
        "Confirmation code action called with deliveryId:",
        deliveryId
      );
      const response = await fetch(
        DashboardEndpoints.verifyDeliveryTripEndpoint +
          "?deliveryId=" +
          (deliveryId ? deliveryId : confirmationCode),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
          mode: "cors",
        }
      );
      const data: IResponse<any> = await response.json();
      if (!data.ok) {
        setError(
          "Código de confirmación incorrecto, porfavor intente de nuevo"
        );

        setIsConfirmationCodeLoaded(false);
      } else {
        setMessage(
          "Código de confirmación correcto, porfavor confirma el viaje"
        );
        setIsConfirmationCodeLoaded(true);
        setIsConfirmationCodeValid(true);
      }
    } catch (error) {
      setError("Error al verificar el código de confirmación");
      setIsConfirmationCodeLoaded(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const confirmationCodeForButton = () => {
    confirmationCodeAction(confirmationCode);
  };

  useEffect(() => {
    if (deliveryId && deliveryId !== "") {
      if (deliveryId.length > 8) {
        setSearchTerm(deliveryId);
      } else {
        setConfirmationCode(deliveryId);
        confirmationCodeAction(deliveryId);
      }
    }
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
            <option value="">Todos</option>
            {allDeliveries
              .map((delivery) => delivery.dstate)
              .filter((value, index, self) => self.indexOf(value) === index)
              .map((state) => (
                <option key={state} value={state}>
                  {state === "CONFIRMED"
                    ? "Confirmado"
                    : state === "RUNNING"
                    ? "En Progreso"
                    : state === "CANCELED"
                    ? "Cancelado"
                    : state === "COMPLETED"
                    ? "Completado"
                    : state === "PENDING"
                    ? "Pendiente"
                    : state}
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
            <option value="">Todos</option>
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
            placeholder="Buscar usuario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Form to enter a confirmation code text, input, button*/}
      <div className="mb-4 p-4 border rounded-md bg-gray-50">
        <label
          htmlFor="confirmation-code"
          className="block text-sm font-medium text-gray-700"
        >
          Código de Confirmación:
        </label>
        <input
          type="text"
          id="confirmation-code"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          placeholder="Ingrese el código de confirmación"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
        />

        <button
          type="button"
          className="mt-2 px-4 py-3 w-full gap-2 sm:w-auto bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          onClick={confirmationCodeForButton}
          disabled={isLoading}
        >
          Confirmar
        </button>
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Mostrando {currentItems.length} de {filteredDeliveries.length} entregas
        (Página {currentPage} de {totalPages})
      </div>

      <DeliveryTable
        deliveries={currentItems}
        onStartDelivery={handleStartDelivery}
        onCancelDelivery={handleCancelDelivery}
      />

      {/* Paginación */}
      {filteredDeliveries.length > itemsPerPage && (
        <div className="mt-4 flex overflow-x-auto items-center justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center">
          <Louder />
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg w-full text-center align-center "
        >
          <div className="flex justify-center items-center w-full">
            <p className="flex gap-2 text-center items-center">
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
            </p>
          </div>
        </button>
      </div>

      <StartDeliveryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsConfirmationCodeLoaded(false);
          setIsConfirmationCodeValid(true);
          setConfirmationCode("");
          setMessage("");
          setError("");
          setShowCategory(true);
        }}
        onStart={handleStartNewDelivery}
        message={message}
        error={error}
        isModalLoading={isModalLoading}
        block={isConfirmationCodeValid}
        showCategory={showCategory}
      />
    </div>
  );
};

export default DeliveriesPage;
