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
    Handles user registration with Cognito
    - Validates required fields
    - Sets default role to 'user' unless admin specifies otherwise
    - Returns success/error messages in Spanish
    """
    try:
        # --- Parse and Validate Input ---
        body = json.loads(event.get("body", "{}"))
        username = body.get("username")
        password = body.get("password")
        name = body.get("name")
        nickname = body.get("nickname")
        requested_role = body.get("role")

        # --- Role Assignment Logic ---
        try:
            claims = event['requestContext']['authorizer']['claims']
            current_user_role = claims.get('custom:role', 'user')
            
            # Only admins can assign roles, default to 'user'
            role = requested_role if current_user_role == 'admin' and requested_role in ['user', 'admin'] else 'user'
        except:
            # Public registration defaults to 'user'
            role = 'user'

        # --- Field Validation ---
        if not all([username, password, name, nickname]):
            raise ValueError("Todos los campos son requeridos: username, password, name, nickname")  

        # --- Generate Secret Hash ---
        try:
            hash_response = LAMBDA_CLIENT.invoke(
                FunctionName=SECRET_HASH_LAMBDA,
                InvocationType='RequestResponse',
                Payload=json.dumps({"username": username})
            )
            secret_hash = json.loads(hash_response['Payload'].read())['data']
        except Exception:
            raise RuntimeError("Error de seguridad. Por favor intente nuevamente") 

        # --- Cognito Registration ---
        try:
            COGNITO_CLIENT.sign_up(
                ClientId=CLIENT_ID,
                SecretHash=secret_hash,
                Username=username,
                Password=password,
                UserAttributes=[
                    {'Name': 'name', 'Value': name},
                    {'Name': 'nickname', 'Value': nickname},
                    {'Name': 'custom:role', 'Value': role}
                ]
            )
            
            return _build_response(
                status_code=200,
                message="Registro exitoso. Por favor verifique su email para activar la cuenta.",  
                data=None
            )

        except COGNITO_CLIENT.exceptions.UsernameExistsException:
            raise ValueError("El nombre de usuario ya existe. Por favor elija otro.") 
        except COGNITO_CLIENT.exceptions.InvalidPasswordException:
            raise ValueError("La contraseña debe tener al menos 8 caracteres con letras, números y símbolos")  
        except COGNITO_CLIENT.exceptions.InvalidParameterException:
            raise ValueError("Datos inválidos. Por favor revise la información proporcionada")  
        except COGNITO_CLIENT.exceptions.CodeDeliveryFailureException:
            raise RuntimeError("Error al enviar el código de verificación. Verifique su email/teléfono")  

    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),  
            error="VALIDATION_ERROR"
        )
    except RuntimeError as e:
        return _build_response(
            status_code=500,
            message=str(e),  
            error="PROCESSING_ERROR"
        )
    except Exception as e:
        print(f"Signup error: {str(e)}")  
        return _build_response(
            status_code=500,
            message="Error inesperado. Por favor intente más tarde",  
            error="INTERNAL_ERROR"
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