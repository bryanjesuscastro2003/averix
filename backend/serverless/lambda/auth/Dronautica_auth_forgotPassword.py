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
    Initiates password reset process by sending confirmation code
    - Validates username
    - Handles all Cognito password reset scenarios
    - Returns responses in Spanish
    """
    try:
        # --- Input Validation ---
        body = json.loads(event.get("body", "{}"))
        username = body.get('username')

        if not username:
            raise ValueError("El nombre de usuario es requerido para restablecer la contraseña")  # Spanish

        # --- Generate Secret Hash ---
        try:
            hash_response = LAMBDA_CLIENT.invoke(
                FunctionName=SECRET_HASH_LAMBDA,
                InvocationType='RequestResponse',
                Payload=json.dumps({"username": username})
            )
            secret_hash = json.loads(hash_response['Payload'].read())['data']
        except Exception:
            raise RuntimeError("Error de seguridad. Por favor intente nuevamente")  # Spanish

        # --- Initiate Password Reset ---
        try:
            response = COGNITO_CLIENT.forgot_password(
                ClientId=CLIENT_ID,
                SecretHash=secret_hash,
                Username=username
            )

            # --- Format Delivery Details ---
            delivery_details = response.get('CodeDeliveryDetails', {})
            masked_destination = _mask_destination(delivery_details.get('Destination', ''))

            return _build_response(
                status_code=200,
                message="Código de restablecimiento enviado. Revise su email/teléfono registrado.",  # Spanish
                data={
                    'delivery_medium': delivery_details.get('DeliveryMedium'),
                    'destination': masked_destination,
                    'attribute_name': delivery_details.get('AttributeName')
                }
            )

        except COGNITO_CLIENT.exceptions.UserNotFoundException:
            raise ValueError("Usuario no encontrado. Verifique el nombre de usuario")  # Spanish
        except COGNITO_CLIENT.exceptions.InvalidParameterException:
            raise ValueError("Formato de usuario inválido. Por favor verifíquelo")  # Spanish
        except COGNITO_CLIENT.exceptions.TooManyRequestsException:
            raise RuntimeError("Demasiados intentos. Por favor espere antes de intentar nuevamente")  # Spanish
        except COGNITO_CLIENT.exceptions.CodeDeliveryFailureException:
            raise RuntimeError("Error al enviar el código. Por favor intente más tarde")  # Spanish
        except COGNITO_CLIENT.exceptions.NotAuthorizedException:
            raise ValueError("Restablecimiento de contraseña no permitido para este usuario")  # Spanish

    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),  # Spanish message
            error="VALIDATION_ERROR"
        )
    except RuntimeError as e:
        status_code = 429 if "Demasiados intentos" in str(e) else 500
        return _build_response(
            status_code=status_code,
            message=str(e),  # Spanish message
            error="PROCESSING_ERROR"
        )
    except Exception as e:
        print(f"Password reset error: {str(e)}")  # English log
        return _build_response(
            status_code=500,
            message="Error inesperado. Por favor intente más tarde",  # Spanish
            error="INTERNAL_ERROR"
        )

def _mask_destination(destination: str) -> str:
    """Masks sensitive destination information (email/phone)"""
    if not destination:
        return ""
    if "@" in destination:  # Email
        parts = destination.split("@")
        return f"{parts[0][0]}***@{parts[1]}"
    else:  # Phone number
        return f"***{destination[-4:]}" if len(destination) > 4 else destination

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
            'message': message,  # Spanish
            'data': data,
            'error': error  # English
        })
    }