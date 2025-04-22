import json
import boto3
from typing import Dict, Any

# AWS clients
LAMBDA_CLIENT = boto3.client('lambda')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Retrieves delivery information including tracking data and logs
    - Requires instanceId parameter
    - Calls wrapper Lambda to get complete delivery data
    - Returns delivery, tracking, and tracking logs
    """
    try:
        # Extract and validate parameters
        query_params = event.get("queryStringParameters", {})
        instance_id = query_params.get("instanceId")
        
        if not instance_id:
            return _build_response(
                status_code=400,
                message="Instance ID is required",
                error="MISSING_PARAMETER"
            )

        # Prepare payload for wrapper Lambda
        payload = {
            "DATA": {
                "INSTANCEID": instance_id
            }
        }

        # Call wrapper Lambda
        response = LAMBDA_CLIENT.invoke(
            FunctionName='Dronautica_wrapper_data_delivery',
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        
        # Parse and validate response
        wrapper_response = json.loads(response['Payload'].read())
        
        if wrapper_response['STATE'] != "OK":
            error_msg = wrapper_response.get('DATA', {}).get('ERROR', 'Unknown error')
            return _build_response(
                status_code=400,
                message=f"Error loading delivery: {error_msg}",
                error="DELIVERY_LOAD_ERROR"
            )

        # Extract response data
        return _build_response(
            status_code=200,
            message="Delivery data retrieved successfully",
            data={
                'delivery': wrapper_response['DATA'].get('DELIVERY', {}),
                'tracking': wrapper_response['DATA'].get('TRACKING', {}),
                'trackingLogs': wrapper_response['DATA'].get('TRACKINGLOGS', [])
            }
        )

    except Exception as e:
        print(f"Error loading delivery: {str(e)}")
        return _build_response(
            status_code=500,
            message=f"Error loading delivery: {str(e)}",
            error="SERVER_ERROR"
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