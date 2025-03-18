"""
This module provides an AWS Lambda function to authenticate a user using AWS Cognito.

Functions:
    calculate_secret_hash(username):

    lambda_handler(event, context):

Constants:
    CLIENT_ID (str): The client ID for the Cognito user pool.
    CLIENT_SECRET (str): The client secret for the Cognito user pool.

"""

import boto3
import hmac
import hashlib
import base64
import json


#Congnito configuration
cognito = boto3.client('cognito-idp')
CLIENT_ID = '6kfep002e7t9ll9thv3m5aggtk'
CLIENT_SECRET = '1sbd6jkn6vf8b8n0s83136o9rpfbh3pfq98cj6r027ulmnhl5l6m'

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
    AWS Lambda function to authenticate a user using AWS Cognito.

    Args:
        event (dict): The event dictionary containing the request parameters.
                      Expected keys are 'username' and 'password'.
        context (object): The context in which the Lambda function is called.

    Returns:
        dict: A dictionary containing the status code and the authentication result or error message.
              - If authentication is successful, returns:
                {
              - If authentication fails, returns:
                {
    """
    # Extract user details from the event
    username = "jesus"#event['username']
    password = "jesusbryA2003@"#event['password']

    # Calculate the Secret Hash
    secret_hash = calculate_secret_hash(username)

    try:
        # Authenticate the user
        response = cognito.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password,
                'SECRET_HASH': secret_hash  # Include the Secret Hash
            },
            ClientId=CLIENT_ID
        )
        return {
            'statusCode': 200,
            'body': json.dumps(response['AuthenticationResult'])
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps(f'Error: {str(e)}')
        }