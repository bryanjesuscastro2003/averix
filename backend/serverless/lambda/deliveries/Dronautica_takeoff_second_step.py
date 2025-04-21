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
        primaryUser = username
        body = json.loads(event.get("body", None))
        instanceId = body.get("instanceId", None)
        deliveryId = body.get("deliveryId", None)

        if instanceId is None or deliveryId is None:
            raise Exception("instanceId and deliveryId is required")

        # TODO 
        # SECURITY AGAINS BOOT WHEN ITS COMPLETED

        
        """ 
            VERIFY PRIMARY USER
        """
        args = {
             "ACTION": "VERIFYUSER",
             "DATA": {
                "DELIVERYID": deliveryId,
                "ISPRIMARYUSER": True,
                "VALUE": primaryUser
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
        deliveryResponse = lambda_response["DATA"]["VALUE"]
        if not deliveryResponse:
            raise Exception("Delivery not authorized ...")
  
        """
            BOOT SERVICE 
        """
        args = {
             "ACTION": "SETDSTATE",
             "DATA": {
                "ITEMID": deliveryId,
                "DSTATE": "RUNNING"
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


        """
            BOOT INSTANCE
            Prepare to Take off
        """
        payload = {
            "ACTION": "TAKEOFF",
            "VALUE": 0
        }
        args = {
            "DATA": {
                "INSTANCEID": instanceId,
                "PAYLOAD": json.dumps(payload)
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_mqtt_publisher_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading mqtt message . {lambda_response["VALUE"]["ERROR"]}")
        

        """
            SEND NOTIFICACION TO THE ROOM 
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
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error setting delivery data . {lambda_response["DATA"]["ERROR"]}")

        primaryUser = lambda_response["DATA"]["ITEM"]["primaryUser"]
        secondaryUser = lambda_response["DATA"]["ITEM"]["secondaryUser"]

        """PUSH"""

        args = {
             "body": {
                "action": "NOTIFICATION_DELIVERY_STARTED",
                "data": {
                    "targetUserId": primaryUser, 
                    "user": secondaryUser,
                    "message": None
                }
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_notification_sendMessage',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )

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
                'message': "Delivery started up successfully" ,
                'error': None, 
                'data': {}
            }),
        }
        

    except  Exception as e:
        print(e)
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',   
                'Access-Control-Allow-Methods': 'POST, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type', 
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                'ok': False, 
                'message': "Server error. Please try again later." ,
                'error': None, 
                'data': {}
            }),
        }