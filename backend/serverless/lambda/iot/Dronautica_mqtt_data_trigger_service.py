import json
import boto3

# Lambda service 
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    try:

        # EVENT DATA
        instanceId = event.get('iID', None)
        nameAction = event.get('nA', None)
        stateAction = event.get('sA', None)
        currentLocation = event.get('cLN', None)

        """
            Delivery Data Wrapper
        """ 
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
            raise Exception(f"Error loading instances . {lambda_response["DATA"]["ERROR"]}")

        deliveryItem = lambda_response['DATA']['DELIVERY']
        trackingItem = lambda_response['DATA']['TRACKING']
        trackingLogsItem = lambda_response['DATA']['TRACKINGLOGS']

        print(deliveryItem, trackingItem, trackingLogsItem)

        """
            Update Instance Dstate 
        """

        if nameAction != "AVAILABLE":
            args = {
                "ACTION": "SETDSTATE", 
                "INSTANCE": {
                    "INSTANCEID": instanceId,
                    "DSTATE": nameAction,
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

        """
            Set tracking log current location
        """
        if currentLocation != None:
            currentLocation = {
                "lat": float(currentLocation["lat"]), 
                "lng": float(currentLocation["lng"])
            }

            """
                Notification service 
            """
            body = {
                "action": "NOTIFICATION_DELIVERY_TRACKING_RUNNING",
                "data": {
                    "targetUserId": deliveryItem["primaryUser"],
                    "user": deliveryItem["secondaryUser"],
                    "sessionId": "",
                    "message": None,
                    "lat": str(currentLocation["lat"]),
                    "lng": str(currentLocation["lng"]),
                    "deliveryId": deliveryItem["id"],
                    "mfstate": trackingItem["mfstate"]
                }
            }
            args = {
                "requestContext": {"connectionId": None},
                "body": json.dumps(body)
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_notification_sendMessage',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )

            """
                Update tracking logs current location
            """
            print("cuurent loc ", currentLocation)
            currentLocation = json.dumps(currentLocation)
            args = {
                "ACTION": "UPDATEITEM",
                "DATA": {
                        "TRACKINGLOGSID": trackingLogsItem["id"],
                        "CURRENTLOCATION": currentLocation
                    }
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_dynamodb_deliveryTrackingLogs_actions',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            print(lambda_response)
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error updating current location  . {lambda_response["DATA"]["ERROR"]}")

                
        """
            Instance Actions
        """
        print("prepare to takeoff")
        if nameAction in ["AVAILABLE", 'BUSY_ST_2']:
            print("PREPARE TO TAKE OFF")
            if stateAction == "FALSE":
                pass 
            """
                Prepare to Take off
            """
            payload = {
                "ACTION": "TAKEOFF",
                "VALUE": 0
            }
            args = {
                "DATA": {
                    "INSTANCEID": instanceId,
                    "PAYLOAD": json.dumps(payload)
                } 
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_mqtt_publisher_actions',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            print(lambda_response)
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error loading mqtt message . {lambda_response["VALUE"]["ERROR"]}")
            
    

        elif nameAction == 'TAKEOFF':
            print("PREPARE TO GO TO POINT")
            if stateAction == "FALSE":
                pass 
            """
                Prepare to Point to North
            """
            payload = {
                "ACTION": "POINTINGN",
                "VALUE": 0
            }
            args = {
                "DATA": {
                    "INSTANCEID": instanceId,
                    "PAYLOAD": json.dumps(payload)
                }
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_mqtt_publisher_actions', 
                InvocationType='RequestResponse', 
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error loading mqtt message . {lambda_response["VALUE"]["ERROR"]}")

        elif nameAction == 'POINTINGN' :
            if stateAction == "FALSE":
                pass 
            """
                Prepare to spin
            """
            args = {
                "deliveryItem": deliveryItem,
                "trackingItem": trackingItem,
                "trackingLogsItem": trackingLogsItem,
                "currentLocation": currentLocation, 
                "refresh": False
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_tracking_road',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response_payload = json.loads(lambda_response['Payload'].read())
            if lambda_response_payload['STATE'] != "OK":
                print("Tracking road Lambda function invoked successfully")
            print(lambda_response_payload)
            trackingStatus = lambda_response_payload['DATA']['PAYLOAD']
            targetCoordinate = json.loads(trackingStatus['targetLocation'])
            originCoordinate = json.loads(trackingStatus['originLocation'])
            currentLocation = json.loads(trackingStatus['currentLocation'])

            print(targetCoordinate["lat"], " -> targetCoordinate")
            print(originCoordinate, " -> originCoordinate")
            print(currentLocation["lat"], " -> currentLocation")

            # Bearing function
            args = {
                "currentCoordinate": f"{currentLocation['lat']},{currentLocation['lng']}",
                "targetCoordinate": f"{targetCoordinate["lat"]},{targetCoordinate["lng"]}",
                "originCoordinate": f"{originCoordinate["lat"]},{originCoordinate["lng"]}"
            }
            print(args, " nyt")
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_bearing',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            # Parse the response from the invoked Lambda function
            lambda_response_payload = json.loads(lambda_response['Payload'].read())
            if lambda_response_payload['statusCode'] == 200:
                print("Bearing Lambda function invoked successfully")

            print(lambda_response_payload , " -> lambda_response_payload")
            angleCalculated = lambda_response_payload['body']["turningAngle"]
            distanceAbsCalculated = lambda_response_payload['body']["distanceAbs"]
            distanceRelCalculated = lambda_response_payload['body']["distanceRel"]

            
            # Vefirify relative distance
            if distanceRelCalculated <= 5:
                """
                    Prepare to land
                """
                payload = {
                    "ACTION": "LAND", 
                    "VALUE": 0
                }
                args = {
                    "DATA": {
                        "INSTANCEID": instanceId,
                        "PAYLOAD": json.dumps(payload)
                    }
                }
                lambda_response = lambda_client.invoke(
                    FunctionName='Dronautica_mqtt_publisher_actions',  # Name of the Lambda function to invoke
                    InvocationType='RequestResponse',  # Use 'Event' for async invocation
                    Payload=json.dumps(args)
                )
                lambda_response = json.load(lambda_response['Payload'])
                if lambda_response['STATE'] != "OK":
                    raise Exception(f"Error loading mqtt message . {lambda_response["VALUE"]["ERROR"]}")
                
            else:
            
                print(angleCalculated, " -> angleCalculated")
                print(distanceAbsCalculated, " -> distanceAbsCalculated")
                print(distanceRelCalculated, " -> distanceRelCalculated")
                print("DroneC1 pointingN was successfully ")

                """
                    Prepare to spin
                """
                payload = {
                    "ACTION": "SPINNING", 
                    "VALUE": angleCalculated
                }
                args = {
                    "DATA": {
                        "INSTANCEID": instanceId,
                        "PAYLOAD": json.dumps(payload)
                    }
                }
                lambda_response = lambda_client.invoke(
                    FunctionName='Dronautica_mqtt_publisher_actions',  # Name of the Lambda function to invoke
                    InvocationType='RequestResponse',  # Use 'Event' for async invocation
                    Payload=json.dumps(args)
                )
                lambda_response = json.load(lambda_response['Payload'])
                if lambda_response['STATE'] != "OK":
                    raise Exception(f"Error loading mqtt message . {lambda_response["VALUE"]["ERROR"]}")

        # [SPINNING, MOVINGFORWARD]
        elif nameAction in ['SPINNING', 'MOVINGFORWARD']:
            if stateAction == "FALSE":
                pass
            """
                Prepare to move forward
            """
            print("DroneC1 spinning was successfully ")
            payload = {
                "ACTION": "MOVINGFORWARD",
                "VALUE": 0
            }
            args = {
                "DATA": {
                    "INSTANCEID": instanceId,
                    "PAYLOAD": json.dumps(payload)
                }
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_mqtt_publisher_actions',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error loading mqtt message . {lambda_response["VALUE"]["ERROR"]}")
        
        elif nameAction == 'LAND':
            if stateAction == "FALSE":
                pass

            print("Changing target")
            args = {
                "deliveryItem": deliveryItem,
                "trackingItem": trackingItem,
                "trackingLogsItem": trackingLogsItem,
                "currentLocation": currentLocation, 
                "refresh": True
            }
            lambda_response = lambda_client.invoke(
                FunctionName='Dronautica_tracking_road',  # Name of the Lambda function to invoke
                InvocationType='RequestResponse',  # Use 'Event' for async invocation
                Payload=json.dumps(args)
            )
            lambda_response_payload = json.loads(lambda_response['Payload'].read())
            print(lambda_response_payload)
            if lambda_response_payload['STATE'] != "OK":
                raise Exception(f"Error tracking road . {lambda_response["VALUE"]["ERROR"]}")
            
            if lambda_response_payload["DATA"]["COMPLETED"]:
                # set delivery state to COMPLETED
                # make instance state available again
                print("SET DELIVERY STATE TO COMPLETED")
                args = {
                    "ACTION": "SETDSTATE", 
                    "DATA": {
                        "ITEMID": deliveryItem["id"],
                        "DSTATE": "COMPLETED"
                    }
                }
                lambda_response = lambda_client.invoke(
                    FunctionName='Dronautica_dynamodb_delivery_actions', 
                    InvocationType='RequestResponse',  
                    Payload=json.dumps(args)
                )
                lambda_response = json.load(lambda_response['Payload'])
                print(lambda_response)
                if lambda_response['STATE'] != "OK":
                    raise Exception(f"Error updating delivery state . {lambda_response["DATA"]["ERROR"]}")
                
                print("SET INSTANCE STATE TO AVAILABLE")

                args = {
                    "ACTION": "SETDSTATE", 
                    "INSTANCE": {
                        "INSTANCEID": instanceId,
                        "DSTATE": "AVAILABLE",
                        "REFRESH": True
                    }
                }
                lambda_response = lambda_client.invoke(
                    FunctionName='Dronautica_dynamodb_instance_actions',  # Name of the Lambda function to invoke
                    InvocationType='RequestResponse',  # Use 'Event' for async invocation
                    Payload=json.dumps(args)
                )
                lambda_response = json.load(lambda_response['Payload'])
                if lambda_response['STATE'] != "OK":
                    raise Exception(f"Error loading instances . {lambda_response["VALUE"]["ERROR"]}")

                """
                   Prepare to sleep
                """
                payload = {
                    "ACTION": "SLEEP",
                    "VALUE": 0
                }
                args = {
                    "DATA": {
                        "INSTANCEID": instanceId,
                        "PAYLOAD": json.dumps(payload)
                    }
                }
                lambda_response = lambda_client.invoke(
                    FunctionName='Dronautica_mqtt_publisher_actions',  
                    InvocationType='RequestResponse',  
                    Payload=json.dumps(args)
                )
                lambda_response = json.load(lambda_response['Payload'])
                if lambda_response['STATE'] != "OK":
                    raise Exception(f"Error loading mqtt message . {lambda_response["VALUE"]["ERROR"]}")
                    
            # Take off action
            else:
                """
                   Prepare to takeoff 
                """
                payload = {
                    "ACTION": "TAKEOFF",
                    "VALUE": 0
                }
                args = {
                    "DATA": {
                        "INSTANCEID": instanceId,
                        "PAYLOAD": json.dumps(payload)
                    }
                }
                lambda_response = lambda_client.invoke(
                    FunctionName='Dronautica_mqtt_publisher_actions',  
                    InvocationType='RequestResponse',  
                    Payload=json.dumps(args)
                )
                lambda_response = json.load(lambda_response['Payload'])
                if lambda_response['STATE'] != "OK":
                    raise Exception(f"Error loading mqtt message . {lambda_response["VALUE"]["ERROR"]}")


        # Return a success response
        return {
            'STATE': 'OK',
            'body': json.dumps({
                'message': 'MQTT message processed successfully',
                'topic': topic,
                'client_id': client_id,
                'message_content': message,
                'data': data
            })
        }

    except Exception as e:
        # Log the error
        print("Error processing MQTT message:", str(e))

        # Return an error response
        return {
            'STATE': 'ERROR',
            'body': json.dumps({
                'message': 'Failed to process MQTT message',
                'error': str(e)
            })
        }