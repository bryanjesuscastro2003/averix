import json
import boto3
from typing import Dict, Any

# AWS clients
LAMBDA_CLIENT = boto3.client('lambda')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Retrieves delivery items from DynamoDB through another Lambda
    - Filters by user unless admin/moderator
    - Returns formatted delivery items
    """
    try:
        # Extract user info from auth claims
        claims = event['requestContext']['authorizer']['claims']
        username = claims.get('email')
        user_role = claims.get('custom:role', 'user')
        
        # Admins/moderators get all items, regular users get their own
        filter_user = None if user_role in ['admin', 'moderator'] else username

        # Prepare payload for DynamoDB Lambda
        payload = {
            "ACTION": "GETITEMS",
            "DATA": {
                "PRIMARYUSER": filter_user
            }
        }

        # Call DynamoDB Lambda
        response = LAMBDA_CLIENT.invoke(
            FunctionName='Dronautica_dynamodb_delivery_actions',
            InvocationType='RequestResponse',
            Payload=json.dumps(payload))
        
        # Parse response
        db_response = json.loads(response['Payload'].read())
        
        if db_response['STATE'] != "OK":
            raise ValueError(f"Database error: {db_response.get('VALUE', {}).get('ERROR', 'Unknown error')}")

        items = db_response['DATA']['ITEMS']

        return _build_response(
            status_code=200,
            message="Deliveries retrieved successfully",
            data={
                'items': items,
                'count': len(items)
            }
        )

    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),
            error="DATABASE_ERROR"
        )
    except Exception as e:
        print(f"Error retrieving deliveries: {str(e)}")
        return _build_response(
            status_code=500,
            message="Failed to retrieve deliveries",
            error="INTERNAL_ERROR"
        )

def _build_response(
    status_code: int,
    message: str,
    data: Any = None,
    error: str = None
) -> Dict[str, Any]:
    """Standardized response formatter"""
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'ok': error is None,
            'message': message,
            'error': error,
            'data': data
        })
    }