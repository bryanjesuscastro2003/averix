import { useState, useEffect } from "react";
import { Pagination } from "../../../components/bryan/Pagination";
import Louder from "../../../components/chris/louder";
import { Link, useNavigate } from "react-router-dom";
import { IInstance } from "../../../types/data/IInstance";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { IResponse } from "../../../types/responses/IResponse";
import "./Instancessyles.css";

const capacityOptions = [
  "DRONAUTICA_SMALL_INSTANCE",
  "DRONAUTICA_MEDIUM_INSTANCE",
  "DRONAUTICA_LARGE_INSTANCE",
] as const;

export const InstancesPage = () => {
  const [drones, setDrones] = useState<IInstance[]>([]);
  const [filteredDrones, setFilteredDrones] = useState<IInstance[]>([]);
  const [isloading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Mostrar 4 elementos por página

  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [isAssociatedFilter, setIsAssociatedFilter] = useState<boolean | null>(
    null
  );
  const [capacityFilter, setCapacityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        setLoading(true);
        const response = await fetch(DashboardEndpoints.getInstancesEndpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("idToken"),
          },
        });

        const data: IResponse<{
          count: number;
          instances: IInstance[];
        }> = await response.json();
        setDrones(data.data.instances);
        setFilteredDrones(data.data.instances);
        if (!data.ok) setMessage(data.message);
      } catch (err) {
        setMessage("Failed to fetch drones");
      } finally {
        setLoading(false);
      }
    };

    fetchDrones();
  }, []);

  useEffect(() => {
    // Apply filters whenever they change
    let result = [...drones];

    if (nameFilter) {
      result = result.filter((drone) =>
        drone.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (isAssociatedFilter !== null) {
      result = result.filter(
        (drone) => drone.isAssociated === isAssociatedFilter
      );
    }

    if (statusFilter) {
      result = result.filter((drone) =>
        drone.dstate.toLowerCase().includes(statusFilter.toLowerCase())
      );
    }

    if (capacityFilter) {
      result = result.filter((drone) => drone.capacity === capacityFilter);
    }

    setFilteredDrones(result);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [nameFilter, isAssociatedFilter, capacityFilter, drones, statusFilter]);

  // Calcular drones para la página actual
  const totalPages = Math.ceil(filteredDrones.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDrones.slice(indexOfFirstItem, indexOfLastItem);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseLocation = (locationString: string) => {
    try {
      const location = JSON.parse(locationString);
      return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    } catch {
      return "Invalid location";
    }
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Panel de Drones</h1>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Filtro por nombre"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
            </label>
            <input
              type="text"
              placeholder="Filtro por estado"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Asociacion
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={
                isAssociatedFilter === null ? "" : String(isAssociatedFilter)
              }
              onChange={(e) =>
                setIsAssociatedFilter(
                  e.target.value === "" ? null : e.target.value === "true"
                )
              }
            >
              <option value="">Todos</option>
              <option value="true">Asociados</option>
              <option value="false">No asociados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {capacityOptions.map((capacity) => (
                <option key={capacity} value={capacity}>
                  {capacity.replace("DRONAUTICA_", "").replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-2 text-sm text-gray-600">
        Showing {currentItems.length} of {filteredDrones.length} drones (Page{" "}
        {currentPage} of {totalPages})
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto p-4 font-sans">
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr>
                {[
                  "Nombre",
                  "Modelo",
                  "Capacidad",
                  "Asociados",
                  "Locacion",
                  "Estado",
                  "Creado",
                  "Actualizado",
                  "Acciones",
                ].map((header) => (
                  <th
                    key={header}
                    className="p-2 border border-gray-300 text-left text-xs font-bold uppercase bg-gray-100"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isloading && <Louder />}
              {message && <div className="p-4 text-red-500">{message}</div>}
              {currentItems.length > 0 ? (
                currentItems.map((drone) => (
                  <tr key={drone.id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-300 text-sm">
                      <div className="font-medium text-gray-900">
                        {drone.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {drone.description}
                      </div>
                    </td>
                    <td className="p-2 border border-gray-300 text-sm text-gray-500">
                      {drone.model}
                    </td>
                    <td className="p-2 border border-gray-300 text-sm text-gray-500">
                      {drone.capacity
                        .replace("DRONAUTICA_", "")
                        .replace("_", " ")}
                    </td>
                    <td className="p-2 border border-gray-300">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full 
                  ${
                    drone.isAssociated
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                      >
                        {drone.isAssociated ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-300 text-sm text-gray-500">
                      {parseLocation(drone.stationLocation)}
                    </td>
                    <td className="p-2 border border-gray-300 text-sm text-gray-500">
                      {drone.dstate.replace("_ST_", " ").replace(/_/g, " ")}
                    </td>
                    <td className="p-2 border border-gray-300 text-sm text-gray-500">
                      {formatDate(drone.createdAt)}
                    </td>
                    <td className="p-2 border border-gray-300 text-sm text-gray-500">
                      {formatDate(drone.updatedAt)}
                    </td>
                    <td className="p-2 border border-gray-300 text-sm text-gray-500">
                      <button
                        onClick={() => navigate(drone.id)}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 text-sm transition-colors"
                      >
                        Detalles
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="p-4 text-center text-sm text-gray-500 border border-gray-300"
                  >
                    Ningun Dron
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        {filteredDrones.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <div className="flex justify-end py-4">
        <Link
          to="createInstance"
          className="px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        >
          Crear nuevo Dron
        </Link>
      </div>
    </div>
  );
};
