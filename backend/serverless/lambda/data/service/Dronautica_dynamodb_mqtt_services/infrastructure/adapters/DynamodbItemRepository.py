import boto3
import uuid
import hashlib
from boto3.dynamodb.conditions import Attr
from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel
from datetime import datetime


DYNAMODB_TABLE = "Dronautica_mqtt_service_topicsV2"

class DynamodbItemRepository(ItemRepository):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.tableName = DYNAMODB_TABLE
        self.table = self.dynamodb.Table(self.tableName)
    
    def add_item(self, item: ItemModel) -> str: 
        item.id = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:4]
        item.timestream = str(datetime.utcnow().timestamp())
        item.createdAt = datetime.utcnow().isoformat()
        item.updatedAt = datetime.utcnow().isoformat()
        serviceId = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:4]
        item.topicMaster =  "dronautica/dataY/" + serviceId
        self.table.put_item(Item={
            "id": item.id,
            "timestream": item.timestream, 
            "topicMaster": item.topicMaster,
            "participants": item.participants,
            "createdAt": item.createdAt,
            "updatedAt": item.updatedAt
        })
        return item.id
    
    def get_item(self, id: str) -> ItemModel:
        response = self.table.scan(FilterExpression=Attr('id').eq(id))
        response = response['Items']
        if len(response) == 0:
            return None
        return response[0]
    
    def get_items(self) -> list:
        response = self.table.scan(
              FilterExpression=Attr('isBusy').eq(False)
        )
        return response['Items']
    
    def update_item(self, item: ItemModel) -> str:
        print(item, "-> ")
        data = self.table.scan(FilterExpression=Attr('id').eq(item.id))
        timestream = data['Items'][0]['timestream']
        self.table.update_item(
            Key={'id': item.id, 'timestream': timestream},
            UpdateExpression='SET updatedAt = :updatedAt, participants = :participants',
            ExpressionAttributeValues={
                ':updatedAt': datetime.utcnow().isoformat(), 
                ':participants': item.participants}
        )
        return item.id
    
    def get_item_where_participants_lower_than(self) -> list:
        response = self.table.scan(
            FilterExpression=Attr('participants').lt(5) 
        )
        return response['Items']
        
    
