import json
import boto3
import time

apigw_management = boto3.client('apigatewaymanagementapi', 
    endpoint_url='https://12voeaacae.execute-api.us-east-1.amazonaws.com/development')
    
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('WebSocketConnections')

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
            "deliveryId": ""
        }
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
            "title": f"👋 ¡Bienvenido {data['user']}!",
            "type": "info",
            "instructions": "Sistema de entregas con drones",
            "content": "Estás conectado al sistema de seguimiento.\nRecibirás notificaciones sobre tus entregas.",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }

    elif action == "confirmTrip":
        roomClients = get_user(data["targetUserId"])
        message = {
            "title": "✅ Ubicación confirmada",
            "type": "success",
            "instructions": "Ubicación del cliente verificada",
            "content": "Por favor acepta el viaje para iniciar el proceso de entrega.\n\n• Revisa los detalles de la ubicación\n• Confirma que el área es accesible para drones",
            "link": "https://meet.google.com/landing"
        }

    elif action == "acceptTrip":
        roomClients = get_user(data["targetUserId"])
        message = {
            "title": "🔄 Viaje aceptado",
            "type": "success",
            "instructions": "Preparando tu entrega",
            "content": "El conductor ha aceptado tu solicitud.\n\n• El dron será preparado para el envío\n• Recibirás una notificación cuando esté en camino",
            "link": "https://meet.google.com/landing"
        }



    elif action == "NOTIFICATION_DELIVERY_STARTED":
        roomClientsA = get_user(data["targetUserId"])
        roomClientsB = get_user(data["user"])
        roomClients = roomClientsA + roomClientsB
        message = {
            "title": "🚀 Viaje de entrega iniciado",
            "type": "info",
            "instructions": "Sigue el progreso de tu envío",
            "content": "Tu dron ha despegado con el pedido.\n\n• Recibirás actualizaciones periódicas\n• Prepárate para la llegada",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }

    elif action == "NOTIFICATION_DELIVERY_TRACKING_RUNNING":
        roomClients = get_users_by_delivery_id(data["deliveryId"])
        message = {
            "lat": data["lat"],
            "lng": data["lng"], 
            "mfstate": data["mfstate"],
            "title": "📍 Dron en movimiento",
            "type": "info",
            "instructions": "Posición actual del dron",
            "content": f"El dron está en ruta a {data['mfstate']}",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }

    elif action == "NOTIFICATION_DELIVERY_CLOSE_TO_A":
        roomClients = get_user(data["targetUserId"])
        message = {
            "title": "🚁 Dron en camino para recoger tu pedido",
            "type": "info",
            "instructions": "Prepárese para la recogida",
            "content": f"El dron llegará a tu ubicación de recogida en: {data['leftTime']} minutos.\n\n• Por favor ten el paquete listo\n• Asegúrate que el área de recogida esté despejada",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }

    elif action == "NOTIFICATION_DELIVERY_CLOSE_TO_B":
        roomClients = get_user(data["targetUserId"])
        message = {
            "title": "📦 Dron acercándose con tu pedido",
            "type": "info",
            "instructions": "Prepárese para la entrega",
            "content": f"Tu pedido llegará en aproximadamente: {data['leftTime']} minutos.\n\n• Mantén el área de entrega despejada\n• Retira cualquier obstáculo potencial",
            "link": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
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




