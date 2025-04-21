import json
import boto3

# Lambda service 
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    try:
        # EVENT DATA
        deliveryId = event["queryStringParameters"].get("deliveryId", None)

        claims = event['requestContext']['authorizer']['claims']
        username = claims.get('email', None)

        secondaryUser = username
        primaryUser = None

        if deliveryId is None:
            raise Exception("Delivery id is missing")
        
        if primaryUser is None and secondaryUser is None:
            raise Exception("Username is missing")

        """
            Verify delivery already confirmed 
        """
        args = {
             "ACTION": "VERIFYCONFIRMATION",
             "DATA": {
                "DELIVERYID": deliveryId,   
                "PRIMARYUSER": primaryUser, 
                "SECONDARYUSER": secondaryUser
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
        value = lambda_response["DATA"]["VALUE"]
        if value:
            raise Exception(f"Delivery already confirmed .")
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  
                'Access-Control-Allow-Methods': 'GET, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type',  
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                'ok': True,
                'message': 'Please confirm your delivery .',
                'data': None, 
                "error": None
            })
        
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  
                'Access-Control-Allow-Methods': 'GET, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type',  
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': "Server error, please try again later ..",
                'data': None
            })
        }
