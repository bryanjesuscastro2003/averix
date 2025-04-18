import { useEffect, useState } from "react";
import { DashboardEndpoints } from "../../../../endpoints/dashboard";
import { useParams } from "react-router-dom";
import { DroneCard } from "../../../../components/grez/instances/DroneCard";
import { DroneStatusCard } from "../../../../components/grez/instances/DroneStatusCard";
import { MasterSlaveCard } from "../../../../components/grez/instances/MasterSlaveCard";
import { DroneCertificateCard } from "../../../../components/grez/instances/DroneCertificateCard";
import { BackButton } from "../../../../components/grez/comun/BackButton";
import { IResponse } from "../../../../types/responses/IResponse";
import {
  IInstance,
  IInstanceCertificate,
  IInstanceMaster,
  IInstanceSlave,
  IInstanceStatus,
} from "../../../../types/data/IInstance";
import { Loader } from "../../../../components/grez/Louder";

export const InstanceDetailsPage = () => {
  const { InstanceId } = useParams();
  const [instanceData, setInstanceData] = useState<{
    CERTITEM: IInstanceCertificate;
    ITEM: IInstance;
    LOGSITEM: IInstanceStatus;
    MASTER: IInstanceMaster;
    SLAVE: IInstanceSlave;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetch_instance = async () => {
    try {
      const response = await fetch(
        DashboardEndpoints.getInstanceEndpoint + "?instanceId=" + InstanceId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("idToken"),
          },
        }
      );
      const data: IResponse<{
        CERTITEM: IInstanceCertificate;
        ITEM: IInstance;
        LOGSITEM: IInstanceStatus;
        MASTER: IInstanceMaster;
        SLAVE: IInstanceSlave;
      }> = await response.json();
      if (data.ok) {
        setInstanceData(data.data);
        setMessage(null);
        setLoading(false);
        console.log(instanceData, " aa");
      } else {
        setLoading(false);
        setMessage(" Error al cargar la instancia, por favor intente de nuevo");
      }
      console.log(message, " bb");
    } catch (error) {
      setLoading(false);
      setMessage("Error al cargar la instancia, por favor intente de nuevo");
    }
  };

  useEffect(() => {
    fetch_instance();
    return () => {};
  }, []);

  return (
    <div className="p-4">
      <BackButton></BackButton>
      {loading ? (
        <Loader />
      ) : message !== null ? (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <p className="text-sm font-bold text-red-600">{message}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <DroneCard drone={instanceData?.ITEM!} />
          <DroneStatusCard status={instanceData?.LOGSITEM!} />
          <MasterSlaveCard
            master={instanceData?.MASTER!}
            slave={instanceData?.SLAVE!}
          />
          <DroneCertificateCard certificate={instanceData?.CERTITEM!} />
        </div>
      )}
    </div>
  );
};
