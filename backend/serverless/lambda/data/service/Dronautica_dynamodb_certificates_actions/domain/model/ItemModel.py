from dataclasses import dataclass
from typing import Optional

@dataclass
class ItemModel:
    id:  Optional[str] = None
    timestamp: Optional[str] = None

    thing: Optional[str] = None
    certificateS3Path: Optional[str] = None
    certificateArn: Optional[str] = None
    certificateId: Optional[str] = None
    publicKey: Optional[str] = None
    privateKey: Optional[str] = None
    certificatePem: Optional[str] = None

    createdAt : Optional[str] = None
    updatedAt : Optional[str] = None

    
