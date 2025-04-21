import json
import boto3
from datetime import datetime
import redis 


def lambda_handler(event, context):
    # Extract connection ID and user ID from the event
    connection_id = event['requestContext']['connectionId']
    user_id = event.get('queryStringParameters', {}).get('userId', 'anonymous')

    # Store connection details in Redis
    """redis_client.hset(
        f"connection:{connection_id}",
        mapping={
            'userId': user_id,
            'timestamp': datetime.utcnow().isoformat()
        }
    )"""
    print("onnection_id", connection_id)
    print("user_id", user_id)
    return {
        'statusCode': 200,
        'body': json.dumps('Connected successfully! ')
    }



