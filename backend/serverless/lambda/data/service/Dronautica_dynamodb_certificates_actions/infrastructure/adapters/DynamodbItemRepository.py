import boto3
import uuid
import hashlib
from domain.repository.ItemRepository import ItemRepository
from domain.model.ItemModel import ItemModel
from datetime import datetime


DYNAMODB_TABLE = "Dronautica_instances_certificates"

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
        self.table.put_item(Item={
            "id" : item.id,
            "timestamp" : item.timestamp,
            "createdAt" : item.createdAt,
            "updatedAt" : item.updatedAt,
            "thing" : item.thing,
            "certificateS3Path" : item.certificateS3Path,
            "certificateArn" : item.certificateArn,
            "certificateId" : item.certificateId,
            "publicKey" : item.publicKey,
            "privateKey" : item.privateKey,
            "certificatePem" : item.certificatePem
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
    
