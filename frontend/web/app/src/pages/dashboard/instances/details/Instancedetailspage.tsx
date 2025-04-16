import { useEffect } from "react"
import { DashboardEndpoints } from "../../../../endpoints/dashboard"
import { useParams } from "react-router-dom"
import { DroneCard } from "../../../../components/grez/instances/DroneCard"
import { DroneStatusCard } from "../../../../components/grez/instances/DroneStatusCard"
import { MasterSlaveCard } from "../../../../components/grez/instances/MasterSlaveCard"
import { DroneCertificateCard } from "../../../../components/grez/instances/DroneCertificateCard"

export const InstanceDetailsPage =()=>{
    
     const {InstanceId}=useParams()

     const fetch_instance=async()=>{
       const response = await fetch(
        DashboardEndpoints.getInstanceEndpoint + "?instanceId="+InstanceId ,{
            method:"GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("idToken"),
              }
        } 
       )
       const data=await response.json()
       console.log(data)

     }

     const droneData = {
      capacity: "DRONAUTICA_SMALL_INSTANCE",
      createdAt: "2025-04-16T04:05:07.983338",
      credentialsId: "c5aa",
      description: "model black",
      dstate: "UNAVAILABLE",
      id: "9563",
      isAssociated: false,
      logsServiceId: "8542",
      model: "DRONEC1",
      mqttServiceId: "e3dc",
      name: "GREZZ_1",
      stationLocation: null,
      updatedAt: "2025-04-16T04:05:11"
    };

    const droneStatusData = {
      battery: 0,
      capacity: "DRONAUTICA_SMALL_INSTANCE",
      createdAt: "2025-04-16T04:05:10.889793",
      description: "model black",
      humidity: 0,
      id: "8542",
      isCameraOk: false,
      isChargerOk: false,
      isGpsOk: false,
      isImuOk: false,
      isWifiOk: false,
      message: null,
      temperature: 0,
      updatedAt: "2025-04-16T04:05:10"
    };

    const slaveData = {
      createdAt: "2025-04-16T04:05:11.663073",
      id: "e3dc",
      instanceId: "9563",
      masterId: "3231",
      tiimestamp: "1744776311.663059",
      topicSlave: "dronautica/data/682a",
      updatedAt: "2025-04-16T04:05:11"
    };

    const masterData = {
      createdAt: "2025-04-08T23:05:01.806463",
      id: "3231",
      participants: 5,
      timestream: "1744153501.806449",
      topicMaster: "dronautica/data/56dc",
      updatedAt: "2025-04-16T04:05:11.622787"
    };

    const certificateData = {
      certificateArn: "arn:aws:iot:us-east-1:533266982909:cert/6c1e26fdeed84a34908b1056f24369281b4c3547571985f010098e36b204957e",
      certificateId: "6c1e26fdeed84a34908b1056f24369281b4c3547571985f010098e36b204957e",
      certificatePem: "certificates/Instance-9563/certificate.pem",
      certificateS3Path: "s3://dronautica/certificates/Instance-9563/",
      createdAt: "2025-04-16T04:05:09.868808",
      id: "c5aa",
      privateKey: "certificates/Instance-9563/private.key",
      publicKey: "certificates/Instance-9563/public.key",
      thing: "Instance-9563",
      timestamp: "2025-04-16T04:05:09.868793",
      updatedAt: "2025-04-16T04:05:09"
    };

    useEffect(() => {
      console.log(InstanceId)
      fetch_instance()
    
      return () => {
        
      }
    }, [])
    



    return (
        <div>
               <DroneCard drone={droneData} />
               <DroneStatusCard status={droneStatusData} />
               <MasterSlaveCard  master={masterData} slave={slaveData} />
               <DroneCertificateCard certificate={certificateData} />
        </div>
    )
}