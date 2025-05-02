from infrastructure.adapters.DynamodbItemRepository import DynamodbItemRepository
from application.GetItemsAvailablesUseCase import GetItemsAvailablesUseCase 
from application.SetDstateUseCase import SetDstateUseCase
from application.GetItemByNameUseCase import GetItemByNameUseCase
from application.PutItemUseCase import PutItemUseCase
from application.PackageItemUseCase import PackageItemUseCase
from application.SetStationLocationUseCase import SetStationLocationUseCase
from application.GetItemsUseCase import GetItemsUseCase
from application.GetItemByIdUseCase import GetItemByIdUseCase
from application.GetItemsAvailablesByCapacityUseCase import GetItemsAvailablesByCapacityUseCase
from application.GetItemDstateByIdUseCase import GetItemDstateByIdUseCase
from domain.model.ItemModel import ItemModel


itemRepository = DynamodbItemRepository()
getItemsAvailablesUseCase = GetItemsAvailablesUseCase(itemRepository)
setDstateUseCase = SetDstateUseCase(itemRepository)
getItemByNameUseCase = GetItemByNameUseCase(itemRepository)
putItemUseCase = PutItemUseCase(itemRepository)
packageItemUseCase = PackageItemUseCase(itemRepository)
setStationLocationUseCase = SetStationLocationUseCase(itemRepository)
getItemsUseCase = GetItemsUseCase(itemRepository)
getItemByIdUseCase = GetItemByIdUseCase(itemRepository)
getItemsAvailablesByCapacityUseCase = GetItemsAvailablesByCapacityUseCase(itemRepository)
getItemDstateByIdUseCase = GetItemDstateByIdUseCase(itemRepository)


def lambda_handler(event, context):
    try:
        action = event['ACTION']
        if action not in ["GETITEMSAVAILABLES","GETITEMDSTATE", "GETITEMSAVAILABLESBYCAPACITY","GETITEMBYID" ,"GETITEMS","SETDSTATE", "GETFULLITEM", "PUTITEM", "PACKAGEITEM", "SETSTATIONLOCATION"]:
            raise Exception("Invalid Action") 

        if action == "GETITEMSAVAILABLES": 
            items = getItemsAvailablesUseCase.execute()
            return {
                "STATE": "OK",
                "VALUE": {
                    "INSTANCES": items
                }
            }
        
        elif action == "GETITEMSAVAILABLESBYCAPACITY":
            items = getItemsAvailablesByCapacityUseCase.execute(event["INSTANCE"]['CAPACITY'])
            return {
                "STATE": "OK",
                "VALUE": {
                    "INSTANCES": items
                }
            }
        
        elif action == "GETITEMBYID":
            item = ItemModel(
                id = event["INSTANCE"]['INSTANCEID']
            )
            itemResponse = getItemByIdUseCase.execute(item)
            return {
                "STATE": "OK",
                "VALUE": {
                    "INSTANCE": itemResponse
                }
            }
        
        elif action == "GETITEMS":
            items = getItemsUseCase.execute()
            return {
                "STATE": "OK",
                "VALUE": {
                    "INSTANCES": items
                }
            }

        
        elif action == "SETSTATIONLOCATION":
            instanceId = event["INSTANCE"]['INSTANCEID']
            stationLocation = event["INSTANCE"]['STATIONLOCATION']
            item = ItemModel(
                id = instanceId,
                stationLocation = stationLocation
            )
            setStationLocationUseCase.execute(item)
            return {
                "STATE": "OK", 
                "VALUE": {}
            }

        elif action == "PACKAGEITEM":
            itemId = event["INSTANCE"]['INSTANCEID']
            certificateId = event["INSTANCE"]['CREDENTIALSID']
            logsId = event["INSTANCE"]['LOGSSERVICEID']
            slaveId = event["INSTANCE"]['MQTTSERVICEID']

            item = ItemModel(
                id = itemId,
                credentialsId = certificateId,
                logsServiceId = logsId,
                mqttServiceId = slaveId
            )

            packageItemUseCase.execute(item)

            return {
                "STATE": "OK",
                "VALUE": {}
            }
        
        elif action == "PUTITEM":
            name = event["INSTANCE"]['NAME']
            model = event["INSTANCE"]['MODEL']
            capacity = event["INSTANCE"]['CAPACITY']
            description = event["INSTANCE"]['DESCRIPTION']
            item = ItemModel(
                name = name,
                model = model,
                capacity = capacity,
                description = description
            )
            itemId = putItemUseCase.execute(item)
            return {
                "STATE": "OK",
                "VALUE": {
                    "INSTANCEID": itemId
                }
            }

        elif action == "SETDSTATE":
            instanceId = event["INSTANCE"]['INSTANCEID'] 
            dstate = event["INSTANCE"]['DSTATE']
            refresh = event["INSTANCE"]['REFRESH']
            item = ItemModel(
                id = instanceId,
                dstate = dstate
            )
            state = setDstateUseCase.execute(item, refresh)
            return {
                "STATE": "OK",
                "VALUE": {
                    "DSTATE": state
                } 
            }
        
        elif action == "GETFULLITEM":
            instanceName = event["INSTANCE"]['NAME'] 
            item = ItemModel(
                name = instanceName
            )
            item = getItemByNameUseCase.execute(item)
            return {
                "STATE": "OK",
                "VALUE": item
            }
        
        elif action == "GETITEMDSTATE":
            instanceId = event["INSTANCE"]['INSTANCEID']
            itemDstate = getItemDstateByIdUseCase.execute(instanceId)

            return {
                "STATE": "OK",
                "VALUE": {
                    "DSTATE": itemDstate
                }
            }



    except Exception as e:
        return {
            "STATE": "ERROR",
            "VALUE": {
                "ERROR": str(e)
            }
        }