import json
import boto3

# Lambda service client
lambda_client = boto3.client('lambda')
# Initialize the IoT Data client
iot_client = boto3.client('iot-data')

def lambda_handler(event, context):
    try:
        instanceId = event["DATA"]['INSTANCEID']
        payload = event["DATA"]['PAYLOAD']

        """
            Get Item Data
        """
        args = {
            "ACTION" : "GETITEMWITHMQTT", 
            "INSTANCE": {
                "INSTANCEID": instanceId
            }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_wrapper_data_instance',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        print(lambda_response)
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error such instance was not found . {lambda_response["VALUE"]["ERROR"]}")


        data = lambda_response["DATA"]
        instance = data["ITEM"]
        mqttData = {
            "SLAVE": data["SLAVE"],
            "MASTER": data["MASTER"]
        }

        slaveTopic = mqttData["SLAVE"]["topicSlave"]
        print(data)
        print(slaveTopic)
        
        response = iot_client.publish(
            topic=slaveTopic,
            qos=1,
            payload=payload
        )

        if response['ResponseMetadata']['HTTPStatusCode'] != 200:
            raise Exception(f"Error publishing to topic {masterTopic}")
        
        return {
            'STATE': 'OK',
            "DATA": {}
        }   

    except Exception as e:
        return {
            'STATE': 'ERROR',
            'DATA': {
                'ERROR': str(e)
            }
        }
