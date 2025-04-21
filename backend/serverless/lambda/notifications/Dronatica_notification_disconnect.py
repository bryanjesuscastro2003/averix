import json
import boto3
from datetime import datetime
#import redis 

"""
redis_client = redis.Redis(
    host="dronautica-notifications-trnocq.serverless.use1.cache.amazonaws.com",
    port=6379,
    decode_responses=True, 
    ssl=True, 
    ssl_ca_certs="credentials/AWS_ca.pem"
)
"""

def lambda_handler(event, context):
    # Extract connection ID from the event
    connection_id = event['requestContext']['connectionId']

    # Remove connection details from Redis
    #redis_client.delete(f"connection:{connection_id}")
    print("disc")
    return {
        'statusCode': 200,
        'body': json.dumps('Disconnected successfully!')
    }