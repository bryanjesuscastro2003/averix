import json
import boto3
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.conditions import Attr
from datetime import datetime

#DynamoDB service
dynamodb = boto3.resource('dynamodb')
DRONE_TABLE_DELIVERY_TRACKING = 'Dronautica_data_delivery_tracking'
DRONE_TABLE_DELIVERY = 'Dronautica_data_delivery'

current_time = datetime.utcnow().isoformat()


def getMfAction(mfState, deliveryItem):
        print(mfState, " -> state mf")
        payload = {}
        if(mfState == 'ZA'):
            updateExpression = "SET mfZA_endAt = :mfZA_endAt, mfState = :mfState, mfAB_startAt = :mfAB_startAt"
            expressionAttributeValues = {
                ":mfAB_startAt": current_time,
                ":mfZA_endAt": current_time,
                ":mfState": "AB"
            }
            payload["mfState"] = "ZA"
            payload["targetLocation"] = deliveryItem["locationA"]
            payload["originLocation"] = deliveryItem["locationZ"]
        # AB
        elif(mfState == 'AB'):
            updateExpression = "SET mfAB_endAt = :mfAB_endAt, mfState = :mfState, mfBZ_startAt = :mfBZ_startAt"
            expressionAttributeValues = {
                ":mfBZ_startAt": current_time,
                ":mfAB_endAt": current_time,
                ":mfState": "BZ"
            }
            payload["mfState"] = "AB"
            payload["targetLocation"] = deliveryItem["locationB"]
            payload["originLocation"] = deliveryItem["locationA"]
        # BZ
        elif(mfState == 'BZ'):
            updateExpression = "SET mfBZ_endAt = :mfBZ_endAt, mfState = :mfState"
            expressionAttributeValues = {
                ":mfBZ_endAt": current_time,
                ":mfState": "END"
            }
            payload["mfState"] = "BZ"
            payload["targetLocation"] = deliveryItem["locationZ"]
            payload["originLocation"] = deliveryItem["locationB"]
        return {
            "updateExpression": updateExpression,
            "expressionAttributeValues": expressionAttributeValues,
            "payload": payload
        }

def lambda_handler(event, context):
        try:
            deliveryId = event.get("deliveryId")
            user = event.get("user")
            currentLocation = event.get("currentLocation")
            refresh = event.get("refresh")
            print(deliveryId, user, currentLocation, "-> cureenn")
            deliveryItem = None 
            try:
                deliveryItem = dynamodb.Table(DRONE_TABLE_DELIVERY).update_item(
                    Key={
                        'id': deliveryId,
                        'user': user
                    },
                    ConditionExpression=Attr('dstate').eq('INPROGRESS'),
                    UpdateExpression="SET dstate = :dstate, updatedAt = :updatedAt",
                    ExpressionAttributeValues={
                        ':dstate': 'INPROGRESS', 
                        ':updatedAt': current_time
                    }, 
                    ReturnValues="ALL_NEW" 
                )
                deliveryItem = deliveryItem['Attributes']
            except Exception as e:
                deliveryItem = dynamodb.Table(DRONE_TABLE_DELIVERY).scan(
                    FilterExpression=Key('id').eq(deliveryId) & Key('user').eq(user)
                )
                deliveryItem = deliveryItem['Items'][0]
            deliveryTrackingItem = dynamodb.Table(DRONE_TABLE_DELIVERY_TRACKING).scan(
                FilterExpression=Key('deliveryId').eq(deliveryId) & Key('dstate').eq('STARTED')
            )
            deliveryTrackingItem = deliveryTrackingItem['Items'][0]
            updateExpression = "SET oldLocation = :oldLocation, currentLocation = :currentLocation"
            expressionAttributeValues = {
                ':currentLocation': json.dumps(currentLocation),
                ':oldLocation': deliveryTrackingItem["currentLocation"]
            }
            deliveryTrackingItem = dynamodb.Table(DRONE_TABLE_DELIVERY_TRACKING).update_item(
                    Key={
                        'id': deliveryTrackingItem['id'],
                        'deliveryId': deliveryId
                    },
                    UpdateExpression=updateExpression,
                    ExpressionAttributeValues=expressionAttributeValues, 
                    ReturnValues="ALL_NEW" 
                )
            deliveryTrackingItem = deliveryTrackingItem['Attributes']
            print("before mf")
            mfPayload = getMfAction(deliveryTrackingItem["mfState"], deliveryItem)
            print(mfPayload)
            updateExpression = mfPayload["updateExpression"]
            expressionAttributeValues = mfPayload["expressionAttributeValues"]
            payload = mfPayload["payload"]
            print(payload, "-> payload ")
            payload["currentLocation"] = currentLocation
            if refresh:
                deliveryTrackingItem = dynamodb.Table(DRONE_TABLE_DELIVERY_TRACKING).update_item(
                    Key={
                        'id': deliveryTrackingItem['id'],
                        'deliveryId': deliveryId
                    },
                    UpdateExpression=updateExpression,
                    ExpressionAttributeValues=expressionAttributeValues, 
                    ReturnValues="ALL_NEW" 
                )
                deliveryTrackingItem = deliveryTrackingItem['Attributes']
                payload = getMfAction(deliveryTrackingItem["mfState"])["payload"]


            print(payload , "final")
            return {
                'statusCode': 200,
                'body': payload
            }
        except Exception as e:
            print(e)
            return {
                'statusCode': 500,
                'body': json.dumps('Error!')
            }