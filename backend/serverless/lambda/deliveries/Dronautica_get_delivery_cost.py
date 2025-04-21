import json
import boto3


# Lambda service 
lambda_client = boto3.client('lambda')




def lambda_handler(event, context):
    try:
        """
            EVENT DATA
        """ 
        #claims = event['requestContext']['authorizer']['claims']
        #username = claims.get('email', None)
        #deliveryId = event["queryStringParameters"].get("deliveryId", None)

        username = "jesusbryan15@gmail.com"
        deliveryId = "62cd"

        if deliveryId is None:
            raise Exception("Missing deliveryId parameter")
        
        """
            Verify primary user 
        """
        args = {
             "ACTION": "VERIFYUSER",
             "DATA": {
                "DELIVERYID": deliveryId,
                "VALUE": username,
                "ISPRIMARYUSER": True
             }
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_dynamodb_delivery_actions',  # Name of the Lambda function to invoke
            InvocationType='RequestResponse',  # Use 'Event' for async invocation
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        print(lambda_response, "..." )
        if lambda_response['STATE'] != "OK":
            raise Exception(f"Error setting delivery data . {lambda_response["DATA"]["ERROR"]}")
        response = lambda_response["DATA"]["VALUE"]
        if not response:
            raise Exception("No tienes permisos sobre este item") 



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
                "message": "Costo de entrega obtenido correctamente",
                "error": None,
                "data":{
                    "totalDistance": totalDistance, 
                    "totalCost": totalCost
                }
            })
        
        }

    except Exception as e:
        print(e)
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
                "message": f"Error inesperado obteniendo el costo, {str(e)}",
                "error": "SERVER ERROR",
                "data": None
            })
        
        }