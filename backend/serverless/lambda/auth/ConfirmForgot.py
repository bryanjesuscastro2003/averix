import boto3
import hmac
import hashlib
import base64
import json


#Congnito configuration
cognito = boto3.client('cognito-idp')
CLIENT_ID = '4rfhcijm26et8kfs4etqephnl3'
CLIENT_SECRET = 'nbecjofnqeo3c0am61c2985ik948ujppstip9ecavskelgmnp85'


def calculate_secret_hash(username):
    """
    Calculate the secret hash for a given username using the CLIENT_ID and CLIENT_SECRET.

    Args:
        username (str): The username for which the secret hash is to be calculated.

    Returns:
        str: The base64 encoded secret hash.
    """
    # Calculate the Secret Hash
    message = username + CLIENT_ID
    dig = hmac.new(CLIENT_SECRET.encode('utf-8'), 
                   msg=message.encode('utf-8'), 
                   digestmod=hashlib.sha256).digest()
    return base64.b64encode(dig).decode()

def lambda_handler(event, context):
    """
    AWS Lambda function to handle password reset confirmation for a user.

    This function extracts the username, confirmation code, and new password from the event,
    calculates the secret hash, and then confirms the password reset using AWS Cognito.

    Args:
        event (dict): The event dictionary containing the following keys:
            - 'username' (str): The username of the user.
            - 'confirmation_code' (str): The confirmation code sent to the user.
            - 'new_password' (str): The new password for the user.
        context (object): The context in which the Lambda function is called.

    Returns:
        dict: A dictionary containing the status code and a message indicating the result of the operation.
            - 'statusCode' (int): The HTTP status code (200 for success, 400 for error).
            - 'body' (str): A JSON string containing a message about the result.
    """
    # Extract user details from the event
    username = "jess"#event['username']
    confirmation_code = "242033"#event['confirmation_code']
    new_password = "jesusbryA2003@"#event['new_password']

    # Calculate the Secret Hash
    secret_hash = calculate_secret_hash(username)

    try:
        # Confirm the password reset
        response = cognito.confirm_forgot_password(
            ClientId=CLIENT_ID,
            SecretHash=secret_hash, 
            Username=username,
            ConfirmationCode=confirmation_code,
            Password=new_password
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Password reset successfully!'})
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': f'Error: {str(e)}'})
        }