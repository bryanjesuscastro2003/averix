import boto3
import json
from typing import Dict, Any

# Cognito configuration
COGNITO_CLIENT = boto3.client('cognito-idp')
USER_POOL_ID = 'us-east-1_Zv8onB8HZ'

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Enables/disables a user account (Admin only)
    Required body params: username, action ('enable'|'disable')
    """
    try:
        # --- Authorization Check ---
        claims = event['requestContext']['authorizer']['claims']
        user_role = claims.get('custom:role', 'user')
        
        if user_role != 'admin':
            return _build_response(
                status_code=403,
                message="Acción restringida: Solo administradores pueden habilitar/deshabilitar usuarios",  
                error="PERMISSION_DENIED"  
            )

        # --- Parse Input ---
        body = json.loads(event.get('body', '{}'))
        username = body.get('username')
        action = body.get('action', '').lower()

        # --- Validation ---
        if not username:
            raise ValueError("El nombre de usuario es requerido") 
        
        if action not in ['enable', 'disable']:
            raise ValueError("La acción debe ser 'enable' (habilitar) o 'disable' (deshabilitar)")  

        # --- Execute Action ---
        if action == 'disable':
            COGNITO_CLIENT.admin_disable_user(
                UserPoolId=USER_POOL_ID,
                Username=username
            )
            message = f"Usuario {username} deshabilitado correctamente"  
        else:
            COGNITO_CLIENT.admin_enable_user(
                UserPoolId=USER_POOL_ID,
                Username=username
            )
            message = f"Usuario {username} habilitado correctamente" 

        return _build_response(
            status_code=200,
            message=message,
            data={'action': action}
        )

    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),
            error="INVALID_REQUEST"
        )
    except COGNITO_CLIENT.exceptions.UserNotFoundException:
        return _build_response(
            status_code=404,
            message=f"Usuario {username} no encontrado", 
            error="USER_NOT_FOUND"
        )
    except COGNITO_CLIENT.exceptions.NotAuthorizedException:
        return _build_response(
            status_code=403,
            message="No autorizado para realizar esta acción", 
            error="NOT_AUTHORIZED"
        )
    except Exception as e:
        print(f"Error modifying user state: {str(e)}")  
        return _build_response(
            status_code=500,
            message=f"Error al {action} el usuario", 
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
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        'body': json.dumps({
            'ok': error is None,
            'message': message,  
            'data': data,
            'error': error  
        })
    }