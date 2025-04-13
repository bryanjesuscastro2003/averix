
export interface DeliveryData {
    delivery: {
        locationB: string;
        trackingId: string;
        locationA: string;
        acceptedRequestAt: string;
        timestamp: string;
        createdAt: string;
        locationZ: string;
        primaryUser: string;
        secondaryUser: string;
        startedRequestAt: string;
        updatedAt: string;
        instanceId: string;
        dstate: string;
        id: string;
    };
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