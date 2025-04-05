export interface Instance {
  id: string;
  capacity: "High" | "Medium" | "Low";
  description: string;
  temperature: number;
  humidity: number;
  batteryLevel: number;
  isWithOK: boolean;
  isGpsOK: boolean;
  isImuOK: boolean;
  isCameraOk: boolean;
  isChargerOk: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
}
