import json
from domain.model.ItemModel import ItemModel
from infrastructure.adapters.DynamodbItemRepository import DynamodbItemRepository
from application.AddItemUseCase import AddItemUseCase
from application.UpdateItemUseCase import UpdateItemUseCase
from application.ItemIsConfirmedUseCase import ItemIsConfirmedUseCase
from application.GetItemByIdUseCase import GetItemByIdUseCase
from application.GetItemByInstanceIdUseCase import GetItemByInstanceIdUseCase
from application.SetDstateUseCase import SetDstateUseCase
from application.GetItemsUseCase import GetItemsUseCase
from application.ConfirmItemUseCase import ConfirmItemUseCase
from application.VerifyUserUseCase import VerifyUserUseCase
from application.SetCostAndDistanceUseCase import SetCostAndDistanceUseCase

itemRepository = DynamodbItemRepository()
addItemUseCase = AddItemUseCase(itemRepository)
updateItemUseCase = UpdateItemUseCase(itemRepository)
itemIsConfirmedUseCase = ItemIsConfirmedUseCase(itemRepository)
getItemByIdUseCase = GetItemByIdUseCase(itemRepository)
getItemByInstanceIdUseCase = GetItemByInstanceIdUseCase(itemRepository)
setDstateUseCase = SetDstateUseCase(itemRepository)
getInstancesUseCase = GetItemsUseCase(itemRepository)
confirmItemUseCase = ConfirmItemUseCase(itemRepository)
verifyUserUseCase = VerifyUserUseCase(itemRepository)
setCostAndDistanceUseCase = SetCostAndDistanceUseCase(itemRepository)


def lambda_handler(event, context):
    try:
        action = event['ACTION']
        if action not in ["GETITEM", "GETITEMS", "SETCOSTANDDISTANCE","VERIFYUSER","CONFIRMITEM","SETDSTATE", "PUTITEM", "UPDATEITEMBYID", "VERIFYCONFIRMATION", "GETITEMBYID", "GETITEMBYINSTANCEID"]:
            raise Exception("Invalid Action") 
        
        if action == "PUTITEM":
            primaryUser = event["DATA"]["PRIMARYUSER"]
            locationA = event["DATA"]["LOCATIONA"]
            locationZ = event["DATA"]["LOCATIONZ"]
            instanceId = event["DATA"]["INSTANCEID"]
            trackingId = event["DATA"]["TRACKINGID"]
            description = event["DATA"]["DESCRIPTION"]
            item = ItemModel(
                primaryUser = primaryUser,
                locationA = locationA,
                locationZ = locationZ,
                instanceId = instanceId, 
                trackingId = trackingId, 
                description = description
            )
            itemId = addItemUseCase.execute(item)
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEMID": itemId
                }
            }
        
        elif action == "SETCOSTANDDISTANCE":
            deliveryId = event["DATA"]["DELIVERYID"]
            cost = str(event["DATA"]["COST"])
            distance = str(event["DATA"]["DISTANCE"])
            item = ItemModel(
                id = deliveryId, 
                totalCost = cost,
                totalDistance = distance
            )
            item = setCostAndDistanceUseCase.execute(item)
            return {
                "STATE": "OK",
                "DATA": {}
            }
        
        elif action == "VERIFYCONFIRMATION":
            deliveryId = event["DATA"]["DELIVERYID"]
            primaryUser = event["DATA"]["PRIMARYUSER"]
            secondaryUser = event["DATA"]["SECONDARYUSER"]
            value = itemIsConfirmedUseCase.execute(deliveryId, primaryUser, secondaryUser)
            return {
                "STATE": "OK",
                "DATA": {
                    "VALUE": value
                }
            }

        elif action == "VERIFYUSER":
            isPrimaryUser = event["DATA"]["ISPRIMARYUSER"]
            user = event["DATA"]["VALUE"]
            deliveryId = event["DATA"]["DELIVERYID"]

            response = verifyUserUseCase.execute(isPrimaryUser, user, deliveryId)
            return {
                "STATE": "OK",
                "DATA": {
                    "VALUE": response
                }
            }

        elif action == "UPDATEITEMBYID":
            deliveryId = event["DATA"]["DELIVERYID"]
            secondaryUser = event["DATA"]["SECONDARYUSER"]
            locationB = event["DATA"]["LOCATIONB"]
            dstate = event["DATA"]["DSTATE"]
            item = ItemModel(
                id = deliveryId, 
                secondaryUser = secondaryUser, 
                locationB = locationB, 
                dstate = dstate
            )
            item = updateItemUseCase.execute(item)
            return {
                "STATE": "OK", 
                "DATA": {
                    "ITEM": {
                        "instanceId": item.instanceId
                    }
                }
            }
        
        elif action == "CONFIRMITEM":
            deliveryId = event["DATA"]["DELIVERYID"]
            secondaryUser = event["DATA"]["SECONDARYUSER"]
            locationB = event["DATA"]["LOCATIONB"]
            dstate = event["DATA"]["DSTATE"]
            item = ItemModel(
                id = deliveryId, 
                secondaryUser = secondaryUser, 
                locationB = locationB, 
                dstate = dstate
            )
            item = confirmItemUseCase.execute(item)
            return {
                "STATE": "OK", 
                "DATA": {
                    "ITEM": {
                        "instanceId": item.instanceId,
                        "primaryUser": item.primaryUser,
                        "secondaryUser": item.secondaryUser
                    }
                }
            }


        
        elif action == "GETITEMBYID": 
            deliveryId = event["DATA"]["DELIVERYID"]
            item = getItemByIdUseCase.execute(deliveryId)
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEM": item
                }
            }

        elif action == "GETITEMBYINSTANCEID": 
            instanceId = event["DATA"]["INSTANCEID"]
            item = getItemByInstanceIdUseCase.execute(instanceId)
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEM": item
                }
            }

        elif action == "SETDSTATE":
            item = ItemModel(
                id = event['DATA']['ITEMID'],
                dstate = event['DATA']['DSTATE']
            )
            response = setDstateUseCase.execute(item)
            return {
                "STATE": "OK",
                "VALUE": {
                    "DSTATE": response
                }
            }
        
        elif action == "GETITEMS":
            primaryUser = event['DATA']['PRIMARYUSER']
            response = getInstancesUseCase.execute(primaryUser)
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEMS": response
                }
            
            }


    except Exception as e:
        return  {
            "STATE": "ERROR",
            "DATA": {
                "ERROR": str(e)
            }
        }