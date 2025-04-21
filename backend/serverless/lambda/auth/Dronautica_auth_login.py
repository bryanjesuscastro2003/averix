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

def get_user_role(user_attributes: list) -> str:
    """
    Get the user's role from custom:role attribute
    Defaults to 'user' if no role is found
    """
    for attribute in user_attributes:
        if attribute['Name'] == 'custom:role':
            return attribute['Value'].lower()  # Ensure lowercase for consistency
    return 'user'  # Default role

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        body = json.loads(event.get("body", "{}"))
        username = body.get("username", None)
        password = body.get("password", None)

        if None in [username, password]:
            raise Exception("Missing username or password")

        # Calculate the Secret Hash
        args = {"username": username}
        lambda_response = lambda_service.invoke(
            FunctionName=DRONAUTICA_COGNITO_HASH,
            InvocationType='RequestResponse',
            Payload=json.dumps(args)
        )
        lambda_response_payload = json.loads(lambda_response['Payload'].read())
        secret_hash = lambda_response_payload['data']

        # Authenticate the user
        response = cognito.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password,
                'SECRET_HASH': secret_hash  
            },
            ClientId=CLIENT_ID
        )
        
        # Get user details to extract role
        user_info = cognito.get_user(
            AccessToken=response['AuthenticationResult']['AccessToken']
        )
        
        # Extract role from custom attribute
        role = get_user_role(user_info['UserAttributes'])
        
        # Add role to authentication result
        auth_result = response['AuthenticationResult']
        auth_result['role'] = role
        
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({                
                "ok": True, 
                "message": "User authenticated successfully",
                "error": None, 
                "data": auth_result
            })
        }
    except cognito.exceptions.NotAuthorizedException:
        return {
            'statusCode': 401,
            'headers': {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            'body': json.dumps({
                "ok": False, 
                "message": "Incorrect username or password",
                "error": "NotAuthorizedException", 
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
                "message": "Authentication failed",
                "error": str(e), 
                "data": None
            })
        }