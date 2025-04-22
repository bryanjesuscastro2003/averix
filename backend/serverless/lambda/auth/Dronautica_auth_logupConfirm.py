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
    Confirms user registration with verification code
    - Validates username and confirmation code
    - Handles all Cognito confirmation scenarios
    - Returns responses in Spanish
    """
    try:
        # --- Input Validation ---
        body = json.loads(event.get("body", "{}"))
        username = body.get("username")
        confirmation_code = body.get("confirmationCode")

        if not all([username, confirmation_code]):
            raise ValueError("Se requieren nombre de usuario y código de confirmación") 

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

        # --- Confirm Registration ---
        try:
            COGNITO_CLIENT.confirm_sign_up(
                ClientId=CLIENT_ID,
                SecretHash=secret_hash,
                Username=username,
                ConfirmationCode=confirmation_code
            )
            
            return _build_response(
                status_code=200,
                message="¡Cuenta verificada exitosamente! Ya puede iniciar sesión.", 
                data=None
            )

        except COGNITO_CLIENT.exceptions.CodeMismatchException:
            raise ValueError("El código de verificación es incorrecto. Por favor revíselo") 
        except COGNITO_CLIENT.exceptions.ExpiredCodeException:
            raise ValueError("El código ha expirado. Solicite uno nuevo")  
        except COGNITO_CLIENT.exceptions.UserNotFoundException:
            raise ValueError("Usuario no encontrado. Regístrese primero")  
        except COGNITO_CLIENT.exceptions.NotAuthorizedException as e:
            if "already confirmed" in str(e).lower():
                raise ValueError("Esta cuenta ya fue verificada. Puede iniciar sesión") 
            raise RuntimeError("Error de autorización. Intente nuevamente") 
        except COGNITO_CLIENT.exceptions.TooManyRequestsException:
            raise RuntimeError("Demasiados intentos. Espere unos minutos")  
        except COGNITO_CLIENT.exceptions.InvalidParameterException:
            raise ValueError("Datos inválidos. Verifique la información")  

    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),  
            error="VALIDATION_ERROR"
        )
    except RuntimeError as e:
        return _build_response(
            status_code=400,
            message=str(e),  
            error="PROCESSING_ERROR"
        )
    except Exception as e:
        print(f"Confirmation error: {str(e)}")  
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