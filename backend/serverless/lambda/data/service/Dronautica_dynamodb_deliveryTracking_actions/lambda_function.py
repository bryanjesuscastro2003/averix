from domain.model.ItemModel import ItemModel
from infrastructure.adapters.DynamodbItemRepository import DynamodbItemRepository
from application.AddItemUseCase import AddItemUseCase
from application.GetItemByIdUseCase import GetItemByIdUseCase

itemRepository = DynamodbItemRepository()
addItemUseCase = AddItemUseCase(itemRepository)
getItemByIdUseCase = GetItemByIdUseCase(itemRepository)


def lambda_handler(event, context):
    try: 
        action = event['ACTION']
        if action not in ["GETITEMBYID","PUTITEM"]:
            raise Exception("Invalid Action")  

        if action == "PUTITEM":
            item = ItemModel(
                trackingLogsId = event['DATA']['TRACKINGLOGSID'],
            )
            itemId = addItemUseCase.execute(item)
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEMID": itemId
                }
            }
        
        elif action == "GETITEMBYID":
            item = getItemByIdUseCase.execute(event['DATA']['TRACKINGID'])
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEM": item
                }
            }

    except Exception as e:
        return {
            "STATE": "ERROR",
            "DATA": {
                "ERROR": str(e) 
            } 
        }