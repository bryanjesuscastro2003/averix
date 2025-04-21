from dataclasses import dataclass
from typing import Optional

@dataclass
class ItemModel:
    id: Optional[str] = None #PK
    timestamp: Optional[str] = None #SK

    primaryUser: Optional[str] = None # REF
    secondaryUser: Optional[str] = None

    locationA: Optional[str] = None
    locationB: Optional[str] = None
    locationZ: Optional[str] = None

    totalCost: Optional[str] = None
    totalDistance: Optional[str] = None
    description: Optional[str] = ""

    instanceId: Optional[str] = None # REF
    trackingId: Optional[str] = None # REF

    startedRequestAt: Optional[str] = None
    acceptedRequestAt: Optional[str] = None
    endedRequestAt: Optional[str] = None
    
    dstate: Optional[str] = "PENDING" # PENDING, CONFIRMED , RUNNNING, COMPLETED, CANCELLED, FAILED

    action: Optional[str] = None 

    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None



