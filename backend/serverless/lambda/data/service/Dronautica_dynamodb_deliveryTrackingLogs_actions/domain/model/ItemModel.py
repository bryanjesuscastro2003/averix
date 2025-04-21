from dataclasses import dataclass
from typing import Optional


@dataclass
class ItemModel:
    id: Optional[str] = None #PK
    timestamp: Optional[str] = None #SK

    currentLocation: Optional[str] = None
    oldLocation: Optional[str] = None

    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None



