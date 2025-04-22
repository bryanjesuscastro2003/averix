import boto3
import json
from typing import Dict, Any

# AWS Configuration
COGNITO_CLIENT = boto3.client('cognito-idp')
LAMBDA_CLIENT = boto3.client('lambda')
CLIENT_ID = '2i4fho4p2dcservoqvq265r16e'
SECRET_HASH_LAMBDA = "Dronautica_cognito_secret_hash"

def get_user_role(user_attributes: list) -> str:
    """
    Extracts user role from custom attributes
    Returns 'user' if no role specified
    """
    for attr in user_attributes:
        if attr['Name'] == 'custom:role':
            return attr['Value'].lower()
    return 'user'

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handles user login authentication via Cognito
    Returns JWT tokens and user role on success
    """
    try:
        # --- Input Validation ---
        body = json.loads(event.get("body", "{}"))
        username = body.get("username")
        password = body.get("password")

        if not all([username, password]):
            raise ValueError("Usuario y contraseña son requeridos")  # Spanish

        # --- Generate Secret Hash ---
        try:
            hash_response = LAMBDA_CLIENT.invoke(
                FunctionName=SECRET_HASH_LAMBDA,
                InvocationType='RequestResponse',
                Payload=json.dumps({"username": username})
            )
            secret_hash = json.loads(hash_response['Payload'].read())['data']
        except Exception:
            raise RuntimeError("Error de autenticación. Intente nuevamente")  # Spanish

        # --- Authenticate User ---
        auth_response = COGNITO_CLIENT.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password,
                'SECRET_HASH': secret_hash
            },
            ClientId=CLIENT_ID
        )

        # --- Get User Role ---
        user_data = COGNITO_CLIENT.get_user(
            AccessToken=auth_response['AuthenticationResult']['AccessToken']
        )
        role = get_user_role(user_data['UserAttributes'])

        # --- Format Success Response ---
        auth_result = auth_response['AuthenticationResult']
        auth_result['role'] = role

        return _build_response(
            status_code=200,
            message="Autenticación exitosa", 
            data=auth_result
        )

    except COGNITO_CLIENT.exceptions.NotAuthorizedException:
        return _build_response(
            status_code=401,
            message="Usuario o contraseña incorrectos",  
            error="INVALID_CREDENTIALS"
        )
    except COGNITO_CLIENT.exceptions.UserNotFoundException:
        return _build_response(
            status_code=404,
            message="Usuario no encontrado",  
            error="USER_NOT_FOUND"
        )
    except COGNITO_CLIENT.exceptions.UserNotConfirmedException:
        return _build_response(
            status_code=403,
            message="Cuenta no verificada. Por favor verifique su email.",  
            error="USER_NOT_CONFIRMED"
        )
    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),  
            error="MISSING_REQUIRED_FIELDS"
        )
    except Exception as e:
        print(f"Login error: {str(e)}")  #
        return _build_response(
            status_code=500,
            message="Error durante la autenticación",  
            error="AUTHENTICATION_FAILED"
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