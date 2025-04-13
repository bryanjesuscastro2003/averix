export interface Delivery {
  id: string;
  timestamp: string;
  primaryUser: string;
  secondaryUser: string;
  locationA: string;
  locationB: string;
  locationZ: string;
  instanceId: string;
  startedRequestAt: string;
  acceptedRequestAt: string;
  dstate: string;
  createdAt: string;
  updatedAt: string;
}
