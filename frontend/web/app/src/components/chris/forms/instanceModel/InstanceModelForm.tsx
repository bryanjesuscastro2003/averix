import { useState } from "react";
import {
  InstanceModel,
  InstanceModelFormProps,
  StationLocation,
} from "./types";

export const InstanceModelForm = () => {
  const [formData, setFormData] = useState<Partial<InstanceModel>>({
    isAssociated: false,
    stationLocation: { lat: 0, lng: 0, address: "" },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      stationLocation: {
        ...prev.stationLocation!,
        [name]: name === "lat" || name === "lng" ? Number(value) : value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //onSubmit(formData as InstanceModel);
  };

  // Estilo reutilizable para inputs
  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
    color: "#333",
    marginBottom: "5px",
  };

  return (
    <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: "20px",
    }}
  >
    <div
      style={{
        width: "800px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        padding: "25px",
      }}
    >
      <h2
        style={{
          color: "#333",
          textAlign: "center",
          marginBottom: "25px",
          fontSize: "24px",
        }}
      >
        Formulario de Modelo de Instancia
      </h2>
  
      <form onSubmit={handleSubmit}>
        {/* Primera fila */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              ID (Clave primaria)
            </label>
            <input
              type="text"
              name="id"
              style={inputStyle}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              Capacidad (Clave secundaria)
            </label>
            <input
              type="text"
              name="capacity"
              style={inputStyle}
              onChange={handleChange}
              required
            />
          </div>
        </div>
  
        {/* Segunda fila */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              Nombre
            </label>
            <input
              type="text"
              name="name"
              style={inputStyle}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              Modelo
            </label>
            <input
              type="text"
              name="model"
              style={inputStyle}
              onChange={handleChange}
              required
            />
          </div>
        </div>
  
        {/* Tercera fila */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              Estado del dispositivo
            </label>
            <input
              type="text"
              name="dstate"
              style={inputStyle}
              onChange={handleChange}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              ID del servicio MQTT (Referencia)
            </label>
            <input
              type="text"
              name="mqttServiceId"
              style={inputStyle}
              onChange={handleChange}
            />
          </div>
        </div>
  
        {/* Cuarta fila */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              ID del servicio de registros (Referencia)
            </label>
            <input
              type="text"
              name="logsServiceId"
              style={inputStyle}
              onChange={handleChange}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              ID de credenciales (Referencia)
            </label>
            <input
              type="text"
              name="credentialsId"
              style={inputStyle}
              onChange={handleChange}
            />
          </div>
        </div>
  
        {/* Descripción */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "block", marginBottom: "5px", color: "#333" }}
          >
            Descripción
          </label>
          <textarea
            name="description"
            style={{ ...inputStyle, height: "80px" }}
            onChange={handleChange}
          />
        </div>
  
        {/* Checkbox */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <input
            type="checkbox"
            name="isAssociated"
            checked={formData.isAssociated || false}
            onChange={handleChange}
            style={{ marginRight: "10px" }}
          />
          <label style={{ color: "#333" }}>Está asociado</label>
        </div>
  
        {/* Ubicación de la estación */}
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#555" }}>Ubicación de la estación</h3>
  
          <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#333",
                }}
              >
                Latitud
              </label>
              <input
                type="number"
                name="lat"
                value={formData.stationLocation?.lat || 0}
                onChange={handleLocationChange}
                step="any"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#333",
                }}
              >
                Longitud
              </label>
              <input
                type="number"
                name="lng"
                value={formData.stationLocation?.lng || 0}
                onChange={handleLocationChange}
                step="any"
                style={inputStyle}
              />
            </div>
          </div>
  
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
              }}
            >
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.stationLocation?.address || ""}
              onChange={handleLocationChange}
              style={inputStyle}
            />
          </div>
        </div>
  
        {/* Botón de envío */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#4267b2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  </div>
  
  );
};
