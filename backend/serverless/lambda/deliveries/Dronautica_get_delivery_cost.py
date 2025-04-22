import json
import boto3
from typing import Dict, Any

# AWS clients
LAMBDA_CLIENT = boto3.client('lambda')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Verifies user permissions for a delivery and returns delivery cost information
    - Validates delivery ID parameter
    - Checks user permissions through DynamoDB Lambda
    - Returns delivery cost data if authorized
    """
    try:
        # Extract parameters (commented out for testing)
        claims = event['requestContext']['authorizer']['claims']
        username = claims.get('email')
        delivery_id = event["queryStringParameters"].get("deliveryId")
        

        if not delivery_id:
            raise ValueError("Missing deliveryId parameter")

        # Verify user permissions
        verify_payload = {
            "ACTION": "VERIFYUSER",
            "DATA": {
                "DELIVERYID": delivery_id,
                "VALUE": username,
                "ISPRIMARYUSER": True
            }
        }

        # Call verification Lambda
        verify_response = LAMBDA_CLIENT.invoke(
            FunctionName='Dronautica_dynamodb_delivery_actions',
            InvocationType='RequestResponse',
            Payload=json.dumps(verify_payload)
        )
        
        # Parse response
        db_response = json.loads(verify_response['Payload'].read())
        
        if db_response['STATE'] != "OK":
            error_msg = db_response.get('DATA', {}).get('ERROR', 'Unknown error')
            raise ValueError(f"Error verifying delivery: {error_msg}")
            
        if not db_response.get('DATA', {}).get('VALUE'):
            raise PermissionError("No tienes permisos sobre este item")

        # Get delivery cost data (replace with actual calculation)
        total_distance = 0  # Replace with actual distance calculation
        total_cost = 0      # Replace with actual cost calculation

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'ok': True,
                'message': 'Costo de entrega obtenido correctamente',
                'error': None,
                'data': {
                    'totalDistance': total_distance,
                    'totalCost': total_cost
                }
            })
        }

    except ValueError as e:
        return _build_error_response(400, str(e))
    except PermissionError as e:
        return _build_error_response(403, str(e))
    except Exception as e:
        print(f"Error processing delivery cost: {str(e)}")
        return _build_error_response(500, f"Error inesperado obteniendo el costo: {str(e)}")

def _build_error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Helper function to build error responses"""
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'ok': False,
            'message': message,
            'error': 'SERVER_ERROR' if status_code == 500 else 'CLIENT_ERROR',
            'data': None
        })
    }