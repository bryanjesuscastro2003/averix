"""
This module provides a Lambda function for user sign-up using AWS Cognito.
Functions:
    calculate_secret_hash(username: str) -> str:
        Calculates the secret hash required for Cognito sign-up.
    lambda_handler(event: dict, context: object) -> dict:
        AWS Lambda handler function to sign up a new user in Cognito.
Constants:
    CLIENT_ID (str): The client ID for the Cognito user pool.
    CLIENT_SECRET (str): The client secret for the Cognito user pool.
"""

import boto3
import hmac
import hashlib
import base64
import json

# Initialize the Cognito client
cognito = boto3.client('cognito-idp')

CLIENT_ID = '4rfhcijm26et8kfs4etqephnl3'
CLIENT_SECRET = 'nbecjofnqeo3c0am61c2985ik948ujppstip9ecavskelgmnp85'

def calculate_secret_hash(username):
    """
    Calculate the secret hash using the provided username and predefined client credentials.

    Args:
        username (str): The username to be used in the hash calculation.

    Returns:
        str: The base64-encoded secret hash.

    Raises:
        TypeError: If the username is not a string.
    """
    # Calculate the Secret Hash
    message = username + CLIENT_ID
    dig = hmac.new(CLIENT_SECRET.encode('utf-8'), 
                   msg=message.encode('utf-8'), 
                   digestmod=hashlib.sha256).digest()
    return base64.b64encode(dig).decode()



def lambda_handler(event, context):
    """
    AWS Lambda function to handle user sign-up using AWS Cognito.
    Args:
        event (dict): The event dictionary containing the following keys:
            - username (str): The username of the user.
            - password (str): The password of the user.
            - email (str): The email address of the user.
            - name (str, optional): The name of the user.
            - nickname (str, optional): The nickname of the user.
            - picture (str, optional): The URL to the user's picture.
        context (object): The context in which the Lambda function is called.
    Returns:
        dict: A dictionary containing the status code and a message indicating
              the result of the sign-up process.
    """

    username = "jesus"#event['username']
    password = "jesusbryA2003@"#event['password']
    email = "jesusbryan155@gmail.com"#event['email']
    name = "bryan"#event.get('name', '')  # Optional field
    nickname = "bryan"#event.get('nickname', '')  # Optional field
    picture = "None"#event.get('picture', '')  # Optional field
    
    # Calculate the Secret Hash
    secret_hash = calculate_secret_hash(username)

    try:
        
        # Sign up the user
        response = cognito.sign_up(
            ClientId=CLIENT_ID,
            SecretHash=secret_hash, 
            Username=username,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': name},
                {'Name': 'nickname', 'Value': "nickname"},
                {'Name': 'picture', 'Value': picture}
            ]
        )
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'User registered successfully! but its not active please confirm your account '})
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'message':f'Error: {str(e)}'})
        }