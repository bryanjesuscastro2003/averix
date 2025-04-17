import { useState } from "react";
import { useNavigate } from "react-router-dom"; // or your preferred routing method
import { DashboardEndpoints } from "../../../endpoints/dashboard";
import { IResponse } from "../../../types/responses/IResponse";
import Louder from "../../../components/chris/louder";
import { BackButton } from "../../../components/grez/comun/BackButton";

type DroneModel = "DRONEC1" | "DRONEC2" | "DRONEC3";
type DroneCapacity =
  | "DRONAUTICA_SMALL_INSTANCE"
  | "DRONAUTICA_MEDIUM_INSTANCE"
  | "DRONAUTICA_LARGE_INSTANCE";

interface DroneFormData {
  name: string;
  model: DroneModel | "";
  capacity: DroneCapacity | "";
  description: string;
}

export const CreateInstancePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DroneFormData>({
    name: "",
    model: "",
    capacity: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const modelOptions: DroneModel[] = ["DRONEC1", "DRONEC2", "DRONEC3"];
  const capacityOptions: DroneCapacity[] = [
    "DRONAUTICA_SMALL_INSTANCE",
    "DRONAUTICA_MEDIUM_INSTANCE",
    "DRONAUTICA_LARGE_INSTANCE",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.model ||
      !formData.capacity ||
      !formData.description
    ) {
      setMessage("Name, Model, Capacity and Description are required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your actual API call
      const response = await fetch(DashboardEndpoints.createInstanceEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("idToken"),
        },
        body: JSON.stringify({
          name: formData.name,
          model: formData.model,
          capacity: formData.capacity,
          description: formData.description, // Send undefined if empty
        }),
      });

      const data: IResponse<{ instanceId: string }> = await response.json();

      setIsLoading(false);

      if (data.ok) {
        setFormData({
          name: "",
          model: "",
          capacity: "",
          description: "",
        });

        navigate("/dashboard/admin/instances");
      }

      setMessage(data.message);
    } catch (err) {
      setMessage("Failed to create the instance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <BackButton>
  
  </BackButton>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Crear nuevo Dron
      </h2>

      {message && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Modelo *
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Seleccionar una opcion</option>
            {modelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Capacidad*
          </label>
          <select
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Selecccionar capacidad</option>
            {capacityOptions.map((capacity) => (
              <option key={capacity} value={capacity}>
                {capacity
                  .replace("DRONAUTICA_", "")
                  .replace("_INSTANCE", "")
                  .replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descripcion *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/drones")} // or your cancel behavior
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            Crear Dron
          </button>
        </div>
        {isLoading && <Louder />}
      </form>
    </div>
  );
};
