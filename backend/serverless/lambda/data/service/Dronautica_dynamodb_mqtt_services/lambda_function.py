import json
from domain.model.ItemModel import ItemModel 
from domain.model.SlaveModel import SlaveModel
from infrastructure.adapters.DynamodbItemRepository import DynamodbItemRepository
from infrastructure.adapters.DynamodbSlaveRepository import DynamodbSlaveRepository
from application.AddItemUseCase import AddItemUseCase
from application.GetItemsUseCase import GetItemsUseCase
from application.GetItemUseCase import GetItemUseCase

itemRepository = DynamodbItemRepository()
slaveRepository = DynamodbSlaveRepository()
addItemUseCase = AddItemUseCase(itemRepository, slaveRepository)
getItemsUseCase = GetItemsUseCase(itemRepository)
getItemUseCase = GetItemUseCase(itemRepository, slaveRepository)


def lambda_handler(event, context):
    try:
        action = event['ACTION']
        if action not in ["GETITEM", "GETITEMS", "PUTITEM", "GETITEMBYID"]:
            raise Exception("Invalid Action")
        
        if action == "GETITEMS":
            items = getItemsUseCase.execute()
            print(items)
        
        if action == "PUTITEM":
            itemModel = ItemModel()
            slaveModel = SlaveModel(
                instanceId = event["INSTANCE"]["INSTANCEID"]
            )
            response = addItemUseCase.execute(itemModel, slaveModel)
            itemModel.id = response["masterId"]
            slaveModel.id = response["slaveId"]
            return {
                "STATE": "OK",
                "VALUE": {
                    "INSTANCEID":  itemModel.id,
                    "SLAVEID": slaveModel.id
                }
            }
        
        elif action == "GETITEMBYID":
            slaveId = event["INSTANCE"]["SLAVEID"]
            response = getItemUseCase.execute(slaveId)
            return {
                "STATE": "OK",
                "VALUE":{
                    "MASTER": response["master"],
                    "SLAVE": response["slave"]
                }
            }
            
    except Exception as e:
        return {
            "STATE": "ERROR",
            "VALUE": {
                "ERROR": str(e)
            }
        }

