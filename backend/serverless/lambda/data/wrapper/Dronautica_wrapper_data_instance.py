import json
import boto3

# Lambda service client
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    try:
        action = event['ACTION']
        instanceId = event['INSTANCE']['INSTANCEID']

        if action not in ["GETITEMWITHMQTT", "GETITEMWITHCRED", "GETITEMWITHLOGS", "FULL", "PARTIAL"]:
            raise Exception("Invalid Action") 
        
        """
            Get Item Data
        """
        args = {
            "ACTION" : "GETITEMBYID", 
            "INSTANCE": {
                "INSTANCEID": instanceId
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_instance_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        print(" res", lambda_response, instanceId, action)
        if lambda_response['STATE'] != "OK":
            raise Exception("Error such instance was not found .")
        item = lambda_response['VALUE']['INSTANCE']

        if action == "GETITEMWITHMQTT":
            """
                Get mqtt data
            """
            args = {
                "ACTION" : "GETITEMBYID", 
                "INSTANCE": {
                    "SLAVEID": item['mqttServiceId']
                }
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_dynamodb_mqtt_services',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error such instance was not found . {lambda_response["VALUE"]["ERROR"]}")
            master = lambda_response['VALUE']['MASTER']
            slave = lambda_response['VALUE']['SLAVE']
            return {
                "STATE": "OK", 
                "DATA": {
                    "MASTER": master,
                    "SLAVE": slave,
                    "ITEM": item
                }
            }
        
        elif action == "PARTIAL":
            return {
                "STATE": "OK",
                "DATA": {
                    "ITEM": item
                }
            } 
        
        elif action == "FULL":
            """
                Get mqtt data
            """
            args = {
                "ACTION" : "GETITEMBYID", 
                "INSTANCE": {
                    "SLAVEID": item['mqttServiceId']
                }
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_dynamodb_mqtt_services',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error such instance was not found . {lambda_response["VALUE"]["ERROR"]}")
            master = lambda_response['VALUE']['MASTER']
            slave = lambda_response['VALUE']['SLAVE']

            """
                Get credentials data
            """
            args = {
                "ACTION" : "GETITEMBYID", 
                "INSTANCE": {
                    "CERTIFICATEID": item['credentialsId']
                }
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_dynamodb_certificates_actions',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error such instance was not found . {lambda_response["VALUE"]["ERROR"]}")
            certItem = lambda_response['VALUE']['ITEM']

            """
                Get logs data
            """
            args = {
                "ACTION" : "GETITEMBYID", 
                "INSTANCE": {
                    "LOGSID": item['logsServiceId']
                }
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_dynamodb_instanceLogs_actions',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error such instance was not found . {lambda_response["VALUE"]["ERROR"]}")
            
            logsItem = lambda_response['VALUE']['ITEM']

            return {
                "STATE": "OK",
                "DATA": {
                    "MASTER": master,
                    "SLAVE": slave,
                    "ITEM": item,
                    "CERTITEM": certItem,
                    "LOGSITEM": logsItem
                }
            }


    except Exception as e:
        return {
            "STATE": "ERROR", 
            "DATA": {
                "ERROR": str(e)
            }
        }