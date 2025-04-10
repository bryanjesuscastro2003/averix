export interface IInstance {
    model: string;
    capacity:
    | "DRONAUTICA_SMALL_INSTANCE"
    | "DRONAUTICA_MEDIUM_INSTANCE"
    | "DRONAUTICA_LARGE_INSTANCE"
    | string;
    createdAt: string;
    credentialsId: string;
    logsServiceId: string;
    name: string;
    isAssociated: boolean;
    mqttServiceId: string;
    stationLocation: string;
    updatedAt: string;
    dstate: string;
    description: string;
    id: string;
};