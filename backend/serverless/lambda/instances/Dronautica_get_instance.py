import json
import boto3
from typing import Dict, Any

# Lambda service client
lambda_client = boto3.client('lambda')


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:

        """
            EVENT DATA
        """
        claims = event['requestContext']['authorizer']['claims']
        user_role = claims.get('custom:role', 'user')
        
        if user_role not in ['admin', 'moderator']:
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Insufficient permissions'})
            }
            
        instanceId = event["queryStringParameters"].get("instanceId", None)
        action = event["queryStringParameters"].get("action", "FULL")
        
        if instanceId is None:
            raise Exception("Instance id is missing")
        
        if action != "FULL":
            action = "PARTIAL"

        """
            Get Item 
        """
        args = {
            "ACTION" : action, 
            "INSTANCE": {
                "INSTANCEID": instanceId
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_wrapper_data_instance',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        print(lambda_response)
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error such instance was not found .")
        data = lambda_response["DATA"]

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  
                'Access-Control-Allow-Methods': 'GET, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type',  
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                "ok": True,
                "message": "Instance found",
                "error": None,
                "data": data  # Ensure 'data' is JSON-serializable
            })
        }
    except Exception as e:
        return {
            'statusCode': 200, 
            'headers': {
                'Access-Control-Allow-Origin': '*',   
                'Access-Control-Allow-Methods': 'GET, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type', 
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                "ok": False,
                "message": "Error",
                "error": str(e),
                "data": None
            })
        }
