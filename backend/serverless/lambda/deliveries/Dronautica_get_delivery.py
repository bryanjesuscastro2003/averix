import json
import boto3

# Lambda service 
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    try:
        """
        EVENT DATA
        """
        instanceId = event["queryStringParameters"].get("instanceId", None)

        if instanceId is None:
            raise Exception("Instance id is missing")

        args = {
            "DATA": {
                "INSTANCEID": instanceId
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_wrapper_data_delivery',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])

        print(lambda_response)

        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error loading delivery . {lambda_response["DATA"]["ERROR"]}")

        deliveryItem = lambda_response['DATA']['DELIVERY']
        trackingItem = lambda_response['DATA']['TRACKING']
        trackingLogsItem = lambda_response['DATA']['TRACKINGLOGS']

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  
                'Access-Control-Allow-Methods': 'GET, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type',  
                'Content-Type': 'application/json'  
            },
            'body': json.dumps({
                "ok": True,
                "message": "Instance found",
                "error": None,
                "data": {
                    "delivery": deliveryItem,
                    "tracking": trackingItem,
                    "trackingLogs": trackingLogsItem
                } 
            })
        }
 
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                "ok": False,
                "message": f"Error loading instance : {str(e)}",
                "error": str(e),
                "data": None
            })
        }

