from dataclasses import dataclass
from typing import Optional

@dataclass
class ItemModel:
    id:  Optional[str] = None
    timestream: Optional[str] = None

    topicMaster: Optional[str] = None
    participants: Optional[int] = 0
    createdAt: Optional[str] = None 
    updatedAt: Optional[str] = None 