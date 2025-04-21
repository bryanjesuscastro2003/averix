import boto3
import json
from typing import Dict, Any

# Cognito configuration
cognito = boto3.client('cognito-idp')
CLIENT_ID = '2i4fho4p2dcservoqvq265r16e'
CLIENT_SECRET = '1unm0loiir7le37pv93kp2j3elucn6uqu23ejqa36cs0gkoltm7r'

# Lambda service
lambda_service = boto3.client('lambda')

# Name of the Lambda function to generate the Cognito secret hash
DRONAUTICA_COGNITO_HASH = "Dronautica_cognito_secret_hash"

class ConfirmationException(Exception):
    """Base class for confirmation-related exceptions"""
    pass

class MissingRequiredFieldException(ConfirmationException):
    """Exception raised when required fields are missing"""
    pass

class InvalidConfirmationCodeException(ConfirmationException):
    """Exception raised when confirmation code is invalid"""
    pass

class ExpiredCodeException(ConfirmationException):
    """Exception raised when confirmation code has expired"""
    pass

class UserNotFoundException(ConfirmationException):
    """Exception raised when user doesn't exist"""
    pass

class AlreadyConfirmedException(ConfirmationException):
    """Exception raised when user is already confirmed"""
    pass

class TooManyRequestsException(ConfirmationException):
    """Exception raised when too many requests are made"""
    pass

class SecretHashGenerationException(ConfirmationException):
    """Exception raised when secret hash generation fails"""
    pass

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        
        """
            EVENT DATA
        """
        body = json.loads(event.get("body", "{}"))

        username = body.get("username", None)
        confirmation_code = body.get("confirmationCode", None)

        if not username or not confirmation_code:
            raise MissingRequiredFieldException("Both username and confirmation code are required.")

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

        # Confirm user sign-up
        try:
            response = cognito.confirm_sign_up(
                ClientId=CLIENT_ID,
                SecretHash=secret_hash,
                Username=username,
                ConfirmationCode=confirmation_code
            )
        except cognito.exceptions.CodeMismatchException:
            raise InvalidConfirmationCodeException("The verification code is incorrect. Please check the code and try again.")
        except cognito.exceptions.ExpiredCodeException:
            raise ExpiredCodeException("The verification code has expired. Please request a new code.")
        except cognito.exceptions.UserNotFoundException:
            raise UserNotFoundException("No account found with this username. Please check your username or register first.")
        except cognito.exceptions.NotAuthorizedException as e:
            if "already confirmed" in str(e).lower():
                raise AlreadyConfirmedException("This account has already been confirmed. You can now log in.")
            raise ConfirmationException("Authorization failed. Please try again.")
        except cognito.exceptions.TooManyRequestsException:
            raise TooManyRequestsException("Too many attempts. Please wait a few minutes and try again.")
        except cognito.exceptions.InvalidParameterException:
            raise ConfirmationException("Invalid request parameters. Please check your input.")
        except Exception as e:
            raise ConfirmationException(f"Confirmation failed: {str(e)}")

        # Successful response
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                'ok': True, 
                'message': 'Your account has been successfully confirmed! You can now log in.',
                "error": None,
                "data": None
            })
        }

    except MissingRequiredFieldException as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                "ok": False,
                "message": str(e),
                "error": "MISSING_REQUIRED_FIELD",
                "data": None
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
                "ok": False,
                "message": str(e),
                "error": "INVALID_CONFIRMATION_CODE",
                "data": None
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
                "ok": False,
                "message": str(e),
                "error": "EXPIRED_CODE",
                "data": None
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
                "ok": False,
                "message": str(e),
                "error": "USER_NOT_FOUND",
                "data": None
            })
        }
    except AlreadyConfirmedException as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                "ok": False,
                "message": str(e),
                "error": "ALREADY_CONFIRMED",
                "data": None
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
                "ok": False,
                "message": str(e),
                "error": "TOO_MANY_REQUESTS",
                "data": None
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
                "ok": False,
                "message": str(e),
                "error": "SECURITY_TOKEN_ERROR",
                "data": None
            })
        }
    except ConfirmationException as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                "ok": False,
                "message": str(e),
                "error": "CONFIRMATION_ERROR",
                "data": None
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
                "ok": False,
                "message": "An unexpected error occurred during confirmation. Please try again later.",
                "error": "INTERNAL_SERVER_ERROR",
                "data": None
            })
        }