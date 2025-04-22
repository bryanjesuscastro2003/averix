import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Pagination } from "../../../components/bryan/Pagination";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useEffect } from "react";
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { IProfile } from "../../../types/data/IUser";
import { IResponse } from "../../../types/responses/IResponse";
import Louder from "../../../components/chris/louder";

export const ProfilesPage = () => {
  const [users, setUsers] = useState<IProfile[]>([]);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Mostrar 4 elementos por página

  const { userData } = useAuth();

  // Status options including all available statuses
  const statusOptions = [
    "ALL",
    ...Array.from(
      new Set(users.map((user) => (user.enabled ? "ACTIVE" : "SUSPENDED")))
    ),
  ];

  // Filtrar usuarios
  const filteredUsers = users.filter(
    (user) =>
      user.attributes.email
        .toLowerCase()
        .includes(usernameFilter.toLowerCase()) &&
      (statusFilter === "ALL" || user.enabled === (statusFilter === "ACTIVE"))
  );

  // Calcular páginas y elementos a mostrar
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), "MMM dd, yyyy HH:mm");
  };

  const fetchToggleUserStatus = async (username: string, state: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(DashboardEndpoints.setProfileStatus, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("idToken"),
        },
        body: JSON.stringify({
          username,
          action: state ? "enable" : "disable",
        }),
      });
      const data: IResponse<null> = await response.json();

      if (!data.ok) {
        setMessage(data.message || "Error al cambiar el estado del usuario");
      }
    } catch (error) {
      setMessage("Error al cambiar el estado del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = (username: string) => {
    const currentState = users.find(
      (user) => user.username === username
    )?.enabled;
    fetchToggleUserStatus(username, !currentState!);
    setUsers(
      users.map((user) =>
        user.username === username
          ? {
              ...user,
              enabled: !user.enabled,
              status: !user.enabled ? "ACTIVE" : "SUSPENDED",
              modified: new Date().toISOString(),
            }
          : user
      )
    );
  };

  const handleDeliveries = (username: string) => {
    navigate("/dashboard/deliveries/" + username);
  };

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(DashboardEndpoints.getProfilesEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("idToken"),
        },
      });
      const data: IResponse<{
        users: IProfile[];
        pagination: {
          next_token: any;
          total_count: number;
        };
      }> = await response.json();
      if (data.ok) {
        setUsers(data.data.users);
      } else {
        setMessage(
          data.message ||
            "Error al obtener los perfiles, por favor intente de nuevo"
        );
      }
    } catch (error) {
      setMessage("Error al obtener los perfiles, por favor intente de nuevo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [usernameFilter, statusFilter]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panel de Usuarios</h1>

      {/* Filter controls */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="usernameFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filtro por correo
          </label>
          <input
            type="text"
            id="usernameFilter"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="buscar email..."
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="statusFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filtrar por estado
          </label>
          <select
            id="statusFilter"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status == "ALL"
                  ? "Todos"
                  : status == "ACTIVE"
                  ? "Activos"
                  : "Suspendidos"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-2 text-sm text-gray-600">
        Mostrando {currentItems.length} de {filteredUsers.length} usuarios
        (Pagina {currentPage} de {totalPages})
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modificado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confirmado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entregas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && <Louder />}
            {message && <div className="p-4 text-red-500">{message}</div>}
            {currentItems.length > 0 ? (
              currentItems.map((user) => (
                <tr
                  key={user.username}
                  className={
                    user.attributes.email === userData?.email
                      ? "bg-gray-100 hover:bg-gray-200"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.attributes.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.enabled === true
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.enabled === true ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(user.created)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(user.modified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-medium
                        ${
                          user.attributes.email_verified === "true"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {user.attributes.email_verified === "true"
                        ? "Confirmed"
                        : "Unconfirmed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeliveries(user.attributes.email)}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs hover:bg-indigo-200"
                    >
                      Ver entregas
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.attributes["custom:role"] === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.attributes["custom:role"]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user.username)}
                        disabled={userData?.email === user.attributes.email}
                        className={`px-3 py-1 rounded-md text-xs font-medium
                          ${
                            user.enabled
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                      >
                        {user.enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Ningun Usuario
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex overflow-x-auto items-center justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create New Profile Button */}
      <div className="flex justify-end">
        <Link
          to="createProfile"
          className="px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        >
          Crear nuevo perfil
        </Link>
      </div>
    </div>
  );
};
