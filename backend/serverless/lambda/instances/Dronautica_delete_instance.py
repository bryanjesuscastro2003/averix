import json
import boto3

# Initialize clients for DynamoDB, IoT, and S3
dynamodb = boto3.resource('dynamodb')
iot = boto3.client('iot')
s3 = boto3.client('s3')

# DynamoDB table name
DRONE_TABLE_NAME = 'Dronautica_instances'

# S3 bucket name for storing certificates
CERTIFICATE_BUCKET_NAME = 'dronautica'

def lambda_handler(event, context):
    try:
        # Parse the drone ID from the event
        drone_id = "c2961bdf-4dd9-42bf-9371-b0c5f5b1be72"#event.get('pathParameters', {}).get('drone_id')
        capacity = "DRONAUTICA_SMALL_INSTANCE"#event.get('pathParameters', {}).get('capacity')

        if not drone_id:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'message': 'Drone ID is required'
                })
            }

        # Get the drone item from DynamoDB
        table = dynamodb.Table(DRONE_TABLE_NAME)
        response = table.get_item(Key={'id': drone_id, 'capacity': capacity})
        print(response)

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({
                    'message': 'Drone not found'
                })
            }

        drone_item = response['Item']

        # Get the Thing name from the drone item
        thing_name = f"Drone-{drone_id}"

        # Get the certificates attached to the Thing
        principals_response = iot.list_thing_principals(thingName=thing_name)
        certificates = principals_response.get('principals', [])

        # Detach and delete certificates
        for cert_arn in certificates:
            # Detach the certificate from the Thing
            iot.detach_thing_principal(
                thingName=thing_name,
                principal=cert_arn
            )

            # Deactivate the certificate
            iot.update_certificate(
                certificateId=cert_arn.split('/')[-1],
                newStatus='INACTIVE'
            )

            # Delete the certificate
            iot.delete_certificate(
                certificateId=cert_arn.split('/')[-1],
                forceDelete=True
            )

        # Delete the IoT Thing
        iot.delete_thing(thingName=thing_name)

        # Delete the certificate files from S3
        s3_prefix = f"certificates/{thing_name}/"
        s3_objects = s3.list_objects_v2(
            Bucket=CERTIFICATE_BUCKET_NAME,
            Prefix=s3_prefix
        ).get('Contents', [])

        for obj in s3_objects:
            s3.delete_object(
                Bucket=CERTIFICATE_BUCKET_NAME,
                Key=obj['Key']
            )

        # Delete the drone item from DynamoDB
        table.delete_item(Key={'id': drone_id, 'capacity': capacity})

        # Return a success response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Drone, IoT Thing, certificates, and S3 files deleted successfully',
                'drone_id': drone_id
            })
        }

    except Exception as e:
        # Return an error response
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Failed to delete drone, IoT Thing, certificates, or S3 files',
                'error': str(e)
            })
        }