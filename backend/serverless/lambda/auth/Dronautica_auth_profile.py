import boto3
import json
from typing import Dict, Any

# Cognito configuration
cognito = boto3.client('cognito-idp')
CLIENT_ID = '2i4fho4p2dcservoqvq265r16e'
CLIENT_SECRET = '1unm0loiir7le37pv93kp2j3elucn6uqu23ejqa36cs0gkoltm7r'

# Lambda service 
lambda_service = boto3.client('lambda')

# Lambdas 
DRONAUTICA_COGNITO_HASH = "Dronautica_cognito_secret_hash"

class ProfileException(Exception):
    """Base class for profile-related exceptions"""
    pass

class MissingRequiredFieldException(ProfileException):
    """Exception raised when required fields are missing"""
    pass

class InvalidTokenException(ProfileException):
    """Exception raised when tokens are invalid"""
    pass

class TokenExpiredException(ProfileException):
    """Exception raised when access token has expired"""
    pass

class InvalidRefreshTokenException(ProfileException):
    """Exception raised when refresh token is invalid"""
    pass

class UserNotFoundException(ProfileException):
    """Exception raised when user doesn't exist"""
    pass

class SecretHashGenerationException(ProfileException):
    """Exception raised when secret hash generation fails"""
    pass

class TokenRefreshFailedException(ProfileException):
    """Exception raised when token refresh fails"""
    pass

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        """
            EVENT DATA
        """
        headers = event.get('headers', {})
        access_token = headers.get("Authorization", "")
        refresh_token = headers.get("x-refresh-token", "")
        username = event.get("queryStringParameters", {}).get("username", "")

        print(headers)

        # Remove "Bearer " prefix if present
        access_token = access_token.split(" ")[-1] if access_token else ""

        if not all([access_token, refresh_token, username]):
            raise MissingRequiredFieldException("Authorization, refresh token, and username are required")

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
            raise SecretHashGenerationException("Failed to generate security token") from e

        # Try to fetch user data
        try:
            response = cognito.get_user(AccessToken=access_token)
            user_attributes = response['UserAttributes']
            user_data = {attr['Name']: attr['Value'] for attr in user_attributes}
            
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*", 
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
                },
                'body': json.dumps({
                    'ok': True,
                    'message': 'User profile retrieved successfully',
                    'error': None,
                    'data': {
                        'user_data': user_data,
                        'tokens': None
                    }
                })
            }
            
        except cognito.exceptions.NotAuthorizedException as e:
            if 'Access Token has expired' in str(e):
                raise TokenExpiredException("Access token has expired") from e
            raise InvalidTokenException("Invalid access token") from e
        except cognito.exceptions.UserNotFoundException as e:
            raise UserNotFoundException("User not found") from e

    except TokenExpiredException:
        try:
            # Refresh tokens
            auth_response = cognito.initiate_auth(
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters={
                    'REFRESH_TOKEN': refresh_token,
                    'SECRET_HASH': secret_hash
                },
                ClientId=CLIENT_ID
            )
            
            new_access_token = auth_response['AuthenticationResult']['AccessToken']
            new_id_token = auth_response['AuthenticationResult']['IdToken']
            new_refresh_token = auth_response['AuthenticationResult'].get('RefreshToken', refresh_token)
            
            # Get user data with new token
            response = cognito.get_user(AccessToken=new_access_token)
            user_attributes = response['UserAttributes']
            user_data = {attr['Name']: attr['Value'] for attr in user_attributes}
            
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*", 
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
                },
                'body': json.dumps({
                    'ok': True,
                    'message': 'User profile retrieved with refreshed tokens',
                    'error': None,
                    'data': {
                        'user_data': user_data,
                        'tokens': {
                            'access_token': new_access_token,
                            'id_token': new_id_token,
                            'refresh_token': new_refresh_token
                        }
                    }
                })
            }
            
        except Exception as e:
            raise TokenRefreshFailedException(f"Failed to refresh tokens: {str(e)}")

    except MissingRequiredFieldException as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'MISSING_FIELDS',
                'data': None
            })
        }
    except InvalidTokenException as e:
        return {
            'statusCode': 401,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'INVALID_ACCESS_TOKEN',
                'data': None
            })
        }
    except TokenExpiredException as e:
        return {
            'statusCode': 401,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'TOKEN_EXPIRED',
                'data': None
            })
        }
    except InvalidRefreshTokenException as e:
        return {
            'statusCode': 401,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'INVALID_REFRESH_TOKEN',
                'data': None
            })
        }
    except UserNotFoundException as e:
        return {
            'statusCode': 404,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'USER_NOT_FOUND',
                'data': None
            })
        }
    except SecretHashGenerationException as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'SECURITY_ERROR',
                'data': None
            })
        }
    except TokenRefreshFailedException as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
            },
            'body': json.dumps({
                'ok': False,
                'message': str(e),
                'error': 'TOKEN_REFRESH_FAILED',
                'data': None
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                'Access-Control-Allow-Headers': 'Content-Type,X-Refresh-Token,Authorization',
            },
            'body': json.dumps({
                'ok': False,
                'message': 'An unexpected error occurred',
                'error': 'INTERNAL_ERROR',
                'data': None
            })
        }