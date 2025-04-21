from dataclasses import dataclass
from typing import Optional

@dataclass
class SlaveModel:
    id: Optional[str] = None 
    timestamp: Optional[str] = None

    masterId: Optional[str] = None
    instanceId: Optional[str] = None
    topicSlave: Optional[str] = None

    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None