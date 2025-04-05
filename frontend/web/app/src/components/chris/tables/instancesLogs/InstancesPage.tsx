import React, { useState } from "react";
import { InstancesLogs } from "./InstancesLogs";
import { Instance } from "./types/instance.model";

export const InstancesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "high" | "medium" | "low">(
    "all"
  );

  // Datos de ejemplo COMPLETOS
  const mockData: Instance[] = [
    {
      id: "1",
      capacity: "High",
      description: "Main production server",
      temperature: 23.5,
      humidity: 45.2,
      batteryLevel: 78,
      isWithOK: true,
      isGpsOK: true,
      isImuOK: true,
      isCameraOk: true,
      isChargerOk: false,
      message: "All systems operational",
      createdAt: "2025-03-29T11:31:01Z",
      updatedAt: "2025-03-29T11:31:01Z",
    },
    {
      id: "2",
      capacity: "Medium",
      description: "Backup server",
      temperature: 25.1,
      humidity: 50.0,
      batteryLevel: 45,
      isWithOK: true,
      isGpsOK: false,
      isImuOK: true,
      isCameraOk: false,
      isChargerOk: true,
      message: "GPS and Camera issues",
      createdAt: "2025-03-28T10:15:30Z",
      updatedAt: "2025-03-29T10:15:30Z",
    },
    {
      id: "3",
      capacity: "Low",
      description: "Development instance",
      temperature: 28.3,
      humidity: 48.7,
      batteryLevel: 92,
      isWithOK: false,
      isGpsOK: true,
      isImuOK: false,
      isCameraOk: true,
      isChargerOk: true,
      message: "WiFi and IMU not responding",
      createdAt: "2025-03-27T09:45:12Z",
      updatedAt: "2025-03-28T09:45:12Z",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          borderBottom: "1px solid #dddfe2",
        }}>
        <button
          style={activeTab === "all" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("all")}>
          All Instances
        </button>
        <button
          style={activeTab === "high" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("high")}>
          High Capacity
        </button>
        <button
          style={activeTab === "medium" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("medium")}>
          Medium Capacity
        </button>
        <button
          style={activeTab === "low" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("low")}>
          Low Capacity
        </button>
      </div>

      {activeTab === "all" && <InstancesLogs />}
      {activeTab === "high" && <InstancesLogs />}
      {activeTab === "medium" && <InstancesLogs />}
      {activeTab === "low" && <InstancesLogs />}
    </div>
  );
};

// Estilos para las pestañas
const tabStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "none",
  border: "none",
  borderBottom: "3px solid transparent",
  fontWeight: 600,
  color: "#4b4f56",
  cursor: "pointer",
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: "#1877f2",
  borderBottom: "3px solid #1877f2",
};
