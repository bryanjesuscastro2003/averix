import json
import boto3
from typing import Dict, Any

# Lambda service client
lambda_client = boto3.client('lambda')


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        
        """
           Get Items
        """
        claims = event['requestContext']['authorizer']['claims']
        user_role = claims.get('custom:role', 'user')
        
        if user_role not in ['admin', 'moderator']:
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Insufficient permissions'})
            }

        args = {
             "ACTION": "GETITEMS"
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instance_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error creating an instance . {lambda_response["VALUE"]["ERROR"]}")
        instances = lambda_response["VALUE"]["INSTANCES"]

        # Return the filtered drones
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
                'message': 'Instances retrieved successfully',
                'error': None,
                'data': {
                    'instances': instances,  # List of filtered drones
                    'count': len(instances)  # Number of filtered drones
                }
            })
        }

    except Exception as e:
        # Return an error response if an exception occurs
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
                'data': None,
                'message': 'Failed to retrieve Instances',
                'error': f'Server error: {str(e)}'
            })
        }