import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardEndpoints } from "../../../../../endpoints/dashboard";
import { IResponse } from "../../../../../types/responses/IResponse";
import { Loader } from "../../../../../components/grez/Louder";
import { DeliveryData } from "../../../../../types/data/IDelivery";
import { DeliveryAdvanceDetailsRequestCard } from "../../../../../components/bryan/delivery/DeliveryAdvanceDetailsRequestCard";
import { BackButton } from "../../../../../components/grez/comun/BackButton";

export const DeliveryDetailsPage = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");
  const [deliveryData, setDeliveryData] = React.useState<DeliveryData | null>(
    null
  );
  const [_trackingLogsId, setTrackingLogsId] = React.useState<String>("");

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
        setMessage(
          "Error al obtener los datos de la entrega, intente de nuevo"
        );
        setDeliveryData(null);
        return;
      }
      setDeliveryData(data.data);
      setTrackingLogsId(data.data.trackingLogs.id);
      setMessage("");
    } catch (error) {
      setMessage("Error al obtener los datos de la entrega, intente de nuevo");
      setDeliveryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  return (
    <div className="p-4">
      <BackButton />
      {isLoading ? (
        <Loader />
      ) : message ? (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <p className="text-sm font-bold text-red-600">{message}</p>
        </div>
      ) : (
        deliveryData && (
          <DeliveryAdvanceDetailsRequestCard dataPacket={deliveryData!} />
        )
      )}
    </div>
  );
};
