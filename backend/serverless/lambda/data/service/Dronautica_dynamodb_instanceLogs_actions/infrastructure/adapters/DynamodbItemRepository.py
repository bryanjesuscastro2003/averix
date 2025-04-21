import boto3
import uuid
import hashlib
from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel
from datetime import datetime



DYNAMODB_TABLE = "Dronautica_instances_logsV2"

class DynamodbItemRepository(ItemRepository):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.tableName = DYNAMODB_TABLE
        self.table = self.dynamodb.Table(self.tableName)
    
    def add_item(self, item: ItemModel) -> str: 
        item.id = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:4]
        item.createdAt = datetime.utcnow().isoformat()
        item.updatedAt = datetime.utcnow().isoformat()

        self.table.put_item(Item={
            "id": item.id,
            "capacity": item.capacity,
            "description": item.description,
            "temperature": item.temperature,
            "humidity": item.humidity,
            "battery": item.battery,
            "isWifiOk": item.isWifiOk,
            "isGpsOk": item.isGpsOk,
            "isImuOk": item.isImuOk,
            "isCameraOk": item.isCameraOk,
            "isChargerOk": item.isChargerOk,
            "message": item.message,
            "createdAt": item.createdAt,
            "updatedAt": item.updatedAt
        })
        return item.id
    
    def get_item(self, id: str) -> ItemModel:
        response = self.table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('id').eq(id)
        )
        response = response['Items']
        if len(response) == 0:
            return None
        return response[0]
    
    def get_items(self) -> list:
        response = self.table.scan()
        return response['Items']
