import React, { useEffect } from "react";
import { DeliveryDetailsRequestCard } from "./DeliveryDetailsRequestCard";
import { useParams } from "react-router-dom";
import { DashboardEndpoints } from "../../../../endpoints/dashboard";
import { IResponse } from "../../../../types/responses/IResponse";
import { Delivery } from "../types";
import { set } from "date-fns";
import { DeliveryAdvanceDetailsPage } from "./advance/DeliveryAdvanceDetailsPage";
import { Loader } from "../../../../components/grez/Louder";

type DeliveryData = {
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

export const DeliveryDetailsPage = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");
  const [deliveryData, setDeliveryData] = React.useState<DeliveryData | null>(
    null
  );
  const [trackingLogsId, setTrackingLogsId] = React.useState<String>("");

  // path variable
  const { instanceId } = useParams();

  const fetchDeliveryData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        DashboardEndpoints.getDeliveryDetailsEndpoint +
          "?instanceId=" +
          instanceId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("idToken"),
          },
          mode: "cors",
        }
      );
      const data: IResponse<DeliveryData> = await response.json();
      if (!response.ok) {
        setMessage(data.message);
        return;
      }
      setDeliveryData(data.data);
      setTrackingLogsId(data.data.trackingLogs.id);
      setMessage("");
    } catch (error) {
      setMessage("Error fetching delivery data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  return (
    <div className="p-4">
      {isLoading || deliveryData === null ? (
        <Loader />
      ) : (
        <DeliveryAdvanceDetailsPage data={deliveryData!} />
      )}
    </div>
  );
};
