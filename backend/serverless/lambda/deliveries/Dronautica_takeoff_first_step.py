import json
import boto3
from typing import Dict, Any

# AWS clients
LAMBDA_CLIENT = boto3.client('lambda')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handles the first step of applying for a drone delivery service
    - Validates input parameters
    - Finds available drone instance
    - Creates tracking records
    - Creates delivery record
    - Updates instance state
    """
    try:
        # Extract and validate input
        claims = event['requestContext']['authorizer']['claims']
        username = claims.get('email')
        body = json.loads(event.get('body', '{}'))
        
        location_a = body.get('locationA')
        capacity = body.get('capacity')
        description = body.get('description', '')

        if not all([username, location_a, capacity]):
            return _build_response(
                status_code=400,
                message="Missing required fields: username, locationA, or capacity",
                error="MISSING_PARAMETERS"
            )

        if capacity not in ["small", "medium", "large"]:
            return _build_response(
                status_code=400,
                message="Invalid capacity. Must be small, medium, or large",
                error="INVALID_CAPACITY"
            )

        # Map capacity to instance type
        capacity_mapping = {
            "small": "DRONAUTICA_SMALL_INSTANCE",
            "medium": "DRONAUTICA_MEDIUM_INSTANCE",
            "large": "DRONAUTICA_LARGE_INSTANCE"
        }
        instance_type = capacity_mapping[capacity]

        # Find available instance
        instance = _find_available_instance(instance_type)
        if not instance:
            return _build_response(
                status_code=400,
                message="No available instances for selected capacity",
                error="NO_INSTANCES_AVAILABLE"
            )

        # Create tracking records
        tracking_logs_id = _create_tracking_logs()
        tracking_id = _create_tracking(tracking_logs_id)

        # Create delivery record
        delivery_id = _create_delivery(
            username=username,
            description=description,
            location_a=location_a,
            station_location=instance["stationLocation"],
            instance_id=instance["id"],
            tracking_id=tracking_id
        )

        # Update instance state
        _update_instance_state(instance["id"], "BUSY_ST_1")

        return _build_response(
            status_code=200,
            message="Delivery created successfully",
            data={
                'deliveryId': delivery_id,
                'trackingId': tracking_id,
                'trackingLogsId': tracking_logs_id
            }
        )

    except json.JSONDecodeError:
        return _build_response(
            status_code=400,
            message="Invalid request body",
            error="INVALID_REQUEST"
        )
    except Exception as e:
        print(f"Error creating delivery: {str(e)}")
        return _build_response(
            status_code=500,
            message="Failed to create delivery",
            error="SERVER_ERROR"
        )

def _find_available_instance(instance_type: str) -> Dict[str, Any]:
    """Find available drone instance by capacity"""
    response = LAMBDA_CLIENT.invoke(
        FunctionName='Dronautica_dynamodb_instance_actions',
        InvocationType='RequestResponse',
        Payload=json.dumps({
            "ACTION": "GETITEMSAVAILABLESBYCAPACITY",
            "INSTANCE": {"CAPACITY": instance_type}
        })
    )
    result = json.loads(response['Payload'].read())
    if result['STATE'] != "OK":
        raise RuntimeError(result.get('VALUE', {}).get('ERROR', 'Unknown error'))
    return result['VALUE']['INSTANCES'][0] if result['VALUE']['INSTANCES'] else None

def _create_tracking_logs() -> str:
    """Create new tracking logs record"""
    response = LAMBDA_CLIENT.invoke(
        FunctionName='Dronautica_dynamodb_deliveryTrackingLogs_actions',
        InvocationType='RequestResponse',
        Payload=json.dumps({"ACTION": "PUTITEM"})
    )
    result = json.loads(response['Payload'].read())
    if result['STATE'] != "OK":
        raise RuntimeError(result.get('DATA', {}).get('ERROR', 'Unknown error'))
    return result['DATA']['ITEMID']

def _create_tracking(tracking_logs_id: str) -> str:
    """Create new tracking record"""
    response = LAMBDA_CLIENT.invoke(
        FunctionName='Dronautica_dynamodb_deliveryTracking_actions',
        InvocationType='RequestResponse',
        Payload=json.dumps({
            "ACTION": "PUTITEM",
            "DATA": {"TRACKINGLOGSID": tracking_logs_id}
        })
    )
    result = json.loads(response['Payload'].read())
    if result['STATE'] != "OK":
        raise RuntimeError(result.get('VALUE', {}).get('ERROR', 'Unknown error'))
    return result['DATA']['ITEMID']

def _create_delivery(
    username: str,
    description: str,
    location_a: str,
    station_location: str,
    instance_id: str,
    tracking_id: str
) -> str:
    """Create new delivery record"""
    response = LAMBDA_CLIENT.invoke(
        FunctionName='Dronautica_dynamodb_delivery_actions',
        InvocationType='RequestResponse',
        Payload=json.dumps({
            "ACTION": "PUTITEM",
            "DATA": {
                "PRIMARYUSER": username,
                "DESCRIPTION": description,
                "LOCATIONA": json.dumps(location_a),
                "LOCATIONZ": station_location,
                "INSTANCEID": instance_id,
                "TRACKINGID": tracking_id
            }
        })
    )
    result = json.loads(response['Payload'].read())
    if result['STATE'] != "OK":
        raise RuntimeError(result.get('DATA', {}).get('ERROR', 'Unknown error'))
    return result['DATA']['ITEMID']

def _update_instance_state(instance_id: str, state: str) -> None:
    """Update instance state"""
    response = LAMBDA_CLIENT.invoke(
        FunctionName='Dronautica_dynamodb_instance_actions',
        InvocationType='RequestResponse',
        Payload=json.dumps({
            "ACTION": "SETDSTATE",
            "INSTANCE": {
                "INSTANCEID": instance_id,
                "DSTATE": state,
                "REFRESH": True
            }
        })
    )
    result = json.loads(response['Payload'].read())
    if result['STATE'] != "OK":
        raise RuntimeError(result.get('VALUE', {}).get('ERROR', 'Unknown error'))

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