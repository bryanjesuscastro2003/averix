import boto3
import uuid
import hashlib
from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr
import uuid
import hashlib


DYNAMODB_TABLE = "Dronautica_instances"


class DynamodbItemRepository(ItemRepository):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.tableName = DYNAMODB_TABLE
        self.table = self.dynamodb.Table(self.tableName)
    
    def put_item(self, item: ItemModel) -> str:
        item.id = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:4]
        item.createdAt = datetime.utcnow().isoformat()
        item.updatedAt = datetime.utcnow().isoformat()
        item.dstate = "UNAVAILABLE"
        item.isAssociated = False
        self.table.put_item(
            Item={
                'id': item.id,
                'capacity': item.capacity,
                'description': item.description,
                'name': item.name,
                'model': item.model,
                'dstate': item.dstate,
                'isAssociated': item.isAssociated,
                'stationLocation': item.stationLocation,
                'createdAt': item.createdAt,
                'updatedAt': item.updatedAt
            }
        )    
        return item.id    


    def get_item_by_id(self, item: ItemModel) -> ItemModel:
        items = self.table.scan(
            FilterExpression=Attr('id').eq(item.id)
        )
        items = items['Items']
        if len(items) == 0:
            return None
        return items[0] 
    
    def get_item_by_name(self, item: ItemModel) -> ItemModel:
        items = self.table.scan(
            FilterExpression=Attr('name').eq(item.name)
        )
        items = items['Items']
        if len(items) == 0:
            return None
        return items[0]
    
    def get_items_availables(self) -> list:
        response = self.table.scan(
            FilterExpression=Attr('dstate').eq("AVAILABLE")
        )
        items = response['Items']
        return items
    
    def get_items_availables_by_capacity(self, category: str) -> list:
        response = self.table.scan(
            FilterExpression=Attr('dstate').eq("AVAILABLE") & Attr('capacity').eq(category)
        )
        items = response['Items']
        return items
    
    def set_dstate(self, item: ItemModel) -> str:
        item.updatedAt = datetime.utcnow().isoformat()
        self.table.update_item(
            Key={
                'id': item.id,
                "capacity": item.capacity
            },
            UpdateExpression="set dstate=:dstate",
            ExpressionAttributeValues={
                ':dstate': item.dstate
            }
        )
        return item.id
    
    def set_credentialsId(self, item: ItemModel) -> str:
        item.updatedAt = datetime.utcnow().isoformat()
        self.table.update_item(
            Key={
                'id': item.id,
                "capacity": item.capacity
            },
            UpdateExpression="set credentialsId=:credentialsId, updatedAt=:updatedAt",
            ExpressionAttributeValues={
                ':credentialsId': item.credentialsId, 
                ':updatedAt': item.updatedAt
            }
        )
        return item.id 
    
    def set_logsId(self, item: ItemModel) -> str:
        item.updatedAt = datetime.utcnow().isoformat()
        self.table.update_item(
            Key={
                'id': item.id,
                "capacity": item.capacity
            },
            UpdateExpression="set logsServiceId=:val1, updatedAt=:val2",
            ExpressionAttributeValues={
                ':val1': item.logsServiceId,
                ':val2': item.updatedAt
            }
        )
        return item.id

    def set_mqttId(self, item: ItemModel) -> str:
        item.updatedAt = datetime.utcnow().isoformat()
        self.table.update_item(
            Key={
                'id': item.id,
                "capacity": item.capacity
            },
            UpdateExpression="set mqttServiceId=:val1, updatedAt=:val2",
            ExpressionAttributeValues={
                ':val1': item.mqttServiceId,
                ':val2': item.updatedAt
            }
        )
        return item.id
    
    def set_stationLocation(self, item: ItemModel) -> None:
        item.updatedAt = datetime.utcnow().isoformat()
        item.isAssociated = True
        self.table.update_item(
            Key={
                'id': item.id,
                "capacity": item.capacity
            },
            UpdateExpression="set stationLocation=:val1, updatedAt=:val2, isAssociated=:val3",
            ExpressionAttributeValues={
                ':val1': item.stationLocation,
                ':val2': item.updatedAt,
                ':val3': item.isAssociated
            }
        )
    
    def get_items(self) -> list:
        response = self.table.scan()
        items = response['Items']
        return items


    def get_itemDstate(self, id: str) -> str:
        item = ItemModel(id=id)
        item = self.get_item_by_id(item)
        if not item:
            return None
        return item["dstate"]

    