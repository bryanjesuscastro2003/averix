import json
import boto3
import time

    
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('WebSocketConnections')

# delete item by connectionId -> bool
def delete_user(connectionId):
    items = table.scan(
        FilterExpression='connectionId = :val',
        ExpressionAttributeValues={':val': connectionId}
    ).get('Items', [])
    item = items[0] if items else None
    if not item:
        return False
    table.delete_item(Key={'id': item["id"]})
    return True

def lambda_handler(event, context):
    try:
        # Extract connection ID from the event
        connection_id = event['requestContext']['connectionId']

        # Remove connection from dynamo db
        if not delete_user(connection_id):
            return {
                'statusCode': 400,
                'body': json.dumps('Connection not found!')
            }

        return {
            'statusCode': 200,
            'body': json.dumps('Disconnected successfully!')
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps('Internal server error!')
        }