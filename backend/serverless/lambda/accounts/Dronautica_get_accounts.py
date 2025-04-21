import boto3
import json
from typing import Dict, Any, List

# Cognito configuration
cognito = boto3.client('cognito-idp')
USER_POOL_ID = 'us-east-1_Zv8onB8HZ'  

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
        query_params = event.get('queryStringParameters', {}) or {}
        limit = int(query_params.get('limit', 60))  # Default limit of 60 users
        pagination_token = query_params.get('pagination_token', None)
        filter_expression = query_params.get('filter', None)
        
        # Validate limit
        if limit < 1 or limit > 60:
            raise ValueError("Limit must be between 1 and 60")

        # Build list_users parameters
        list_users_params = {
            'UserPoolId': USER_POOL_ID,
            'Limit': limit
        }
        
        if pagination_token:
            list_users_params['PaginationToken'] = pagination_token
            
        if filter_expression:
            list_users_params['Filter'] = filter_expression

        # Get users from Cognito
        response = cognito.list_users(**list_users_params)
        
        # Format the response
        users = []
        for user in response.get('Users', []):
            user_data = {
                'username': user.get('Username'),
                'enabled': user.get('Enabled'),
                'status': user.get('UserStatus'),
                'created': user.get('UserCreateDate').isoformat() if user.get('UserCreateDate') else None,
                'modified': user.get('UserLastModifiedDate').isoformat() if user.get('UserLastModifiedDate') else None,
                'attributes': {}
            }
            
            # Extract user attributes
            for attr in user.get('Attributes', []):
                user_data['attributes'][attr['Name']] = attr['Value']
            
            users.append(user_data)

        # Prepare response
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': True,
                'message': 'Users retrieved successfully',
                'data': {
                    'users': users,
                    'pagination': {
                        'next_token': response.get('PaginationToken'),
                        'total_count': len(users)
                    }
                },
                'error': None
            })
        }
        
    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'data': None,
                'error': 'INVALID_PARAMETER'
            })
        }
    except cognito.exceptions.InvalidParameterException as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'Invalid filter or pagination token',
                'data': None,
                'error': 'INVALID_FILTER_OR_TOKEN'
            })
        }
    except cognito.exceptions.UserPoolNotFoundException as e:
        return {
            'statusCode': 404,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'User pool not found',
                'data': None,
                'error': 'USER_POOL_NOT_FOUND'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'Failed to retrieve users',
                'data': None,
                'error': 'SERVER_ERROR'
            })
        }