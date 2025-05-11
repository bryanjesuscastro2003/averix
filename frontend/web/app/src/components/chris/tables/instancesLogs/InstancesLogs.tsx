import { useState } from "react";
import { Instance } from "./types/instance.model";

// Definición de estilos como constante
const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    backgroundColor: "#f6f7f9",
    padding: "20px",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  wrapper: {
    backgroundColor: "white",
    border: "1px solid #dddfe2",
    borderRadius: "3px",
    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    width: "100%",
  },
  tableHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #dddfe2",
    backgroundColor: "#f6f7f9",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    tableLayout: "fixed" as const,
  },
  th: {
    padding: "10px 12px",
    textAlign: "left" as const,
    fontWeight: 600,
    fontSize: "12px",
    color: "#4b4f56",
    backgroundColor: "#f6f7f9",
    borderBottom: "1px solid #dddfe2",
    position: "sticky" as const,
    top: 0,
  },
  td: {
    padding: "12px",
    fontSize: "13px",
    color: "#1d2129",
    borderBottom: "1px solid #eceeef",
    verticalAlign: "middle" as const,
  },
  statusOk: {
    display: "inline-block",
    padding: "3px 6px",
    borderRadius: "2px",
    fontSize: "11px",
    fontWeight: "bold",
    marginRight: "4px",
    border: "1px solid #b3d4ea",
    backgroundColor: "#e1f3fb",
    color: "#2d609b",
  },
  statusError: {
    display: "inline-block",
    padding: "3px 6px",
    borderRadius: "2px",
    fontSize: "11px",
    fontWeight: "bold",
    marginRight: "4px",
    border: "1px solid #ffc1b8",
    backgroundColor: "#ffebe8",
    color: "#c72e1d",
  },
  batteryContainer: {
    display: "flex",
    alignItems: "center",
  },
  batteryBar: {
    width: "60px",
    height: "6px",
    backgroundColor: "#e9eaed",
    borderRadius: "3px",
    marginRight: "8px",
    overflow: "hidden",
  },
  batteryLevel: (level: number) => ({
    height: "100%",
    backgroundColor: level > 30 ? "#42b72a" : "#f02849",
    borderRadius: "3px",
    width: `${level}%`,
  }),
};

export const InstancesLogs = () => {
  const [capacityFilter, _setCapacityFilter] = useState<boolean>(false);
  const [filteredData, _setFilteredData] = useState<[]>([]);
  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.tableHeader}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#1d2129",
              margin: 0,
            }}
          >
            {capacityFilter
              ? `${capacityFilter} Capacity Instances`
              : "All Instances"}
            <span
              style={{
                color: "#65676b",
                fontWeight: "normal",
                marginLeft: "8px",
              }}
            >
              ({filteredData.length})
            </span>
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Capacity</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Temp/Hum</th>
                <th style={styles.th}>Battery</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((instance: Instance) => (
                <tr
                  key={instance.id}
                  style={{ borderBottom: "1px solid #eceeef" }}
                >
                  <td style={styles.td}>#{instance.id}</td>
                  <td style={styles.td}>{instance.capacity}</td>
                  <td
                    style={{
                      ...styles.td,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {instance.description}
                  </td>
                  <td style={styles.td}>
                    <div>
                      <span style={{ display: "block" }}>
                        {instance.temperature}°C
                      </span>
                      <span style={{ fontSize: "11px", color: "#90949c" }}>
                        {instance.humidity}% humidity
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.batteryContainer}>
                      <div style={styles.batteryBar}>
                        <div
                          style={styles.batteryLevel(instance.batteryLevel)}
                        />
                      </div>
                      <span>{instance.batteryLevel}%</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                    >
                      <span
                        style={
                          instance.isWithOK
                            ? styles.statusOk
                            : styles.statusError
                        }
                      >
                        WiFi
                      </span>
                      <span
                        style={
                          instance.isGpsOK
                            ? styles.statusOk
                            : styles.statusError
                        }
                      >
                        GPS
                      </span>
                      <span
                        style={
                          instance.isImuOK
                            ? styles.statusOk
                            : styles.statusError
                        }
                      >
                        IMU
                      </span>
                      <span
                        style={
                          instance.isCameraOk
                            ? styles.statusOk
                            : styles.statusError
                        }
                      >
                        Camera
                      </span>
                      <span
                        style={
                          instance.isChargerOk
                            ? styles.statusOk
                            : styles.statusError
                        }
                      >
                        Charger
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    {new Date(instance.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
