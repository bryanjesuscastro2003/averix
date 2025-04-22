import boto3
import json
from typing import Dict, Any

# AWS Configuration
COGNITO_CLIENT = boto3.client('cognito-idp')
LAMBDA_CLIENT = boto3.client('lambda')
CLIENT_ID = '2i4fho4p2dcservoqvq265r16e'
SECRET_HASH_LAMBDA = "Dronautica_cognito_secret_hash"

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Retrieves user profile data using access token
    - Handles token expiration by automatically refreshing
    - Returns user attributes and optionally new tokens
    - Responses in Spanish with English error codes
    """
    try:
        # --- Parse and Validate Input ---
        headers = event.get('headers', {})
        access_token = headers.get("Authorization", "").replace("Bearer ", "")
        refresh_token = headers.get("x-refresh-token", "")
        username = event.get("queryStringParameters", {}).get("username", "")

        if not all([access_token, refresh_token, username]):
            raise ValueError("Se requieren token de acceso, token de refresco y nombre de usuario")  # Spanish

        # --- Generate Secret Hash ---
        try:
            hash_response = LAMBDA_CLIENT.invoke(
                FunctionName=SECRET_HASH_LAMBDA,
                InvocationType='RequestResponse',
                Payload=json.dumps({"username": username})
            )
            secret_hash = json.loads(hash_response['Payload'].read())['data']
        except Exception:
            raise RuntimeError("Error de seguridad. Intente nuevamente")  # Spanish

        # --- Get User Data ---
        try:
            response = COGNITO_CLIENT.get_user(AccessToken=access_token)
            user_data = {attr['Name']: attr['Value'] for attr in response['UserAttributes']}
            
            return _build_response(
                status_code=200,
                message="Perfil obtenido exitosamente",  # Spanish
                data={
                    'user_data': user_data,
                    'tokens': None  # Tokens not refreshed
                }
            )
            
        except COGNITO_CLIENT.exceptions.NotAuthorizedException as e:
            if 'expired' in str(e).lower():
                return _handle_token_refresh(username, refresh_token, secret_hash)
            raise ValueError("Token de acceso inválido")  # Spanish
        except COGNITO_CLIENT.exceptions.UserNotFoundException:
            raise ValueError("Usuario no encontrado")  # Spanish

    except ValueError as e:
        return _build_response(
            status_code=400 if "Se requieren" in str(e) else 401,
            message=str(e),  # Spanish message
            error="VALIDATION_ERROR" if "Se requieren" in str(e) else "AUTH_ERROR"
        )
    except RuntimeError as e:
        return _build_response(
            status_code=500,
            message=str(e),  # Spanish message
            error="SECURITY_ERROR"
        )
    except Exception as e:
        print(f"Profile error: {str(e)}")  # English log
        return _build_response(
            status_code=500,
            message="Error inesperado. Contacte al soporte",  # Spanish
            error="INTERNAL_ERROR"
        )

def _handle_token_refresh(username: str, refresh_token: str, secret_hash: str) -> Dict[str, Any]:
    """Handles token refresh when access token is expired"""
    try:
        auth_response = COGNITO_CLIENT.initiate_auth(
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token,
                'SECRET_HASH': secret_hash
            },
            ClientId=CLIENT_ID
        )
        
        new_tokens = {
            'access_token': auth_response['AuthenticationResult']['AccessToken'],
            'id_token': auth_response['AuthenticationResult']['IdToken'],
            'refresh_token': auth_response['AuthenticationResult'].get('RefreshToken', refresh_token)
        }
        
        # Get user data with new token
        response = COGNITO_CLIENT.get_user(AccessToken=new_tokens['access_token'])
        user_data = {attr['Name']: attr['Value'] for attr in response['UserAttributes']}
        
        return _build_response(
            status_code=200,
            message="Perfil obtenido con tokens actualizados",  # Spanish
            data={
                'user_data': user_data,
                'tokens': new_tokens
            }
        )
    except Exception as e:
        raise RuntimeError("Error al actualizar tokens. Vuelva a iniciar sesión")  # Spanish

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
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,X-Refresh-Token,Authorization",
        },
        'body': json.dumps({
            'ok': error is None,
            'message': message,  # Spanish
            'data': data,
            'error': error  # English
        })
    }