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
    Confirms password reset with verification code and new password
    - Validates all required fields
    - Handles all Cognito password reset scenarios
    - Returns responses in Spanish
    """
    try:
        # --- Input Validation ---
        body = json.loads(event.get("body", "{}"))
        username = body.get('username')
        confirmation_code = body.get('confirmationCode')
        new_password = body.get('newPassword')

        if not all([username, confirmation_code, new_password]):
            raise ValueError("Todos los campos son requeridos: usuario, código y nueva contraseña")  

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

        # --- Confirm Password Reset ---
        try:
            COGNITO_CLIENT.confirm_forgot_password(
                ClientId=CLIENT_ID,
                SecretHash=secret_hash,
                Username=username,
                ConfirmationCode=confirmation_code,
                Password=new_password
            )
            
            return _build_response(
                status_code=200,
                message="Contraseña actualizada correctamente. Ya puede iniciar sesión.",
                data=None
            )

        except COGNITO_CLIENT.exceptions.CodeMismatchException:
            raise ValueError("El código de verificación es incorrecto. Revísalo e intenta nuevamente")  
        except COGNITO_CLIENT.exceptions.ExpiredCodeException:
            raise ValueError("El código ha expirado. Solicita uno nuevo") 
        except COGNITO_CLIENT.exceptions.UserNotFoundException:
            raise ValueError("No existe una cuenta con este usuario. Verifica tus datos")  
        except COGNITO_CLIENT.exceptions.InvalidPasswordException:
            raise ValueError("La contraseña debe tener al menos 8 caracteres con letras, números y símbolos")  
        except COGNITO_CLIENT.exceptions.TooManyRequestsException:
            raise RuntimeError("Demasiados intentos. Espera 5 minutos y vuelve a intentar") 

    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),  
            error="VALIDATION_ERROR"
        )
    except RuntimeError as e:
        status_code = 429 if "Demasiados intentos" in str(e) else 500
        return _build_response(
            status_code=status_code,
            message=str(e),  
            error="PROCESSING_ERROR"
        )
    except Exception as e:
        print(f"Password reset confirmation error: {str(e)}")  
        return _build_response(
            status_code=500,
            message="Error inesperado. Contacta al soporte", 
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