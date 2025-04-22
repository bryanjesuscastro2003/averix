import json
import boto3
from typing import Dict, Any

# AWS clients
LAMBDA_CLIENT = boto3.client('lambda')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Cancels a delivery service and releases the associated instance
    - Verifies user authorization
    - Marks delivery as CANCELED
    - Releases instance back to AVAILABLE
    """
    try:
        # Extract and validate input
        claims = event['requestContext']['authorizer']['claims']
        username = claims.get('email')
        body = json.loads(event.get('body', '{}'))
        
        delivery_id = body.get('deliveryId')
        instance_id = body.get('instanceId')
        
        if None in (delivery_id, instance_id):
            return _build_response(
                status_code=400,
                message="Missing required parameters: deliveryId and instanceId",
                error="MISSING_PARAMETERS"
            )

        # Verify user authorization
        verify_response = _call_delivery_lambda(
            action="VERIFYUSER",
            payload={
                "DELIVERYID": delivery_id,
                "ISPRIMARYUSER": True,
                "VALUE": username
            }
        )
        
        if not verify_response.get('DATA', {}).get('VALUE'):
            return _build_response(
                status_code=403,
                message="Not authorized to cancel this delivery",
                error="UNAUTHORIZED"
            )

        # Cancel delivery
        cancel_response = _call_delivery_lambda(
            action="SETDSTATE",
            payload={
                "ITEMID": delivery_id,
                "DSTATE": "CANCELED"
            }
        )

        # Release instance
        release_response = _call_instance_lambda(
            action="SETDSTATE",
            payload={
                "INSTANCEID": instance_id,
                "DSTATE": "AVAILABLE",
                "REFRESH": True
            }
        )

        return _build_response(
            status_code=200,
            message="Delivery cancelled successfully",
            data=None
        )

    except json.JSONDecodeError:
        return _build_response(
            status_code=400,
            message="Invalid request body",
            error="INVALID_REQUEST"
        )
    except Exception as e:
        print(f"Error cancelling service: {str(e)}")
        return _build_response(
            status_code=500,
            message="Failed to cancel delivery",
            error="SERVER_ERROR"
        )

def _call_delivery_lambda(action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to call delivery actions Lambda"""
    args = {
        "ACTION": action,
        "DATA": payload
    }
    response = LAMBDA_CLIENT.invoke(
        FunctionName='Dronautica_dynamodb_delivery_actions',
        InvocationType='RequestResponse',
        Payload=json.dumps(args))
    return json.loads(response['Payload'].read())

def _call_instance_lambda(action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to call instance actions Lambda"""
    args = {
        "ACTION": action,
        "INSTANCE": payload
    }
    response = LAMBDA_CLIENT.invoke(
        FunctionName='Dronautica_dynamodb_instance_actions',
        InvocationType='RequestResponse',
        Payload=json.dumps(args))
    return json.loads(response['Payload'].read())

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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
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