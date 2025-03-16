

import boto3
import json
import hmac

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
    AWS Lambda function to handle user profile retrieval and token refresh.

    This function attempts to fetch the user's profile data using the provided Access Token.
    If the Access Token is expired, it uses the Refresh Token to obtain new tokens and then
    fetches the user's profile data with the new Access Token.

    Parameters:
    event (dict): The event dictionary containing the following keys:
        - access_token (str): The Access Token for the user.
        - refresh_token (str): The Refresh Token for the user.
        - username (str): The username of the user.
    context (object): The context in which the Lambda function is called.

    Returns:
    dict: A dictionary containing the status code and the response body. The response body
    includes the user's profile data and, if applicable, new tokens.

    Possible status codes:
    - 200: Successfully retrieved the user's profile data.
    - 400: Bad request or error occurred during the process.

    Example response:
    {
    """
    # Extract the Access Token and Refresh Token from the event
    access_token = "eyJraWQiOiJNcGJ5R1BhcjNIdHF0ODJnejBPQ1UyUkc2Q1plWXNoMWRnSnRkcVVEbjhzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyNDQ4NzRhOC0xMDExLTcwNGEtNWUyOC02ZWJhZTQ4NjdkMTciLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9odGxoblc5d3oiLCJjbGllbnRfaWQiOiI2a2ZlcDAwMmU3dDlsbDl0aHYzbTVhZ2d0ayIsIm9yaWdpbl9qdGkiOiI4M2IyNmZkMi0zM2VkLTQwMzQtYmFmZi01NDIwODc1MDU3ZmIiLCJldmVudF9pZCI6IjA5YTg0M2RhLTZhMjktNDhhMS04ODlhLWRhNDY1MGZkOGUzOSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3NDA5NDAwNTgsImV4cCI6MTc0MDk0MzY1OCwiaWF0IjoxNzQwOTQwMDU4LCJqdGkiOiJlNTVlOGNjZC1mMjQ0LTQ0MGUtYjZlNi0wZjdjYTY0Mzg1ZjYiLCJ1c2VybmFtZSI6Implc3VzIn0.IcXJXHXFJ_EmhmUPv93uHXBlLKD-1ZPqH4tyq_M032UphtTBdmz4fZd3HnK1DGjJi0osIguH0OAtpRCf69wKPoGSS3i4YCT4MgKXsIykHm-aPgjq2HNLBUFquJzgU1fjtCLPyaXaP3CAR_OaoPy8UCDt83EGw3SC_1ASAtRuVxDqb7TCINJvwq3agPU-ZF35kMAw3XwgWTFdV4WCVypN2FapAIhuMDG_jDncPIL1LfraTS6uZtjaGhcsbeiOLXEnEHTb6J-Rgrc5nzAiJObTQLGVuQFtTR1mW3CCA7mi2jlbTeq1ZkXd9vZI-Rvwu6ep4W5RUu5SD2lHaigoT6UB3A"#event.get('access_token')
    refresh_token = "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.vKHtOBc9M2GxXLL8D7nQy5ZMG8eXCSy_dZwQl9zuHk8OtNLIH8JYWpv8Jcl6rD-t9ZF6kZtcv4CMCVtqx567yw-WMYLBhYLeS8DPAwUqi8CWdPjkmI7NyEkN59OIG57qEjM2r44E8c4svHgeV3Ga_n9TIdVUleITwfvOEnn7uW_UdQ-nnjZ5HGrP6xdY-yMYZSmZnxXIoS0QIEfmC3EqO12KOjxyQVbPd_KaAbvQ0iBslGQc4tGPJMhDqHV7WTXNdZxFaMclQkTFGF3aLs29-LrWWnnYmG76qcTd8oUe-r-JSQjdFWAdn34sCTIQAipp_FqjaUwgk_YxQQJuOYlTtA.HHwcH3hzCcteg3FD.Eon_nm13BPEAAC-4GIJJ2K65xjjnC08w1Upvl45gHDr351XBaywzu8-NEh68yMvMW9Nvfi5J1-eMh1TGztwHisk-TFPbJwWJHvJPoFgQwGrz5w6ytzzWwDSHDvlRueXLJa4uuyBxrkJLjdhlfBa_uPlYg17RDVJdPaZvlyxecLeAf7coz4KSQW1bpy6LYEZYsYsNLNTXTgPXGCFUA_gZQLOfbA2Pd-JCQJreY4duM3YLqQpjZWsH7AmEzJlP-DVQIEz_sMcm_tUCnfbich_-yUEKjV2oizLya2jd7MzMHSIhOTn8C-wvSxEIG-1mxA60FM77pj8Rj23yLrvIZrcKKYOZoejXgeGGWZHWxNVBNKcq4n44_IvGnB6DfPbzf_0Nvy8FBveIh3GlP1zbDQLd4V2BZsmY-u5r1QE3oSbwENuy_88bdjlDHS7XIE60CEzuXFS3__R78X550u-48xhhRqDuPzXZSjtWN6mtq2DU3M36kK8zlheVjDmZYqvVY8rNbj3DFbuCxvYVPeDXKpLpSmLdepQPMa0gm04Wb7TgbKA021xo-mqvSzUG7AEzIQY6qQAihnZzAKUXBImMwb6h5Oadf_3czKK8YMyNGFYSnsdzmLY8o64ttJwpU7d8APX3ULxtKHdHX3IWOj4zfxQI9ObXzZeNj5s2BLB9QbhQj33poj-tbk6W7jpRUoZPRjHhYJ3M6UgPJZn2bL8NA2QrJiVaHpZvF7-03LbitMJEUvBF8drwsvLKF27By1pLXBjLZZZDD4AF9iNjvSMTQyPC0cxIdHdp_VbKn9N_8xq0kW5VTGUbNBxWXtRjX_QNE7HH7p6uxU-8SnFAts2dDBE6IXA3nclQ1CXalLdsuuFtf5N8-FAt_ritGsqYppQwhaV9XL-8wAjtuSrN5cJ1FOWBKRr_ww4A_xauGB7A7is51GBbDhUN0yUoy4MKv4Bhj3-vGQaNdtu7COCHc4Mz8DlOh5g_JcijOSA_u7ru9Ln_cUNEsCxhMWT72zG9DYSO7QY6GtuzCs-gHdHMU82PKff97Q-bCZZy6PuJg9T9prGtxfvPm2hviwKWO-xJm4MknlTE7_gfIooK4LBYyfathSn31XSgJbGeJxNWgQ2G04vhXliQSOBGhadL-_4KYz7eD2dCchmE0A1xazAYAeG6AomB18q2EHMO3g0-IxUAjzp763q4ZpDlZ6S96qKPh4fZBJKm2BIFtpsG6YDqbB9aGsXHMcTY6rDS2cS9yQN0iLNdut3vOgyhvOz96ELMZ180srMNf-qn.YVJX14JasatKJ8Ib2GEoB"#event.get('refresh_token')
    username = "jesus"#event.get('username')

    try:
        # Try to fetch the user's profile data using the Access Token
        try:
            response = cognito.get_user(AccessToken=access_token)
            user_attributes = response['UserAttributes']
            user_data = {attr['Name']: attr['Value'] for attr in user_attributes}
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'user_data': user_data,
                    'tokens': None  # No new tokens needed
                })
            }
        except cognito.exceptions.NotAuthorizedException as e:
            # If the Access Token is expired, use the Refresh Token to get new tokens
            if 'Access Token has expired' in str(e):
                if not refresh_token or not username:
                    return {
                        'statusCode': 400,
                        'body': json.dumps('Refresh token and username are required to refresh the access token.')
                    }

                # Calculate the Secret Hash
                secret_hash = calculate_secret_hash(username)

                # Get new tokens using the Refresh Token
                auth_response = cognito.initiate_auth(
                    AuthFlow='REFRESH_TOKEN_AUTH',
                    AuthParameters={
                        'REFRESH_TOKEN': refresh_token,
                        'SECRET_HASH': secret_hash
                    },
                    ClientId=CLIENT_ID
                )

                # Extract the new tokens
                new_access_token = auth_response['AuthenticationResult']['AccessToken']
                new_id_token = auth_response['AuthenticationResult']['IdToken']
                new_refresh_token = auth_response['AuthenticationResult'].get('RefreshToken', refresh_token)  # Use the new Refresh Token if provided, otherwise keep the old one

                # Fetch the user's profile data using the new Access Token
                response = cognito.get_user(
                    AccessToken=new_access_token
                )
                user_attributes = response['UserAttributes']
                user_data = {attr['Name']: attr['Value'] for attr in user_attributes}

                # Return the user's profile data and new tokens
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'user_data': user_data,
                        'tokens': {
                            'access_token': new_access_token,
                            'id_token': new_id_token,
                            'refresh_token': new_refresh_token
                        }
                    })
                }
            else:
                raise e
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': f'Error: {str(e)}'})
        }