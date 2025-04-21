import json
import boto3
from datetime import datetime

# Lambda service client
lambda_client = boto3.client('lambda')


def lambda_handler(event, context):
    try: 

        """ 
            EVENT DATA
        """
        claims = event['requestContext']['authorizer']['claims']
        username = claims.get('email', None)
        user_role = claims.get('custom:role', 'user')
        
        if user_role in ['admin', 'moderator']:
            username = None

        args = {
             "ACTION": "GETITEMS",
             "DATA": {
                "PRIMARYUSER": username
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_delivery_actions',
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading instances . {lambda_response["VALUE"]["ERROR"]}") 
        
        items = lambda_response['DATA']['ITEMS']

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
                'message': 'Deliveries retrieved successfully',
                'error': None,
                'data': {
                    'items': items,  # List of filtered drones
                    'count': len(items)  # Number of filtered drones
                }
            })
        }



    except Exception as e:
        print(e)
        raise e
