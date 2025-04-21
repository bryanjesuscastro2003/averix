import json
import boto3
from boto3.dynamodb.conditions import Key

# Lambda service 
lambda_client = boto3.client('lambda')


def lambda_handler(event, context):
    try:
        
        # EVENT DATA    
        instanceId = event.get('iID', None)
        nameAction = event.get('nA', None)
        stateAction = event.get('sA', None)
        currentLocation = event.get('cLN', None)
        
        activeActions = ["AVAILABLE","TAKEOFF", "LAND", "MOVINGFORWARD", "POINTINGN", "SPINNING", "BUSY_ST_2"]

        """
            Update Dstate 
        """
        args = {
            "ACTION": "SETDSTATE", 
            "INSTANCE": {
                "INSTANCEID": instanceId,
                "DSTATE": "AVAILABLE",
                "REFRESH": False
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
    
        state = lambda_response['VALUE']['DSTATE']

        if state != 0:
            # Call main trigger
            """
                Call main trigger
            """
            #if activeActions[state] != "MOVINGFORWARD":
            #    state = 0
            args = {
                "iID": instanceId,
                "nA": activeActions[0],
                "sA": stateAction,
                "cLN": currentLocation
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_mqtt_data_trigger_service',  
                InvocationType='RequestResponse',  
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error loading instances . {lambda_response["VALUE"]["ERROR"]}")
        
        else: 
            # Current location
            if currentLocation != None:
                currentLocation = {
                    "lat": float(currentLocation["lat"]), 
                    "lng": float(currentLocation["lng"])
                }
                currentLocation = json.dumps(currentLocation)
                """
                    Update Station location 
                """
                args = {
                    "ACTION": "SETSTATIONLOCATION", 
                    "INSTANCE": {
                        "INSTANCEID": instanceId,
                        "STATIONLOCATION": currentLocation
                    } 
                }
                lambda_response = lambda_client.invoke(
                    FunctionName='Dronautica_dynamodb_instance_actions',  
                    InvocationType='RequestResponse',  
                    Payload=json.dumps(args)
                )
                lambda_response = json.load(lambda_response['Payload'])
                print(lambda_response)
                if lambda_response['STATE'] != "OK":
                    raise Exception(f"Error loading instances . {lambda_response["VALUE"]["ERROR"]}")



        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'MQTT message processed successfully',
                'data': event
            })
        
        }
   
    except Exception as e:

        # Return an error response
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Failed to process MQTT message',
                'error': str(e)
            })
        }