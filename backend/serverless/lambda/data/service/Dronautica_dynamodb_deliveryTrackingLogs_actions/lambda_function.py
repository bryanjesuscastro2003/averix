from domain.model.ItemModel import ItemModel
from infrastructure.adapters.DynamodbItemRepository import DynamodbItemRepository
from application.AddItemUseCase import AddItemUseCase
from application.GetItemByIdUseCase import GetItemByIdUseCase
from application.SetLocationsUseCase import SetLocationsUseCase

itemRepository = DynamodbItemRepository()
addItemUseCase = AddItemUseCase(itemRepository)
getItemByIdUseCase = GetItemByIdUseCase(itemRepository)
setLocationsUseCase = SetLocationsUseCase(itemRepository)

def lambda_handler(event, context):
    try:
        action = event['ACTION']
        if action not in ["GETITEMBYID", "GETITEMS", "PUTITEM", "UPDATEITEM"]:
            raise Exception("Invalid Action")  
        
        if action == "PUTITEM":
            item = ItemModel()
            item.id = addItemUseCase.execute(item)
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEMID": item.id
                }
            }

        elif action == "GETITEMBYID":
            item = getItemByIdUseCase.execute(event['DATA']['TRACKINGLOGSID'])
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEM": item
                }
            }

        elif action == "UPDATEITEM":
            item = ItemModel(
                id=event['DATA']['TRACKINGLOGSID'],
                currentLocation=event['DATA']['CURRENTLOCATION']
            )
            print("item -<", item)
            setLocationsUseCase.execute(item)
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEMID": item.id
                }
            }


    except Exception as e:
        return {
            "STATE": "ERROR", 
            "DATA": {
                "ERROR": str(e)
            }
        }

