import React, { useState } from "react";
import { InstancesLogs } from "./InstancesLogs";

export const InstancesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "high" | "medium" | "low">(
    "all"
  );

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          borderBottom: "1px solid #dddfe2",
        }}
      >
        <button
          style={activeTab === "all" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("all")}
        >
          All Instances
        </button>
        <button
          style={activeTab === "high" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("high")}
        >
          High Capacity
        </button>
        <button
          style={activeTab === "medium" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("medium")}
        >
          Medium Capacity
        </button>
        <button
          style={activeTab === "low" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("low")}
        >
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
