import json
import boto3


# Lambda service 
lambda_client = boto3.client('lambda')




def lambda_handler(event, context):
    try:
        """
            EVENT DATA
        """ 

        deliveryId = event["DATA"]["DELIVERYID"]

        """
            GET DELIVERY LOCATIONS A, B, Z
        """
        args = {
             "ACTION": "GETITEMBYID",
             "DATA": {
                "DELIVERYID": deliveryId
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_delivery_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        print(lambda_response)
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error setting delivery data . {lambda_response["DATA"]["ERROR"]}")
        deliveryItem = lambda_response["DATA"]["ITEM"]

        locationA = json.loads(deliveryItem["locationA"])
        locationB = json.loads(deliveryItem["locationB"])
        locationZ = json.loads(deliveryItem["locationZ"])

        """
            CALCULATE DISTANCE 
        """

        def getDistance(originCoordinate, targetCoordinate):
            args = {
                "currentCoordinate": f"{originCoordinate['lat']},{originCoordinate['lng']}",
                "targetCoordinate": f"{targetCoordinate["lat"]},{targetCoordinate["lng"]}",
                "originCoordinate": f"{originCoordinate['lat']},{originCoordinate['lng']}",
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_bearing',
                InvocationType='RequestResponse',
                Payload=json.dumps(args)
            )
            lambda_response_payload = json.loads(lambda_response['Payload'].read())
            return lambda_response_payload['body']["distanceAbs"]
        
        distanceZA = getDistance(locationZ, locationA)
        distanceAB = getDistance(locationA, locationB)
        distanceBZ = getDistance(locationB, locationZ)

        """
            CALCULATE TOTAL COST
        """
        args = {
             "ACTION": "GETITEMBYID",
             "INSTANCE": {
                "INSTANCEID": deliveryItem["instanceId"]
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instance_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error getting instance . {lambda_response["VALUE"]["ERROR"]}")
        instanceCapacity = lambda_response["VALUE"]["INSTANCE"]["capacity"]

        if instanceCapacity == "DRONAUTICA_SMALL_INSTANCE":
            constantCost = 0.001
        elif instanceCapacity == "DRONAUTICA_MEDIUM_INSTANCE":
            constantCost = 0.005
        else:
            constantCost = 0.010
        
        """
            LOAD COST AND DISTANCE
        """
        totalDistance = distanceZA + distanceAB + distanceBZ
        totalCost = totalDistance * constantCost

        args = {
             "ACTION": "SETCOSTANDDISTANCE",
             "DATA": {
                "DELIVERYID": deliveryId,
                "COST": totalCost,
                "DISTANCE": totalDistance
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_delivery_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error setting delivery data . {lambda_response["DATA"]["ERROR"]}")

        return {
            'STATE': "OK",
            'VALUE': {
                "TOTALDISTANCE": distanceZA + distanceAB + distanceBZ, 
                "TOTALCOST": (distanceZA + distanceAB + distanceBZ) * constantCost
            }
        }

    except Exception as e:
        print(e)
        return {
            'STATE': "ERROR",
            'VALUE': {
                "ERROR": str(e)
            }
        }