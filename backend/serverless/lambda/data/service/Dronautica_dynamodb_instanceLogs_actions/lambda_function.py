import json
from domain.model.ItemModel import ItemModel
from infrastructure.adapters.DynamodbItemRepository import DynamodbItemRepository
from application.AddItemUseCase import AddItemUseCase
from application.GetItemUseCase import GetItemUseCase

itemRepository = DynamodbItemRepository()
addItemUseCase = AddItemUseCase(itemRepository)
getItemUseCase = GetItemUseCase(itemRepository) 

def lambda_handler(event, context):
    try:
        action = event['ACTION']
        if action not in ["GETITEM", "GETITEMS", "PUTITEM", "GETITEMBYID"]:
            raise Exception("Invalid Action")
        if action == "PUTITEM":
            instanceId = event['INSTANCE']['INSTANCEID']
            item = ItemModel(
                capacity = event['INSTANCE']['CAPACITY'],
                description = event['INSTANCE']['DESCRIPTION']
            )
            itemId = addItemUseCase.execute(item)
            return {
                "STATE": "OK", 
                "VALUE": {
                    "ITEMID": itemId,
                    "INSTANCEID": instanceId
                }
            }

        elif action == "GETITEMBYID":
            logsId = event["INSTANCE"]['LOGSID']
            item = getItemUseCase.execute(logsId)
            return {
                "STATE": "OK",
                "VALUE": {
                    "ITEM": item
                }
            } 

    except Exception as e:
        return {
            "STATE": "ERROR",
            "VALUE": {
                "ERROR": str(e)
            }
        }



