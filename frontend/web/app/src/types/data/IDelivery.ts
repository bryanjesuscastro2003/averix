export interface Delivery {
    id: string;
    timestamp: string;
    primaryUser: string;
    secondaryUser: string;
    description: string,
    locationA: string;
    locationB: string;
    locationZ: string;
    instanceId: string;
    startedRequestAt: string;
    acceptedRequestAt: string;
    endedRequestAt: string;
    dstate: string;
    createdAt: string;
    updatedAt: string;
    trackingId: string;
    trackingLogsId: string;
    totalDistance: string;
    totalCost: string;
}

export interface DeliveryData {
    delivery: Delivery;
    tracking: {
        timestamp: string;
        createdAt: string;
        mfZA_endedAt: string | null;
        mfBZ_endedAt: string | null;
        mfAB_endedAt: string | null;
        mfZA_startedAt: string;
        mfBA_startedAt: string | null;
        mfstate: string;
        updatedAt: string;
        mfBZ_startedAt: string | null;
        mfBA_endedAt: string | null;
        trackingLogsId: string;
        dstate: string;
        id: string;
        mfAB_startedAt: string | null;
    };
    trackingLogs: {
        createdAt: string;
        id: string;
        currentLocation: string | null;
        updatedAt: string;
        oldLocation: string | null;
        timestamp: string;
    };
};

export type Location = {
    lat: number;
    lng: number;
};