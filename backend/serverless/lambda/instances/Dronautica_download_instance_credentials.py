import boto3
import os
import json
from urllib.parse import urlparse
import base64

def lambda_handler(event, context):
    try:
        # CORS and download headers
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment',
            'X-Filename': ''
        }
        
        # Check permissions
        claims = event['requestContext']['authorizer']['claims']
        user_role = claims.get('custom:role', 'user')
        
        if user_role not in ['admin', 'moderator']:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Insufficient permissions'})
            }

        s3 = boto3.client('s3')
        body = json.loads(event.get("body", "{}"))
        s3_path = body.get('s3Path', '')
        
        if not s3_path:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No S3 path provided'})
            }
    
        parsed = urlparse(s3_path)
        bucket_name = parsed.netloc
        key = parsed.path.lstrip('/')
        filename = os.path.basename(key)
        
        # Get the file from S3
        response = s3.get_object(Bucket=bucket_name, Key=key)
        file_content = response['Body'].read()
        
        # Update headers with filename
        headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        headers['X-Filename'] = filename  # Custom header as fallback
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': base64.b64encode(file_content).decode('utf-8'),
            'isBase64Encoded': True
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }