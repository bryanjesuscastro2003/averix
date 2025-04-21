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

class CognitoException(Exception):
    """Base class for Cognito-related exceptions"""
    pass

class UsernameExistsException(CognitoException):
    """Exception raised when username already exists"""
    pass

class InvalidPasswordException(CognitoException):
    """Exception raised when password doesn't meet requirements"""
    pass

class InvalidParameterException(CognitoException):
    """Exception raised when parameters are invalid"""
    pass

class MissingRequiredFieldException(Exception):
    """Exception raised when required fields are missing"""
    pass

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        """
        EVENT DATA
        """
        body = json.loads(event.get("body", "{}"))
        
        username = body.get("username", None)
        password = body.get("password", None)
        name = body.get("name", None)
        nickname = body.get("nickname", None)
        role = body.get("role", None)

        # Admin role process
        try:
            claims = event['requestContext']['authorizer']['claims']
            user_role = claims.get('custom:role', 'user') 

            print("current role is ", role)

            if user_role in ['admin']:
                if role is None:
                    role = "user"
                elif role not in ["user", "admin"]:
                    role = "user"
            else:
                 role = "user"
        except:
            # Normal role process
            role = "user"

        print("Vamos ", name)

        if None in [username, password, name, nickname]:
            raise MissingRequiredFieldException("All fields (username, password, name, nickname) are required")
        
        if role not in ["user", "admin"]:
            role = "user"
            
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

        # Attempt to sign up the user using the Cognito API
        try:
            response = cognito.sign_up(
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
        except cognito.exceptions.UsernameExistsException:
            raise UsernameExistsException("This username already exists. Please choose a different one.")
        except cognito.exceptions.InvalidPasswordException:
            raise InvalidPasswordException("Password does not meet requirements. It must be at least 8 characters long and contain a mix of letters, numbers, and special characters.")
        except cognito.exceptions.InvalidParameterException:
            raise InvalidParameterException("One or more parameters are invalid. Please check your input.")
        except cognito.exceptions.CodeDeliveryFailureException:
            raise CognitoException("We couldn't deliver the verification code. Please check your email/phone number.")
        except Exception as e:
            raise CognitoException(f"Registration failed: {str(e)}")

        # Return a success response
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                "ok": True,
                "message": "User registered successfully! Please check your email to confirm your account.",
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
    except UsernameExistsException as e:
        return {
            'statusCode': 409,  # Conflict status code
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                "ok": False,
                "message": str(e),
                "error": "USERNAME_EXISTS",
                "data": None
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
                "ok": False,
                "message": str(e),
                "error": "INVALID_PASSWORD",
                "data": None
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
                "ok": False,
                "message": str(e),
                "error": "INVALID_PARAMETER",
                "data": None
            })
        }
    except CognitoException as e:
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
                "error": "COGNITO_ERROR",
                "data": None
            })
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                "ok": False,
                "message": "An unexpected error occurred. Please try again later.",
                "error": "INTERNAL_SERVER_ERROR",
                "data": None
            })
        }