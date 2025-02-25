import boto3 
import json

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('connections')
    table.delete_item(Key={'connectionId': connection_id})
    return {
        'statusCode': 200,
        'body': json.dumps('Disconnected')
    }