import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardEndpoints } from "../../../../endpoints/dashboard";
import { IResponse } from "../../../../types/responses/IResponse";
import { Loader } from "../../../../components/grez/Louder";
import { DeliveryData } from "../../../../types/data/IDelivery";
import { DeliveryAdvanceDetailsRequestCard } from "../../../../components/bryan/delivery/DeliveryAdvanceDetailsRequestCard";

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
        <DeliveryAdvanceDetailsRequestCard data={deliveryData!} />
      )}
    </div>
  );
};
