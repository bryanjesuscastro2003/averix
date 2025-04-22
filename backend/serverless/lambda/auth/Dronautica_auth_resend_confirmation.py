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
    Resends confirmation code for user registration
    - Validates username
    - Handles all Cognito resend scenarios
    - Returns responses in Spanish
    """
    try:
        # --- Input Validation ---
        body = json.loads(event.get('body', '{}'))
        username = body.get('username')

        if not username:
            raise ValueError("El nombre de usuario es requerido")  # Spanish

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

        # --- Resend Confirmation Code ---
        response = COGNITO_CLIENT.resend_confirmation_code(
            ClientId=CLIENT_ID,
            SecretHash=secret_hash,
            Username=username
        )

        # --- Format Delivery Details ---
        delivery_details = response.get('CodeDeliveryDetails', {})
        masked_destination = _mask_destination(delivery_details.get('Destination', ''))

        return _build_response(
            status_code=200,
            message="Código de confirmación reenviado exitosamente",  # Spanish
            data={
                'delivery_method': delivery_details.get('DeliveryMedium'),
                'destination': masked_destination,
                'attribute_name': delivery_details.get('AttributeName')
            }
        )

    except COGNITO_CLIENT.exceptions.UserNotFoundException:
        return _build_response(
            status_code=404,
            message="Usuario no encontrado. Regístrese primero",  # Spanish
            error="USER_NOT_FOUND"
        )
    except COGNITO_CLIENT.exceptions.InvalidParameterException:
        return _build_response(
            status_code=400,
            message="El usuario ya está confirmado",  # Spanish
            error="ALREADY_CONFIRMED"
        )
    except COGNITO_CLIENT.exceptions.LimitExceededException:
        return _build_response(
            status_code=429,
            message="Demasiados intentos. Espere 5 minutos",  # Spanish
            error="LIMIT_EXCEEDED"
        )
    except ValueError as e:
        return _build_response(
            status_code=400,
            message=str(e),  # Spanish message
            error="MISSING_PARAMETER"
        )
    except RuntimeError as e:
        return _build_response(
            status_code=500,
            message=str(e),  # Spanish message
            error="SECURITY_ERROR"
        )
    except Exception as e:
        print(f"Resend confirmation error: {str(e)}")  # English log
        return _build_response(
            status_code=500,
            message="Error al reenviar el código. Intente más tarde",  # Spanish
            error="SERVER_ERROR"
        )

def _mask_destination(destination: str) -> str:
    """Masks email/phone destination for privacy"""
    if '@' in destination:  # Email
        parts = destination.split('@')
        return f"{parts[0][0]}***@{parts[1]}"
    elif destination:  # Phone
        return f"***{destination[-4:]}"
    return ""

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