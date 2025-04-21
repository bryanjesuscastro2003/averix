import boto3
import json
from typing import Dict, Any

# AWS Cognito configuration
cognito = boto3.client('cognito-idp')
CLIENT_ID = '2i4fho4p2dcservoqvq265r16e'
CLIENT_SECRET = '1unm0loiir7le37pv93kp2j3elucn6uqu23ejqa36cs0gkoltm7r'

# AWS Lambda client
lambda_service = boto3.client('lambda')

# Name of the Lambda function that calculates the Secret Hash
DRONAUTICA_COGNITO_HASH = "Dronautica_cognito_secret_hash"

class PasswordResetException(Exception):
    """Base class for password reset exceptions"""
    pass

class MissingRequiredFieldException(PasswordResetException):
    """Exception raised when required fields are missing"""
    pass

class InvalidConfirmationCodeException(PasswordResetException):
    """Exception raised when confirmation code is invalid"""
    pass

class ExpiredCodeException(PasswordResetException):
    """Exception raised when confirmation code has expired"""
    pass

class UserNotFoundException(PasswordResetException):
    """Exception raised when user doesn't exist"""
    pass

class InvalidPasswordException(PasswordResetException):
    """Exception raised when password doesn't meet requirements"""
    pass

class TooManyRequestsException(PasswordResetException):
    """Exception raised when too many requests are made"""
    pass

class SecretHashGenerationException(PasswordResetException):
    """Exception raised when secret hash generation fails"""
    pass

class InvalidRequestFormatException(PasswordResetException):
    """Exception raised when request format is invalid"""
    pass

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        
        """
            EVENT DATA
        """
        
        body = json.loads(event.get("body", "{}"))
        
        username = body.get('username')
        confirmation_code = body.get('confirmationCode')
        new_password = body.get('newPassword')

        if None in (username, confirmation_code, new_password):
            raise MissingRequiredFieldException("All fields (username, confirmationCode, newPassword) are required")

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

        # Confirm password reset
        try:
            response = cognito.confirm_forgot_password(
                ClientId=CLIENT_ID,
                SecretHash=secret_hash,
                Username=username,
                ConfirmationCode=confirmation_code,
                Password=new_password
            )
            
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                'body': json.dumps({
                    'ok': True,
                    'message': 'Password changed successfully. You can now log in with your new password.',
                    'error': None,
                    'data': None
                })
            }
            
        except cognito.exceptions.CodeMismatchException:
            raise InvalidConfirmationCodeException("The verification code is incorrect. Please check the code and try again.")
        except cognito.exceptions.ExpiredCodeException:
            raise ExpiredCodeException("The verification code has expired. Please request a new code.")
        except cognito.exceptions.UserNotFoundException:
            raise UserNotFoundException("No account found with this username. Please check your username.")
        except cognito.exceptions.InvalidPasswordException:
            raise InvalidPasswordException("Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.")
        except cognito.exceptions.TooManyRequestsException:
            raise TooManyRequestsException("Too many attempts. Please wait a few minutes and try again.")
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
                'error': 'MISSING_FIELDS',
                'data': None
            })
        }
    except InvalidConfirmationCodeException as e:
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
                'error': 'INVALID_CODE',
                'data': None
            })
        }
    except ExpiredCodeException as e:
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
                'error': 'EXPIRED_CODE',
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
    except InvalidPasswordException as e:
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
                'error': 'INVALID_PASSWORD',
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
    except InvalidRequestFormatException as e:
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
                'error': 'INVALID_REQUEST',
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
                'error': 'RESET_FAILED',
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
                'error': 'INTERNAL_ERROR',
                'data': None
            })
        }