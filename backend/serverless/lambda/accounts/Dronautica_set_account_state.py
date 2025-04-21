import boto3
import json
from typing import Dict, Any

# Cognito configuration
cognito = boto3.client('cognito-idp')
USER_POOL_ID = 'us-east-1_Zv8onB8HZ'  

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', None)
        action = body.get('action', '').lower()  # 'enable' or 'disable'
        
        if not username:
            raise ValueError("Username is required")
        
        if action not in ['enable', 'disable']:
            raise ValueError("Action must be either 'enable' or 'disable'")

        # Perform the requested action
        if action == 'disable':
            response = cognito.admin_disable_user(
                UserPoolId=USER_POOL_ID,
                Username=username
            )
            action_past = 'disabled'
        else:
            response = cognito.admin_enable_user(
                UserPoolId=USER_POOL_ID,
                Username=username
            )
            action_past = 'enabled'

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': True,
                'message': f'User {username} {action_past} successfully',
                'data': {'action': action},
                'error': None
            })
        }

    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'data': None,
                'error': 'INVALID_REQUEST'
            })
        }
    except cognito.exceptions.UserNotFoundException as e:
        return {
            'statusCode': 404,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'User not found',
                'data': None,
                'error': 'USER_NOT_FOUND'
            })
        }
    except cognito.exceptions.NotAuthorizedException as e:
        return {
            'statusCode': 403,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'Not authorized to perform this action',
                'data': None,
                'error': 'NOT_AUTHORIZED'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': f'Failed to {action} user',
                'data': None,
                'error': 'SERVER_ERROR'
            })
        }