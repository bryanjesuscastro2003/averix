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

        print("VAMOS A EHTRAR ", instanceId, nameAction, stateAction, currentLocation)

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
                FunctionName='Dronautica_dynamodb_instance_actions', 
                InvocationType='RequestResponse',  
                Payload=json.dumps(args)
            )
            lambda_response = json.load(lambda_response['Payload'])
            print(lambda_response)
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error loading instances . {lambda_response["VALUE"]["ERROR"]}")

        """
            Set tracking log current location
        """
        trackingLocation = None
        if currentLocation != None:
            currentLocation = {
                "lat": float(currentLocation["lat"]), 
                "lng": float(currentLocation["lng"])
            }
            trackingLocation = currentLocation

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
            if lambda_response['STATE'] != "OK":
                raise Exception(f"Error updating current location  .")
            
            """
                Notification service 
            """
            # IF NAME ACTION IS TRACKING
            if nameAction == "TRACKING":
                body = {
                    "action": "NOTIFICATION_DELIVERY_TRACKING_RUNNING",
                    "data": {
                        "targetUserId": deliveryItem["primaryUser"],
                        "user": deliveryItem["secondaryUser"],
                        "sessionId": "",
                        "message": None,
                        "lat": str(trackingLocation["lat"]),
                        "lng": str(trackingLocation["lng"]),
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

                return {
                    'statusCode': 200,
                    'body': json.dumps({})
                }

        else:
            print("NO hay location default ")
            print("este mehoir", trackingLogsItem["currentLocation"])
            trackingLocation = json.loads(trackingLogsItem["currentLocation"])
            print("nuevo: ", trackingLocation)
            trackingLocation = {
                "lat": float(trackingLocation["lat"]),
                "lng": float(trackingLocation["lng"])
            }
                
        """
            Instance Actions
        """
        print("prepare to takeoff bryan ", instanceId, nameAction, stateAction)
  
        if nameAction in ["AVAILABLE", "BUSY_ST_2"]:
            if stateAction == "FALSE":
                pass 
            """
                Prepare to Start
            """
            payload = {
                "ACTION": "STARTUP",
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

        elif nameAction in ["STARTUP", "GETMFST"]:
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
        
        elif nameAction == "GETDAT":
            if stateAction == "FALSE":
                pass 
            """
                Prepare to send location A
            """
            payload = {
                "ACTION": "GETDAT1",
                "VALUE": deliveryItem["locationA"]
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
                raise Exception("Error loading mqtt message .")

        elif nameAction == "GETDAT1":
            if stateAction == "FALSE":
                pass 
            """
                Prepare to send location A
            """
            payload = {
                "ACTION": "GETDAT2",
                "VALUE": deliveryItem["locationB"]
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
                raise Exception("Error loading mqtt message .")

        elif nameAction == "GETDAT2":
            if stateAction == "FALSE":
                pass 
            """
                Prepare to send location A
            """
            payload = {
                "ACTION": "GETMFST",
                "VALUE": trackingItem["mfstate"]
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
                raise Exception("Error loading mqtt message .")

            
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


                if trackingItem["mfstate"] == "BZ":
                    payload = {
                        "ACTION": "DOLANDST3", 
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
                        raise Exception(f"Error loading mqtt message .")
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps({})
                    }


                """
                    Prepare to land stage 1
                """
                payload = {
                    "ACTION": "LANDST1", 
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
                    raise Exception(f"Error loading mqtt message .")

                """
                    Notification service
                """
                targetUser = None
                if trackingItem["mfstate"] == "ZA":
                    targetUser = deliveryItem["primaryUser"]
                elif trackingItem["mfstate"] == "AB":
                    targetUser = deliveryItem["secondaryUser"]

                body = {
                    "action": "NOTIFICATION_DELIVERY_ARRIVED",
                    "data": {
                        "targetUserId": targetUser,
                        "user": None,
                        "sessionId": "",
                        "message": None,
                        "deliveryId": deliveryItem["id"],
                        "mfstate": trackingItem["mfstate"],
                        "leftTime": 0,
                        "lat": str(trackingLocation["lat"]),
                        "lng": str(trackingLocation["lng"]),
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
                    raise Exception(f"Error loading mqtt message .")
                
                """
                    Notification service 
                """
                # Calculate the left time to arrive 
                mfstate = trackingItem["mfstate"]
                def leftTime(distanceRelCalculated):
                    speed = 0.5 
                    return round((distanceRelCalculated / speed) * 60, 2) 
                leftTimeValue = leftTime(distanceRelCalculated)

                print("left time", leftTimeValue)

                body = {
                    "action": "NOTIFICATION_DELIVERY_LEFT_TIME",
                    "data": {
                        "targetUserId": deliveryItem["primaryUser"],
                        "user": deliveryItem["secondaryUser"],
                        "sessionId": "",
                        "message": None,
                        "deliveryId": deliveryItem["id"],
                        "mfstate": trackingItem["mfstate"],
                        "leftTime": leftTimeValue,
                        "lat": str(trackingLocation["lat"]),
                        "lng": str(trackingLocation["lng"]),
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
                raise Exception(f"Error loading mqtt message .")
            
            """
                Notification service 
            """
            # drone landing 
        
        elif nameAction == "LANDST1":
            """
                Notification service 
            """ 
            # can you see the drone over you
            targetUser = None
            if trackingItem["mfstate"] == "ZA":
                targetUser = deliveryItem["primaryUser"]
            elif trackingItem["mfstate"] == "AB":
                targetUser = deliveryItem["secondaryUser"]

            body = {
                "action": "NOTIFICATION_DELIVERY_ARRIVED_ST1",
                "data": {
                    "targetUserId": targetUser,
                    "user": None,
                    "sessionId": "",
                    "message": None,
                    "deliveryId": deliveryItem["id"],
                    "mfstate": trackingItem["mfstate"],
                    "leftTime": 0,
                    "lat": str(trackingLocation["lat"]),
                    "lng": str(trackingLocation["lng"]),
                    "instanceId": instanceId
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
        
        elif nameAction == "DOLANDST2":
            """
                Prepare to land stage 2
            """
            payload = {
                "ACTION": "LANDST2", 
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
                raise Exception(f"Error loading mqtt message .")

        elif nameAction == "LANDST2":
            """
                Notification service 
            """ 
            # your product is ready?
            targetUser = None
            if trackingItem["mfstate"] == "ZA":
                targetUser = deliveryItem["primaryUser"]
            elif trackingItem["mfstate"] == "AB":
                targetUser = deliveryItem["secondaryUser"]

            body = {
                "action": "NOTIFICATION_DELIVERY_ARRIVED_ST2",
                "data": {
                    "targetUserId": targetUser,
                    "user": None,
                    "sessionId": "",
                    "message": None,
                    "deliveryId": deliveryItem["id"],
                    "mfstate": trackingItem["mfstate"],
                    "leftTime": 0,
                    "lat": str(trackingLocation["lat"]),
                    "lng": str(trackingLocation["lng"]),
                    "instanceId": instanceId
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

        elif nameAction in ['LANDST3', "DOLANDST3"]:
            if stateAction == "FALSE":
                pass

            if trackingItem["mfstate"] == "ZA":
                body = {
                    "action": "NOTIFICATION_DELIVERY_DONE_A",
                    "data": {
                        "targetUserId": deliveryItem["secondaryUser"],
                        "user": None,
                        "sessionId": "",
                        "message": None,
                        "deliveryId": deliveryItem["id"],
                        "mfstate": trackingItem["mfstate"],
                        "leftTime": 0,
                        "lat": str(trackingLocation["lat"]),
                        "lng": str(trackingLocation["lng"]),
                        "instanceId": instanceId
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
            elif trackingItem["mfstate"] == "AB":
                body = {
                    "action": "NOTIFICATION_DELIVERY_DONE_B",
                    "data": {
                        "targetUserId": deliveryItem["primaryUser"],
                        "user": None,
                        "sessionId": "",
                        "message": None,
                        "deliveryId": deliveryItem["id"],
                        "mfstate": trackingItem["mfstate"],
                        "leftTime": 0,
                        "lat": str(trackingLocation["lat"]),
                        "lng": str(trackingLocation["lng"]),
                        "instanceId": instanceId
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
            elif trackingItem["mfstate"] == "BZ":
                body = {
                    "action": "NOTIFICATION_DELIVERY_DONE_Z",
                    "data": {
                        "targetUserId": deliveryItem["primaryUser"],
                        "user": deliveryItem["secondaryUser"],
                        "sessionId": "",
                        "message": None,
                        "deliveryId": deliveryItem["id"],
                        "mfstate": trackingItem["mfstate"],
                        "leftTime": 0,
                        "lat": str(trackingLocation["lat"]),
                        "lng": str(trackingLocation["lng"]),
                        "instanceId": instanceId
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
                    raise Exception(f"Error loading mqtt message .")
                    
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