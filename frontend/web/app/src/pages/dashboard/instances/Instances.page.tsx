import { useState, useEffect } from "react";
import { Pagination } from "../../../components/bryan/Pagination";
import Louder from "../../../components/chris/louder";
import Navigate, { Link, useNavigate } from "react-router-dom";
import { IInstance } from "../../../types/data/IInstance";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { IResponse } from "../../../types/responses/IResponse";

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
  const navigate= useNavigate()
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [isAssociatedFilter, setIsAssociatedFilter] = useState<boolean | null>(
    null
  );
  const [capacityFilter, setCapacityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    // Simulate API fetch
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

    // status filter
    if (statusFilter) {
      result = result.filter((drone) =>
        drone.dstate.toLowerCase().includes(statusFilter.toLowerCase())
      );
    }

    if (capacityFilter) {
      result = result.filter((drone) => drone.capacity === capacityFilter);
    }

    setFilteredDrones(result);
  }, [nameFilter, isAssociatedFilter, capacityFilter, drones, statusFilter]);

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
      <h1 className="text-2xl font-bold mb-6">Drones Management</h1>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Filter by name"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Filter by name"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Association Status
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
              <option value="">All</option>
              <option value="true">Associated</option>
              <option value="false">Not Associated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="">All</option>
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
        Showing {filteredDrones.length} of {drones.length} drones
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created at
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  acciones
                </th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isloading && <Louder />}
              {message && <div className="p-4 text-red-500">{message}</div>}
              {filteredDrones.length > 0 ? (
                filteredDrones.map((drone) => (
                  <tr key={drone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {drone.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {drone.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.capacity
                        .replace("DRONAUTICA_", "")
                        .replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          drone.isAssociated
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {drone.isAssociated ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseLocation(drone.stationLocation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.dstate.replace("_ST_", " ").replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(drone.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(drone.updatedAt)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                      onClick={()=>{
                      navigate(drone.id)
                      }}
                      >
                        detalles
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No drones found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
      </div>
      <div className="flex justify-end py-4">
        <Link
          to="createInstance"
          className="px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        >
          Create New Instance
        </Link>
      </div>
    </div>
  );
};
