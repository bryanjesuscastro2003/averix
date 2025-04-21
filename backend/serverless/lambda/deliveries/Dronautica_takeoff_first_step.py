import json
import boto3
from datetime import datetime
import uuid
from boto3.dynamodb.conditions import Key
import hashlib

# Lambda service client
lambda_client = boto3.client('lambda')


def lambda_handler(event, context):
    try:
        
        """
            EVENT DATA
        """
        claims = event['requestContext']['authorizer']['claims']
        username = claims.get('email', None)

        body = json.loads(event.get("body", None))

        primaryUser = username

        locationA = body.get("locationA", None)
        capacity = body.get("capacity", None)
        description = body.get("description", "")

        if primaryUser is None or locationA is None or capacity is None:
            raise Exception("Missing data. [Username, Current location, Capacity]")

        if capacity not in ["small", "medium", "large"]:
            raise Exception("Invalid capacity. [small, medium, large]")

        capacity = {
            "small": "DRONAUTICA_SMALL_INSTANCE",
            "medium": "DRONAUTICA_MEDIUM_INSTANCE",
            "large": "DRONAUTICA_LARGE_INSTANCE"
        }[capacity]
        

        locationA = json.dumps(locationA)

        """
            Get instances availables 
        """
        args = {
             "ACTION": "GETITEMSAVAILABLESBYCAPACITY",
             "INSTANCE": {
                "CAPACITY": capacity 
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instance_actions',
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading instances . {lambda_response["VALUE"]["ERROR"]}")
        instances = lambda_response["VALUE"]["INSTANCES"]
        if len(instances) == 0:
            raise Exception("No instances availables. ")
        instance = instances[0]

        """
            Load delivery tracking logs
        """
        args = {"ACTION": "PUTITEM"}
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_deliveryTrackingLogs_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error setting delivery data . {lambda_response["DATA"]["ERROR"]}")
        trackingLogsId = lambda_response["DATA"]["ITEMID"]

        """
            Load delivery tracking data
        """
        args = {
            "ACTION": "PUTITEM",
            "DATA": {"TRACKINGLOGSID": trackingLogsId}
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_deliveryTracking_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error setting delivery data . {lambda_response["VALUE"]["ERROR"]}")
        trackingId = lambda_response["DATA"]["ITEMID"]

        """
            Load delivery data 
        """
        args = {
             "ACTION": "PUTITEM",
             "DATA": {
                "PRIMARYUSER": primaryUser, 
                "DESCRIPTION": description,
                "LOCATIONA": locationA, 
                "LOCATIONZ": instance["stationLocation"], 
                "INSTANCEID": instance["id"],
                "TRACKINGID": trackingId
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_delivery_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error setting delivery data . {lambda_response["DATA"]["ERROR"]}")
        deliveryId = lambda_response["DATA"]["ITEMID"]

        """
            Update Dstate 
        """
        args = {
            "ACTION": "SETDSTATE", 
            "INSTANCE": {
                "INSTANCEID": instance["id"],
                "DSTATE": "BUSY_ST_1",
                "REFRESH": True
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instance_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        print(lambda_response)
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading instances . {lambda_response["VALUE"]["ERROR"]}")


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
                'data': {
                    'deliveryId': deliveryId,
                    'trackingId': trackingId,
                    'trackingLogsId': trackingLogsId
                },
                'error': None,
                'message': 'Delivery created successfully'
            })
        }


    except Exception as e:
        print(e)
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
                'data': None,
                'error': "SERVER ERROR",
                'message': f"{str(e)} , please try again later ."
                })
        }

