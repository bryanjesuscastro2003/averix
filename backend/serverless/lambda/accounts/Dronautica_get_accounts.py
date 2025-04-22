import boto3
import json
from typing import Dict, Any, List
from datetime import datetime

# Cognito configuration 
COGNITO_CLIENT = boto3.client('cognito-idp')
USER_POOL_ID = 'us-east-1_Zv8onB8HZ'

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Retrieves all user accounts from Cognito (Admin only).
    Supports pagination and filtering.
    """
    try:
        # --- Authorization Check ---
        claims = event['requestContext']['authorizer']['claims']
        user_role = claims.get('custom:role', 'user')
        
        if user_role not in ['admin', 'moderator']:
            return _build_response(
                status_code=403,
                message="Acceso denegado: Se requieren privilegios de administrador o moderador.",  
                error="PERMISSION_DENIED" 
            )

        # --- Query Parameters ---
        query_params = event.get('queryStringParameters', {}) or {}
        limit = int(query_params.get('limit', 60))
        pagination_token = query_params.get('pagination_token')
        filter_expression = query_params.get('filter')

        # --- Validation ---
        if limit < 1 or limit > 60:
            raise ValueError("El límite debe estar entre 1 y 60 usuarios") 

        # --- Cognito Query ---
        list_users_params = {
            'UserPoolId': USER_POOL_ID,
            'Limit': limit
        }
        if pagination_token:
            list_users_params['PaginationToken'] = pagination_token
        if filter_expression:
            list_users_params['Filter'] = filter_expression

        response = COGNITO_CLIENT.list_users(**list_users_params)

        # --- Format Response ---
        users = [_format_user(user) for user in response.get('Users', [])]

        return _build_response(
            status_code=200,
            message="Usuarios obtenidos exitosamente",
            data={
                'users': users,
                'pagination': {
                    'next_token': response.get('PaginationToken'),
                    'total_count': len(users)
                }
            }
        )

    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),
            error="INVALID_PARAMETER"  
        )
    except COGNITO_CLIENT.exceptions.InvalidParameterException:
        return _build_response(
            status_code=400,
            message="Filtro o token de paginación no válido",  
            error="INVALID_FILTER_OR_TOKEN" 
        )
    except COGNITO_CLIENT.exceptions.UserPoolNotFoundException:
        return _build_response(
            status_code=404,
            message="Grupo de usuarios no encontrado",
            error="USER_POOL_NOT_FOUND"  
        )
    except Exception as e:
        print(f"Error retrieving users: {str(e)}") 
        return _build_response(
            status_code=500,
            message="Error al recuperar los usuarios",  
            error="SERVER_ERROR" 
        )

def _format_user(user: Dict[str, Any]) -> Dict[str, Any]:
    """Formats Cognito user data into a consistent structure"""
    return {
        'username': user.get('Username'),
        'enabled': user.get('Enabled'),
        'status': user.get('UserStatus'),
        'created': _format_date(user.get('UserCreateDate')),
        'modified': _format_date(user.get('UserLastModifiedDate')),
        'attributes': {attr['Name']: attr['Value'] for attr in user.get('Attributes', [])}
    }

def _format_date(date_obj: datetime) -> str:
    """Formats datetime object to ISO string or returns None"""
    return date_obj.isoformat() if date_obj else None

def _build_response(
    status_code: int,
    message: str,
    data: Any = None,
    error: str = None
) -> Dict[str, Any]:
    """Constructs a standardized API response"""
    return {
        'statusCode': status_code,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        'body': json.dumps({
            'ok': error is None,
            'message': message,  
            'data': data,
            'error': error  
        })
    }