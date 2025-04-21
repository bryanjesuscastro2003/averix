import json
import boto3


# Lambda service 
lambda_client = boto3.client('lambda')


def lambda_handler(event, context):

    try:
        
        """
            EVENT DATA
        """
        claims = event['requestContext']['authorizer']['claims']
        username = claims.get('email', None)

        body = json.loads(event.get("body", None))

        deliveryId = body.get("deliveryId", None)
        secondaryUser = username
        locationB = body.get("locationB", None)

        if None in (deliveryId, secondaryUser, locationB):
            raise Exception("Missing required parameters . [DELIVERYID, SECONDARYUSER, LOCATIONB]")
        
        locationB = json.dumps(locationB)

        """
            CONFIRMITEM DELIVERY   
        """
        args = {
             "ACTION": "CONFIRMITEM",
             "DATA": {
                "DELIVERYID": deliveryId,
                "SECONDARYUSER": secondaryUser,
                "LOCATIONB": locationB,
                "DSTATE": "CONFIRMED"
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
        deliveryItem = lambda_response["DATA"]["ITEM"]
         
        """
            Update Dstate 
        """
        args = {
            "ACTION": "SETDSTATE", 
            "INSTANCE": {
                "INSTANCEID": deliveryItem["instanceId"],
                "DSTATE": "BUSY_ST_2",
                "REFRESH": True
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instance_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading instances . {lambda_response["VALUE"]["ERROR"]}")
        
        """
            SET COST 
        """
        args = {
             "DATA": {
                "DELIVERYID": deliveryId
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_set_delivery_cost',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error setting delivery data . {lambda_response["DATA"]["ERROR"]}")

        """
           SEND NOTIFICATION TO PRIMARY USER TO ACCEPT THE DELIVERY COST
        """


        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',   
                'Access-Control-Allow-Methods': 'POST, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type', 
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                'ok': True, 
                'message': 'Delivery confirmed successfully. Please stay on the notifications; the drone is loading. You can track it on the map.',
                'error': None, 
                'data': {
                    'deliveryId': deliveryId,
                    'primaryUser': deliveryItem["primaryUser"]
                }
            }),
        }

    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',   
                'Access-Control-Allow-Methods': 'POST, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type', 
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                'ok': False,
                'message': 'Server error, please try again later ...',
                'error': str(e),
                'data': None
            })
        }

