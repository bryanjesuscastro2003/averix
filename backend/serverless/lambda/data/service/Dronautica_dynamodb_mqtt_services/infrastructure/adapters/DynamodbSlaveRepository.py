import boto3
import uuid
import hashlib
from boto3.dynamodb.conditions import Attr
from domain.repository.SlaveRepository import SlaveRepository
from domain.model.ItemModel import ItemModel
from domain.model.SlaveModel import SlaveModel
from datetime import datetime

DYNAMODB_TABLE = "Dronautica_mqtt_service_slavesV2"

class DynamodbSlaveRepository(SlaveRepository):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.tableName = DYNAMODB_TABLE
        self.table = self.dynamodb.Table(self.tableName)
    
    def add_item(self, item: SlaveModel) ->str:
        item.id = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:4]
        item.timestamp = str(datetime.utcnow().timestamp())
        item.createdAt = datetime.utcnow().isoformat()
        item.updatedAt = datetime.utcnow().isoformat()
        serviceId = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:4]
        item.topicSlave =  "dronautica/dataX/" + serviceId
        self.table.put_item(Item={
            "id": item.id,
            "tiimestamp": item.timestamp,
            "masterId": item.masterId,
            "instanceId": item.instanceId,
            "topicSlave": item.topicSlave,
            "createdAt": item.createdAt,
            "updatedAt": item.updatedAt,
        })
        return item.id

    def get_item(self, id: str) -> dict: 
        response = self.table.scan(FilterExpression=Attr("id").eq(id))
        response = response['Items']
        if len(response) == 0:
            return None
        return response[0]