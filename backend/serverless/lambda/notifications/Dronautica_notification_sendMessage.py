import json
import boto3
import time

apigw_management = boto3.client('apigatewaymanagementapi', 
    endpoint_url='https://12voeaacae.execute-api.us-east-1.amazonaws.com/development')
    
dynamodb = boto3.resource('dynamodb')
lambda_client = boto3.client('lambda')
table = dynamodb.Table('WebSocketConnections')

# delete item by connectionId -> bool
def delete_user(connectionId):
    items = table.scan(
        FilterExpression='connectionId = :val',
        ExpressionAttributeValues={':val': connectionId}
    ).get('Items', [])
    item = items[0] if items else None
    if not item:
        return False
    table.delete_item(Key={'id': item["id"]})
    return True

def get_user(username) -> list:
    response = table.scan(
        FilterExpression='username = :val1',
        ExpressionAttributeValues={':val1': username}
    )
    return [item['connectionId'] for item in response.get('Items', [])]

def put_user(username, sessionId, connectionId):
    table.put_item(
        Item={
            'id': sessionId,
            'username': username,
            'sessionId': sessionId, 
            'connectionId': connectionId,
            'timestamp': int(time.time()),
            "deliveryId": "",
            "instanceId": ""
        }
    )
    return True

def update_instanceId_by_deliveryId(deliveryId, instanceId):
    items = table.scan(
        FilterExpression='deliveryId = :val',
        ExpressionAttributeValues={':val': deliveryId}
    ).get('Items', [])
    item = items[0] if items else None
    if not item:
        return False
    table.update_item(
        Key={'id': item["id"]},
        UpdateExpression='SET instanceId = :val',
        ExpressionAttributeValues={':val': instanceId}
    )
    return True

def update_instanceId_by_username(username, instanceId):
    items = table.scan(
        FilterExpression='username = :val',
        ExpressionAttributeValues={':val': username}
    ).get('Items', [])
    item = items[0] if items else None
    if not item:
        return False
    table.update_item(
        Key={'id': item["id"]},
        UpdateExpression='SET instanceId = :val',
        ExpressionAttributeValues={':val': instanceId}
    )
    return True

def get_item(username, sessionId):
    response = table.scan(
        FilterExpression='username = :val1 AND sessionId = :val2',
        ExpressionAttributeValues={':val1': username, ':val2': sessionId}
    )
    items = response.get('Items', [])
    if len(items) > 0:
        return items[0]
    return None

# start tracking db process -> set the deliveryId by username 
def start_tracking(username, deliveryId, sessionId):
    item = get_item(username, sessionId)
    if not item:
        return False
    table.update_item(
        Key={"id": item["id"]}, 
        UpdateExpression='SET deliveryId = :val',
        ExpressionAttributeValues={':val': deliveryId}
    )
    return True

# finish tracking db process -> set the deliveryId to None by username
def finish_tracking(username, sessionId):
    item = get_item(username, sessionId)
    if not item:
        return False
    table.update_item(
        Key={"id": item["id"]}, 
        UpdateExpression='SET deliveryId = :val',
        ExpressionAttributeValues={':val': ""}
    )
    return True

def finish_tracking_by_connectionId(connectionId):
    items = table.scan(
        FilterExpression='connectionId = :val',
        ExpressionAttributeValues={':val': connectionId}
    ).get('Items', [])
    item = items[0] if items else None
    if not item:
        return False
    table.update_item(
        Key={'id': item["id"]},
        UpdateExpression='SET deliveryId = :val',
        ExpressionAttributeValues={':val': ""}
    )
    return True

# Get users by deliveryId -> [connectionId]
def get_users_by_delivery_id(deliveryId):
    response = table.scan(
        FilterExpression='deliveryId = :val',
        ExpressionAttributeValues={':val': deliveryId}
    )
    return [item['connectionId'] for item in response.get('Items', [])]

def resetUsers():
    # Scan and delete all items (use with caution!)
    scan = table.scan()
    with table.batch_writer() as batch:
        for item in scan['Items']:
            batch.delete_item(Key={'username': item['username']})
    return {
        'status': 'success',
        'message': 'All users have been cleared'
    }

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']
    body = json.loads(event['body'])
    action = body.get('action')
    data = body.get('data') # {targetUserId: string, user: string, sessionId: string, message: string, lat: string, lng: string, deliveryId: string, mfstate: string}

    isRoomNotification = "NOTIFICATION" in action
    roomClients = []

    # Update the clientId by a new connection or refresh
    if data["user"] != "" and data["sessionId"] != "" and not isRoomNotification:
        statusUpdate = put_user(data["user"], data["sessionId"], connection_id)
        if not statusUpdate:
            return {
                'statusCode': 500,
                'body': json.dumps('Error updating user!')
            }

    """ 
        NOTIFICATIONS TO THE CLIENTS
    """
    if action == "refresh":
        message = None

    elif action == "trackingStart":
        start_tracking(data["user"], data["deliveryId"], data["sessionId"])

    elif action == "trackingFinish":
        finish_tracking(data["user"], data["sessionId"])
    
    elif action == "imhere":
        finish_tracking(data["user"], data["sessionId"])
        roomClients = [connection_id] #get_user(data["user"])
        message = {
            "cd": "A",
            "title": f"👋 ¡Bienvenido {data['user']}!",
            "type": "info",
            "instructions": "Sistema de entregas con drones",
            "content": "Estás conectado al sistema de seguimiento.\nRecibirás notificaciones sobre tus entregas.",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "coordinates":{
                "lat": "0",
                "lng": "0", 
            },
            "mfstate": None,
            "instanceId": ""
        }

    elif action == "confirmTrip":
        roomClients = get_user(data["targetUserId"])
        message = {
            "cd": "B",
            "title": "✅ Ubicación confirmada",
            "type": "success",
            "instructions": "Ubicación del cliente verificada",
            "content": "Por favor acepta el viaje para iniciar el proceso de entrega.\n\n• Revisa los detalles de la ubicación\n• Confirma que el área es accesible para drones",
            "deliveryId": data["deliveryId"],
            "link": "https://meet.google.com/landing",
            "coordinates":{
                "lat": "0",
                "lng": "0", 
            },
            "mfstate": None,
            "instanceId": ""
        }

    elif action == "acceptTrip":
        roomClientsA = get_user(data["targetUserId"]) #+ get_user(data["user"])
        roomClientsB = get_user(data["user"])
        roomClients = roomClientsA + roomClientsB
        print("To confirm trip", data["user"], data["targetUserId"], roomClients)
        message = {
            "cd": "C",
            "title": "🔄 Viaje aceptado",
            "type": "success",
            "instructions": "Preparando tu entrega.",
            "content": "El sistema ha aceptado tu solicitud.\n\n• El dron será preparado para el envío\n• Recibirás una notificación cuando esté en camino",
            "link": "https://meet.google.com/landing",
            "deliveryId": data["deliveryId"],
            "coordinates":{
                "lat": "0",
                "lng": "0", 
            },
            "mfstate": None,
            "instanceId": ""
        }

    elif action == "cancelTrip":
        roomClients = get_user(data["targetUserId"])
        message = {
            "cd": "X",
            "title": "🔄 Viaje cancelado",
            "type": "info",
            "instructions": "Viaje cancelado",
            "content": "El sistema ha cancelado tu solicitud.",
            "link": "https://meet.google.com/landing",
            "coordinates":{
                "lat": "0",
                "lng": "0", 
            },
            "mfstate": None,
            "instanceId": ""
        }

    elif action == "NOTIFICATION_DELIVERY_STARTED":
        roomClientsA = get_user(data["targetUserId"])
        roomClientsB = get_user(data["user"])
        roomClients = roomClientsA + roomClientsB
        message = {
            "cd": "D",
            "title": "🚀 Viaje de entrega iniciado",
            "type": "info",
            "instructions": "Sigue el progreso de tu envío",
            "content": "Tu dron ha despegado con el pedido.\n\n• Recibirás actualizaciones periódicas\n• Prepárate para la llegada",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "coordinates":{
                "lat": "0",
                "lng": "0", 
            },
            "mfstate": None,
            "instanceId": ""
        }

    elif action == "NOTIFICATION_DELIVERY_TRACKING_RUNNING":
        roomClients = get_users_by_delivery_id(data["deliveryId"])
        message = {
            "cd": "E",
            "coordinates": {
                "lat": data["lat"],
                "lng": data["lng"]}, 
            "mfstate": data["mfstate"],
            "title": "📍 Dron en movimiento",
            "type": "info",
            "instructions": "Posición actual del dron",
            "content": f"El dron está en camino.",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "mfstate": None,
            "instanceId": ""
        }
    
    elif action == "NOTIFICATION_DELIVERY_ARRIVED":
        roomClients = get_user(data["targetUserId"])
        message = {
            "cd": "F",
            "title": "Hemos llegado !!!!",
            "type": "info",
            "instructions": "El dron ha llegado",
            "content": "El dron ha llegado a tu locacion.",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "coordinates":{
                "lat": data["lat"],
                "lng": data["lng"], 
            },
            "mfstate": data["mfstate"],
            "instanceId": ""
        }
    
    elif action == "NOTIFICATION_DELIVERY_ARRIVED_ST1":
        roomClients = get_user(data["targetUserId"])
        #update_instanceId_by_username(data["targetUserId"], data["instanceId"])
        message = {
            "cd": "G",
            "title": "Puedes ver el dron sobre ti?",
            "code": "AX",
            "type": "info",
            "instructions": "El dron esta sobre ti .",
            "content": "Sal y busca el dron , confirma si lo puedes ver. ",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "coordinates":{
                "lat": data["lat"],
                "lng": data["lng"], 
            },
            "deliveryId": data["deliveryId"],
            "mfstate": data["mfstate"],
            "instanceId": data["instanceId"]
        }
    
    elif action == "NOTIFICATION_DELIVERY_ARRIVED_ST2":
        roomClients = get_user(data["targetUserId"])
        #update_instanceId_by_username(data["targetUserId"], data["instanceId"])
        mfstate = data["mfstate"]
        isData = True

        if mfstate == "ZA":
            title = "La carga esta lista ?"
            instructions = "Ponga con cuidado su producto en la compuerta y confirme cuando este listo ."
            content = "El dron esta cargando el producto ."
        elif mfstate == "AB":
            title = "La entrega esta lista ?"
            instructions = "Retire con cuidado su producto y confirme cuando este listo."
            content = "El dron esta entregando el producto ."
        else:
            isData = False
        
        if isData:
            message = {
                "cd": "H",
                "title": title,
                "code": "AX",
                "type": "info",
                "instructions": instructions,
                "content": content,
                "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "coordinates":{
                    "lat": data["lat"],
                    "lng": data["lng"],
                },
                "mfstate": mfstate,
                "instanceId": data["instanceId"],
                "deliveryId": data["deliveryId"]
            }
        else:
            message = None
    
    elif action == "NOTIFICATION_DELIVERY_DONE_A":
        roomClients = get_user(data["targetUserId"])
        message = {
            "cd": "K",
            "title": "Se acaba de recoger tu producto !!!",
            "type": "info",
            "instructions": "Carga exitosa.",
            "content": "El dron acaba de recoger tu producto.",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "coordinates":{
                "lat": data["lat"],
                "lng": data["lng"],
            },
            "mfstate": data["mfstate"],
            "instanceId": ""
        }
    
    elif action == "NOTIFICATION_DELIVERY_DONE_B":
        roomClients = get_user(data["targetUserId"])
        message = {
            "cd": "L",
            "title": "Se acaba de entregar el producto !!!",
            "type": "info",
            "instructions": "Entrega exitosa.",
            "content": "El dron acaba de entregar el producto.",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "coordinates":{
                "lat": data["lat"],
                "lng": data["lng"],
            },
            "mfstate": data["mfstate"],
            "instanceId": ""
        }
    
    elif action == "NOTIFICATION_DELIVERY_DONE_Z":
        roomClients = get_user(data["targetUserId"]) + get_user(data["user"])
        message = {
            "cd": "M",
            "title": "Viaje finalizado. ",
            "type": "info",
            "instructions": "Gracias por su confianza",
            "content": "AVIREN.",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "coordinates":{
                "lat": data["lat"],
                "lng": data["lng"],
            },
            "mfstate": data["mfstate"],
            "instanceId": ""
        }
    
    elif action == "confirm_arrived_st1":
        """
            Call main trigger
        """

        print("YA VEO EL DRON", data)
        args = {
            "iID": data["instanceId"],
            "nA": "DOLANDST2",
            "sA": "TRUE",
            "cLN": None
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_temp',  
            InvocationType='RequestResponse',  
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])
        message = None


    elif action == "confirm_arrived_st2":
        """
            Call main trigger
        """
        print(" arr 2", data)
        args = {
            "iID": data["instanceId"],
            "nA": "LANDST3",
            "sA": "TRUE",
            "cLN": None
        }
        lambda_response = lambda_client.invoke(
            FunctionName='Dronautica_temp',  
            InvocationType='RequestResponse',  
            Payload=json.dumps(args)
        )
        lambda_response = json.load(lambda_response['Payload'])



    elif action == "NOTIFICATION_DELIVERY_LEFT_TIME":
        #roomClients = get_users_by_delivery_id(data["deliveryId"])
        roomClients = get_user(data["targetUserId"]) + get_user(data["user"])
        mfstate = data["mfstate"]
        leftTime = data["leftTime"]

        if mfstate == "ZA":
            message = {
                "cd": "I",
                "title": "ESTAMOS EN CAMINO !!!",
                "type": "info",
                "instructions": "Recogiendo el producto",
                "content": f"El dron llegará a la ubicación de recogida en: {leftTime} minutos.",
                "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "coordinates": {
                    "lat": data["lat"],
                    "lng": data["lng"],
                },
                "mfstate": mfstate
            }

        elif mfstate == "AB":
            message = {
                "cd": "I",
                "title": "ESTAMOS EN CAMINO !!!",
                "type": "info",
                "instructions": "Entregando el producto",
                "content": f"El dron llegará a la ubicación de entrega en: {leftTime} minutos",
                "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "coordinates": {
                    "lat": data["lat"],
                    "lng": data["lng"],
                },
                "mfstate": mfstate
            }
        else:
            message = None


    elif action == "NOTIFICATION_DELIVERY_CLOSE":
        roomClients = get_user(data["targetUserId"])
        message = {
            "cd": "J",
            "title": "🚁 Dron en camino para recoger tu pedido",
            "type": "info",
            "instructions": "Prepárese para la recogida",
            "content": f"El dron llegará a tu ubicación de recogida en: {data['leftTime']} minutos.\n\n• Por favor ten el paquete listo\n• Asegúrate que el área de recogida esté despejada",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "coordinates": {
                    "lat": data["lat"],
                    "lng": data["lng"],
                },
            "mfstate": None
        }


    else:
        message = None

    try:
        if message is not None:
            print(" im here bro", roomClients)
            print("the message is ; ", message)
            for client in roomClients:
                try:
                    apigw_management.post_to_connection(
                        ConnectionId=client,
                        Data=json.dumps(message)
                    )
                except Exception as e:
                    if "GoneException" in str(e):
                        print(f"Client {client} is no longer connected. Removing from room.")
                        finish_tracking_by_connectionId(client)

        return {
            'statusCode': 200,
            'body': json.dumps('Connected successfully! Welcome message sent.')
        }
    except Exception as e:
        print(f"Error sending welcome message: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error sending welcome message!')
        }




