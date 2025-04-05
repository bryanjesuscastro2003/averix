export interface StationLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface InstanceModel {
  id: string;
  capacity: string;
  description: string;
  name: string;
  model: string;
  dstate: string;
  isAssociated: boolean;
  stationLocation: StationLocation;
  createdAt: string;
  updatedAt: string;
  mqttServiceId: string;
  logsServiceId: string;
  credentialsId: string;
}

export interface InstanceModelFormProps {
  onSubmit: (data: InstanceModel) => void;
  initialData?: Partial<InstanceModel>;
}
