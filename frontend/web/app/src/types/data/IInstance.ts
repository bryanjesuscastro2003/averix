export interface IInstance {
    model: string;
    capacity: string | any;
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


export interface IInstanceStatus {
    battery: number;
    capacity: string;
    createdAt: string;
    description: string;
    humidity: number;
    id: string;
    isCameraOk: boolean;
    isChargerOk: boolean;
    isGpsOk: boolean;
    isImuOk: boolean;
    isWifiOk: boolean;
    message: string | null;
    temperature: number;
    updatedAt: string;
};


export interface IInstanceSlave {
    createdAt: string;
    id: string;
    instanceId: string;
    masterId: string;
    tiimestamp: string;
    topicSlave: string;
    updatedAt: string;
};

export type DroneCapacity =
    | "DRONAUTICA_SMALL_INSTANCE"
    | "DRONAUTICA_MEDIUM_INSTANCE"
    | "DRONAUTICA_LARGE_INSTANCE";

export interface PartialDroneData {
    model: string;
    capacity: DroneCapacity;
    description: string;
}

export interface IInstanceMaster {
    createdAt: string;
    id: string;
    participants: number;
    timestream: string;
    topicMaster: string;
    updatedAt: string;
};

export interface IInstanceCertificate {
    certificateArn: string;
    certificateId: string;
    certificatePem: string;
    certificateS3Path: string;
    createdAt: string;
    id: string;
    privateKey: string;
    publicKey: string;
    thing: string;
    timestamp: string;
    updatedAt: string;
}