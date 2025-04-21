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
        instanceId = body.get("instanceId", None)
        primaryUser = username

        if None in (deliveryId, instanceId):
            raise Exception("Missing required parameters . [DELIVERYID, INSTANCEID]")

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
            CANCEL SERVICE 
        """
        args = {
             "ACTION": "SETDSTATE",
             "DATA": {
                "ITEMID": deliveryId,
                "DSTATE": "CANCELED"
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
            RELEASE INSTANCE
        """
        args = {
            "ACTION": "SETDSTATE", 
            "INSTANCE": {
                "INSTANCEID": instanceId,
                "DSTATE": "AVAILABLE",
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
                'message': 'Delivery cancelled successfully ..',
                'error': None, 
                'data': None
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
                'message': 'Server error .',
                'error': None, 
                'data': None
            }),
        }
