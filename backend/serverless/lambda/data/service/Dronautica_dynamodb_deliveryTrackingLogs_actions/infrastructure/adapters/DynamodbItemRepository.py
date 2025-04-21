import boto3
import uuid
import hashlib
from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr


DYNAMODB_TABLE = "Dronautica_data_delivery_tracking_logs"


class DynamodbItemRepository(ItemRepository):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.tableName = DYNAMODB_TABLE
        self.table = self.dynamodb.Table(self.tableName)
    
    def add_item(self, item: ItemModel) -> str: 
        item.id = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:4]
        item.timestamp = datetime.utcnow().isoformat()
        item.createdAt = datetime.utcnow().isoformat()
        item.updatedAt = datetime.utcnow().isoformat()

        self.table.put_item(
            Item={
                "id": item.id,
                "timestamp": item.timestamp,
                "currentLocation": item.currentLocation,
                "oldLocation": item.oldLocation,
                "createdAt": item.createdAt,
                "updatedAt": item.updatedAt
            }
        )
        return item.id

    def get_item(self, item_id: str) -> ItemModel:
        items = self.table.scan(
            FilterExpression=Attr('id').eq(item_id)
        )
        if len(items['Items']) == 0:
            return None
        return items['Items'][0]
    
    def set_itemLocatiions(self, item: ItemModel) -> None:
        print("to update", item)
        self.table.update_item(
            Key={
                'id': item.id,
                'timestamp': item.timestamp
            },
            UpdateExpression='SET currentLocation = :currentLocation, oldLocation = :oldLocation',
            ExpressionAttributeValues={
                ':currentLocation': item.currentLocation,
                ':oldLocation': item.oldLocation
            }
        )

