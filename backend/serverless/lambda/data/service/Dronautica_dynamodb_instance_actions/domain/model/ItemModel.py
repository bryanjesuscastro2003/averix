from dataclasses import dataclass
from typing import Optional


@dataclass
class ItemModel:
    id: Optional[str] = None #PK
    capacity: Optional[str] = None
    description: Optional[str] = None
    name: Optional[str] = None
    model: Optional[str] = None
    dstate: Optional[str] = None    
    isAssociated: Optional[bool] = None
    stationLocation: Optional[str] = None
    
    mqttServiceId: Optional[str] = None
    logsServiceId: Optional[str] = None
    credentialsId: Optional[str] = None

    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None



