import boto3
import json
from typing import Dict, Any

# Cognito configuration
cognito = boto3.client('cognito-idp')
CLIENT_ID = '2i4fho4p2dcservoqvq265r16e'
CLIENT_SECRET = '1unm0loiir7le37pv93kp2j3elucn6uqu23ejqa36cs0gkoltm7r'

# Lambdas 
DRONAUTICA_COGNITO_HASH = "Dronautica_cognito_secret_hash"


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        username = body.get('username')
        
        if not username:
            raise ValueError("Username is required")

        # Calculate the Secret Hash
        try:
            args = {"username": username}
            lambda_response = lambda_service.invoke(
                FunctionName=DRONAUTICA_COGNITO_HASH,
                InvocationType='RequestResponse',
                Payload=json.dumps(args)
            )
            lambda_response_payload = json.loads(lambda_response['Payload'].read())
            secret_hash = lambda_response_payload['data']
        except Exception as e:
            raise Exception("Failed to generate secret hash") from e

        # Resend confirmation code
        response = cognito.resend_confirmation_code(
            ClientId=CLIENT_ID,
            SecretHash=secret_hash,
            Username=username
        )

        delivery_details = response.get('CodeDeliveryDetails', {})
        
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': True,
                'message': 'Confirmation code resent successfully',
                'data': {
                    'delivery_method': delivery_details.get('DeliveryMedium'),
                    'destination': delivery_details.get('Destination'),
                    'attribute_name': delivery_details.get('AttributeName')
                },
                'error': None
            })
        }

    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'data': None,
                'error': 'MISSING_PARAMETER'
            })
        }
    except cognito.exceptions.UserNotFoundException as e:
        return {
            'statusCode': 404,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'User not found',
                'data': None,
                'error': 'USER_NOT_FOUND'
            })
        }
    except cognito.exceptions.InvalidParameterException as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'User is already confirmed',
                'data': None,
                'error': 'ALREADY_CONFIRMED'
            })
        }
    except cognito.exceptions.LimitExceededException as e:
        return {
            'statusCode': 429,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'Too many attempts. Please try again later.',
                'data': None,
                'error': 'LIMIT_EXCEEDED'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': 'Failed to resend confirmation code',
                'data': None,
                'error': 'SERVER_ERROR'
            })
        }