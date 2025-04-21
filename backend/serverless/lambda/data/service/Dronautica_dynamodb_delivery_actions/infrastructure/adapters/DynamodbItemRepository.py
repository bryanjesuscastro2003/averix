import boto3
import uuid
import hashlib
from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr


DYNAMODB_TABLE = "Dronautica_data_deliveryV2"


class DynamodbItemRepository(ItemRepository):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.tableName = DYNAMODB_TABLE
        self.table = self.dynamodb.Table(self.tableName)
    
    def get_item(self, itemId: str) -> ItemModel:
        items = self.table.scan(
            FilterExpression=Attr('id').eq(itemId)
        )
        items = items['Items']
        if len(items) == 0:
            return None
        return items[0]
    
    def get_item_to_confirm(self, itemId: str) -> ItemModel:
        items = self.table.scan(
            FilterExpression=Attr('id').eq(itemId) & Attr('dstate').eq("PENDING")
        )
        items = items['Items']
        if len(items) == 0:
            return None
        return items[0]
    
    def verify_primaryUser(self, primaryUser: str, deliveryId: str) -> bool:
        items = self.table.scan(
            FilterExpression=Attr('id').eq(deliveryId) & Attr('primaryUser').eq(primaryUser)
        )
        return len(items['Items']) > 0

    def verify_secondaryUser(self, secondaryUser: str, deliveryId: str) -> bool:
        items = self.table.scan(
            FilterExpression=Attr('id').eq(deliveryId) & Attr('secondaryUser').eq(secondaryUser)
        )
        return len(items['Items']) > 0

    
    def add_item(self, item: ItemModel) -> str: 
        item.id = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:4]
        item.timestamp = datetime.utcnow().isoformat()
        item.createdAt = datetime.utcnow().isoformat()
        item.updatedAt = datetime.utcnow().isoformat()
        item.startedRequestAt = datetime.utcnow().isoformat()

        self.table.put_item(
            Item={
                "id": item.id,
                "timestamp": item.timestamp,
                "primaryUser": item.primaryUser,
                "secondaryUser": item.secondaryUser,
                "locationA": item.locationA,
                "locationB": item.locationB,
                "locationZ": item.locationZ,
                "description": item.description,
                "instanceId": item.instanceId,
                "trackingId": item.trackingId,
                "startedRequestAt": item.startedRequestAt,
                "acceptedRequestAt": item.acceptedRequestAt,
                "endedRequestAt": item.endedRequestAt,
                "totalCost": item.totalCost,
                "totalDistance": item.totalDistance,
                "dstate": item.dstate,
                "createdAt": item.createdAt,
                "updatedAt": item.updatedAt
            }
        )
        return item.id
    
    def update_item(self, item: ItemModel) -> ItemModel:
        item.updatedAt = datetime.utcnow().isoformat()
        item.dstate = "CONFIRMED"
        item.acceptedRequestAt = datetime.utcnow().isoformat()
        itemUpdated = self.table.update_item(
            Key={
                'id': item.id, 
                'timestamp': item.timestamp
            },
            UpdateExpression='SET updatedAt = :val1, dstate = :val2, acceptedRequestAt = :val3, locationB = :val4, secondaryUser = :val5',
            ExpressionAttributeValues={
                ':val1': item.updatedAt,
                ':val2': item.dstate,
                ':val3': item.acceptedRequestAt,
                ':val4': item.locationB,
                ':val5': item.secondaryUser
            }, 
            ReturnValues='ALL_NEW'
        )
        item.instanceId = itemUpdated['Attributes']['instanceId']
        return item
    
    def confirm_item(self, item: ItemModel) -> ItemModel:
        item.updatedAt = datetime.utcnow().isoformat()
        item.dstate = "CONFIRMED"
        item.acceptedRequestAt = datetime.utcnow().isoformat()
        itemUpdated = self.table.update_item(
            Key={
                'id': item.id, 
                'timestamp': item.timestamp
            },
            UpdateExpression='SET updatedAt = :val1, dstate = :val2, acceptedRequestAt = :val3, locationB = :val4, secondaryUser = :val5',
            ExpressionAttributeValues={
                ':val1': item.updatedAt,
                ':val2': item.dstate,
                ':val3': item.acceptedRequestAt,
                ':val4': item.locationB,
                ':val5': item.secondaryUser
            }, 
            ReturnValues='ALL_NEW'
        )
        item.instanceId = itemUpdated['Attributes']['instanceId']
        item.primaryUser = itemUpdated['Attributes']['primaryUser']
        item.secondaryUser = itemUpdated['Attributes']['secondaryUser']
        return item

    def item_isAuthorized(self, itemId: str, primaryUser: str, secondaryUser: str) -> bool:
        items = self.table.scan(
            FilterExpression=Attr('id').eq(itemId)
        )
        items = items['Items']

        if len(items) == 0:
            return False
        
        if items[0]["dstate"] == "PENDING":
            return True

        if secondaryUser:
            if items[0]['secondaryUser'] == secondaryUser:
                return True
            else:
                return False
        
        elif primaryUser:
            if items[0]['primaryUser'] == primaryUser:
                return True
            else:
                return False
    
    def item_isConfirmed(self, itemId: str) -> bool:
        items = self.table.scan(
            FilterExpression=Attr('id').eq(itemId) & Attr('dstate').eq("CONFIRMED")
        )
        items = items['Items']
        if len(items) == 0:
            return False
        return True
    
    def get_itemByInstanceId(self, instanceId: str) -> ItemModel:
        items = self.table.scan(
            FilterExpression=Attr('instanceId').eq(instanceId) & Attr('dstate').eq("RUNNING")
        )
        items = items['Items']
        if len(items) == 0:
            items = self.table.scan(
                FilterExpression=Attr('id').eq(instanceId)
            )
            items = items['Items']
            if len(items) == 0:
                return None
        return items[0]
    
    def set_dState(self, item: ItemModel) -> bool: 
        # set dstate by id and timestamp
        self.table.update_item(
            Key={'id': item.id, 'timestamp': item.timestamp},
            UpdateExpression='SET dstate = :val1',
            ExpressionAttributeValues={':val1': item.dstate}
        )
        return True 
    
    def get_items(self, primaryUser: str) -> list:
        if primaryUser is None:
            items = self.table.scan()
        else:
            items = self.table.scan(
                FilterExpression=Attr('primaryUser').eq(primaryUser) | Attr('secondaryUser').eq(primaryUser)
            )
        print(items)
        items = items['Items']
        return items


    def set_cost_and_distance(self, item: ItemModel) -> bool:
        self.table.update_item(
            Key={'id': item.id, 'timestamp': item.timestamp},
            UpdateExpression='SET totalCost = :val1, totalDistance = :val2',
            ExpressionAttributeValues={':val1': item.totalCost, ':val2': item.totalDistance}
        )
        return True         


