import json
import boto3

# Lambda service 
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    try:

        instanceId = event['DATA']['INSTANCEID']
        """
            Get Delivery Data 
        """
        args = {
            "ACTION": "GETITEMBYINSTANCEID", 
            "DATA": {
                "INSTANCEID": instanceId,
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_delivery_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading instances . {lambda_response["DATA"]["ERROR"]}")
        deliveryItem = lambda_response['DATA']['ITEM']

        """
            Get Delivery tracking Data
        """
        args = {
            "ACTION": "GETITEMBYID", 
            "DATA": {
                "TRACKINGID": deliveryItem["trackingId"],
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_deliveryTracking_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading instances . {lambda_response["DATA"]["ERROR"]}")
        trackingItem = lambda_response['DATA']['ITEM']

        """
            Get Delivery tracking logs Data
        """
        args = {
            "ACTION": "GETITEMBYID", 
            "DATA": {
                "TRACKINGLOGSID": trackingItem["trackingLogsId"],
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_deliveryTrackingLogs_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading instances . {lambda_response["DATA"]["ERROR"]}")
        trackingLogsItem = lambda_response['DATA']['ITEM']

        return {
            "STATE": "OK",
            "DATA": {
                "DELIVERY": deliveryItem,
                "TRACKING": trackingItem,
                "TRACKINGLOGS": trackingLogsItem
            }
        }


    except Exception as e:
        return {
            "STATE": "ERROR",
            "DATA": {
                "ERROR": str(e)
            }
        }        
