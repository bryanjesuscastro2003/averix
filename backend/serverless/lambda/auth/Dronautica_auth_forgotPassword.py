import boto3
import json
from typing import Dict, Any

# Cognito configuration
cognito = boto3.client('cognito-idp')
CLIENT_ID = '2i4fho4p2dcservoqvq265r16e'
CLIENT_SECRET = '1unm0loiir7le37pv93kp2j3elucn6uqu23ejqa36cs0gkoltm7r'

# Lambda service 
lambda_service = boto3.client('lambda')

# Lambda function names
DRONAUTICA_COGNITO_HASH = "Dronautica_cognito_secret_hash"

class PasswordResetException(Exception):
    """Base class for password reset exceptions"""
    pass

class MissingRequiredFieldException(PasswordResetException):
    """Exception raised when required fields are missing"""
    pass

class UserNotFoundException(PasswordResetException):
    """Exception raised when user doesn't exist"""
    pass

class InvalidParameterException(PasswordResetException):
    """Exception raised when parameters are invalid"""
    pass

class TooManyRequestsException(PasswordResetException):
    """Exception raised when too many requests are made"""
    pass

class CodeDeliveryFailureException(PasswordResetException):
    """Exception raised when code delivery fails"""
    pass

class SecretHashGenerationException(PasswordResetException):
    """Exception raised when secret hash generation fails"""
    pass

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        
        """
            EVENT DATA
        """
        body = json.loads(event.get("body", "{}"))
        username = body.get('username')

        if not username:
            raise MissingRequiredFieldException("Username is required to reset password")

        # Generate secret hash
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
            raise SecretHashGenerationException("Failed to generate security token. Please try again.") from e

        # Initiate password reset
        try:
            response = cognito.forgot_password(
                ClientId=CLIENT_ID,
                SecretHash=secret_hash, 
                Username=username
            )
            
            # Extract delivery details if available
            delivery_details = response.get('CodeDeliveryDetails', {})
            delivery_data = {
                'destination': delivery_details.get('Destination', ''),
                'delivery_medium': delivery_details.get('DeliveryMedium', ''),
                'attribute_name': delivery_details.get('AttributeName', '')
            } if delivery_details else None
            
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*", 
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                'body': json.dumps({
                    'ok': True,
                    'message': 'Password reset code sent successfully! Check your registered email/phone.',
                    'error': None,
                    'data': delivery_data
                })
            }
            
        except cognito.exceptions.UserNotFoundException:
            raise UserNotFoundException("No account found with this username. Please check your username.")
        except cognito.exceptions.InvalidParameterException:
            raise InvalidParameterException("Invalid username format. Please check your input.")
        except cognito.exceptions.TooManyRequestsException:
            raise TooManyRequestsException("Too many attempts. Please wait before trying again.")
        except cognito.exceptions.CodeDeliveryFailureException:
            raise CodeDeliveryFailureException("Failed to send verification code. Please try again later.")
        except cognito.exceptions.NotAuthorizedException:
            raise PasswordResetException("Password reset is not allowed for this user.")
        except Exception as e:
            raise PasswordResetException(f"Password reset failed: {str(e)}")

    except MissingRequiredFieldException as e:
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
                'error': 'MISSING_REQUIRED_FIELD',
                'data': None
            })
        }
    except UserNotFoundException as e:
        return {
            'statusCode': 404,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'USER_NOT_FOUND',
                'data': None
            })
        }
    except InvalidParameterException as e:
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
                'error': 'INVALID_PARAMETER',
                'data': None
            })
        }
    except TooManyRequestsException as e:
        return {
            'statusCode': 429,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'TOO_MANY_REQUESTS',
                'data': None
            })
        }
    except CodeDeliveryFailureException as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'CODE_DELIVERY_FAILURE',
                'data': None
            })
        }
    except SecretHashGenerationException as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'SECURITY_ERROR',
                'data': None
            })
        }
    except PasswordResetException as e:
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
                'error': 'PASSWORD_RESET_ERROR',
                'data': None
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
                'message': 'An unexpected error occurred. Please try again later.',
                'error': 'INTERNAL_SERVER_ERROR',
                'data': None
            })
        }