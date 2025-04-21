from dataclasses import dataclass
from typing import Optional


@dataclass
class ItemModel:
    id: Optional[str] = None #PK
    timestamp: Optional[str] = None #SK

    mfstate: Optional[str] = "ZA"

    mfZA_startedAt: Optional[str] = None
    mfAB_startedAt: Optional[str] = None
    mfBA_startedAt: Optional[str] = None
    mfBZ_startedAt: Optional[str] = None
    mfZA_endedAt: Optional[str] = None
    mfAB_endedAt: Optional[str] = None
    mfBA_endedAt: Optional[str] = None
    mfBZ_endedAt: Optional[str] = None

    dstate: Optional[str] = "STARTED"

    trackingLogsId: Optional[str] = None # REF

    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None



