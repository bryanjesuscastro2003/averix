from dataclasses import dataclass
from typing import Optional

@dataclass
class ItemModel:
    id:  Optional[str] = None
    capacity:  Optional[str] = None
    description:  Optional[str] = None
    temperature:  Optional[float] = 0 
    humidity: Optional[float] = 0 
    battery: Optional[int] = 0
    isWifiOk: Optional[bool] = False 
    isGpsOk: Optional[bool] = False 
    isImuOk: Optional[bool] = False 
    isCameraOk: Optional[bool] = False 
    isChargerOk: Optional[bool] = False 
    message: Optional[str] = None
    createdAt: Optional[str] = None 
    updatedAt: Optional[str] = None 


