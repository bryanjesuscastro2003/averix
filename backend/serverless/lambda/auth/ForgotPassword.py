
"""
This module provides functionality to initiate the forgot password process using AWS Cognito.

Functions:
    calculate_secret_hash(username: str) -> str:
        Calculates the secret hash required by AWS Cognito for authentication.

    lambda_handler(event: dict, context: object) -> dict:
        AWS Lambda handler function to initiate the forgot password process for a given username.

Constants:
    CLIENT_ID (str): The client ID for the Cognito user pool.
    CLIENT_SECRET (str): The client secret for the Cognito user pool.
"""
import hmac
import boto3
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
    AWS Lambda function to initiate the forgot password process for a user.

    This function extracts the username from the event, calculates the secret hash,
    and initiates the forgot password process using AWS Cognito.

    Parameters:
    event (dict): The event dictionary containing the input parameters. 
                  It should include the 'username' key.
    context (object): The context in which the Lambda function is called.

    Returns:
    dict: A dictionary containing the status code and a message indicating 
          whether the password reset code was sent successfully or an error occurred.
    """
    # Extract the username from the event
    username = "jesus"#event['username']
    # Calculate the Secret Hash
    secret_hash = calculate_secret_hash(username)

    try:
        # Initiate the forgot password process
        response = cognito.forgot_password(
            ClientId=CLIENT_ID,
            SecretHash=secret_hash, 
            Username=username
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'messgae':'Password reset code sent successfully!'})
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'message':f'Error: {str(e)}'})
        }