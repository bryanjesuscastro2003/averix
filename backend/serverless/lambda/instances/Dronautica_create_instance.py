import json
import boto3
from datetime import datetime
import uuid
import hashlib
from boto3.dynamodb.conditions import Key, Attr
from typing import Dict, Any


# Initialize clients for DynamoDB, IoT, and S3
iot = boto3.client('iot')
s3 = boto3.client('s3')

# Lambda service client
lambda_client = boto3.client('lambda')

# S3 bucket name for storing certificates
CERTIFICATE_BUCKET_NAME = 'dronautica'

# IoT Policy name
IOT_POLICY_NAME = 'DroneInstancePolicy'


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:

    try:

        """
        EVENT DATA
        """
        claims = event['requestContext']['authorizer']['claims']
        user_role = claims.get('custom:role', 'user')
        
        if user_role not in ['admin', 'moderator']:
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Insufficient permissions'})
            }

        body = json.loads(event.get("body", None))

        name = body.get("name", None)
        model = body.get("model", None)
        capacity = body.get("capacity", None)
        description = body.get("description", None)

        if None in (name, model, capacity, description):
            raise Exception("Missing required parameters . [NAME, MODEL, CAPACITY, DESCRIPTION]")

        """
            Create instance
        """
        args = {
             "ACTION": "PUTITEM",
             "INSTANCE": {
                "NAME": name, 
                "MODEL": model,
                "CAPACITY": capacity, 
                "DESCRIPTION": description
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instance_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error creating an instance . {lambda_response["VALUE"]["ERROR"]}")
        instanceId = lambda_response["VALUE"]["INSTANCEID"]

        """
            Set Certificate Service
        """
        args = {
            "ACTION": "PUTITEM",
            "INSTANCE": {
                "INSTANCEID": instanceId, 
                "NAME": name, 
                "MODEL": model,
                "CAPACITY": capacity
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_certificates_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error creating an instance . {lambda_response["VALUE"]["ERROR"]}")
        certifcateId = lambda_response["VALUE"]["CERTIFICATEID"]

        """
            Set Logs Service
        """
        args = {
            "ACTION": "PUTITEM",
            "INSTANCE": {
                "INSTANCEID": instanceId,
                "CAPACITY": capacity, 
                "DESCRIPTION": description
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instanceLogs_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error creating an instance . {lambda_response["VALUE"]["ERROR"]}")
        logsId = lambda_response["VALUE"]["ITEMID"]

        """
            Set Mqtt Service
        """
        args = {
            "ACTION": "PUTITEM",
            "INSTANCE": {
                "INSTANCEID": instanceId
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_mqtt_services',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error creating an instance . {lambda_response["VALUE"]["ERROR"]}")
        slaveId = lambda_response["VALUE"]["SLAVEID"]

        """
            PACKET SERVICES
        """
        args = {
            "ACTION": "PACKAGEITEM",
            "INSTANCE": {
                "INSTANCEID": instanceId,
                "CREDENTIALSID": certifcateId,
                "LOGSSERVICEID": logsId,
                "MQTTSERVICEID": slaveId
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instance_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error packaging the instance . {lambda_response["VALUE"]["ERROR"]}")


        # Return a success response
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',   
                'Access-Control-Allow-Methods': 'POST, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type', 
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                'ok': True,
                'message': 'Instance created succesffully .',
                'error': None,
                'data': {
                    'instanceId': instanceId
                }
            })
        }

    except Exception as e:
        # Return an error response
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',   
                'Access-Control-Allow-Methods': 'POST, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type', 
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                'ok': False,
                'message': 'Failed to create drone, IoT Thing, certificates, or policy',
                'error': str(e),
                'data': None
            })
        }