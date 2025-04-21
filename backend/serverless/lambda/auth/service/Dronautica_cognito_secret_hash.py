import hmac
import hashlib
import base64
from typing import Dict, Any


CLIENT_ID = '2i4fho4p2dcservoqvq265r16e'
CLIENT_SECRET = '1unm0loiir7le37pv93kp2j3elucn6uqu23ejqa36cs0gkoltm7r'

def lambda_handler(event, context) -> Dict[str, Any]:
    """
    Calculate the Secret Hash required for secure communication with AWS Cognito.
    
    Args:
        username (str): The username of the user.
    
    Returns:
        str: The base64-encoded secret hash.
    """
    username = event['username']
    message = username + CLIENT_ID
    dig = hmac.new(CLIENT_SECRET.encode('utf-8'), 
                   msg=message.encode('utf-8'), 
                   digestmod=hashlib.sha256).digest()
    return {
        "data": base64.b64encode(dig).decode()
    }