import json
import boto3 
import uuid
import hashlib
from domain.model.ItemModel import ItemModel
from infrastructure.adapters.DynamodbItemRepository import DynamodbItemRepository
from application.AddItemUseCase import AddItemUseCase
from application.GetItemUseCase import GetItemUseCase   

# Services 
iot = boto3.client('iot')
s3 = boto3.client('s3')

# S3 bucket name for storing certificates
CERTIFICATE_BUCKET_NAME = 'dronautica'

# IoT Policy name
IOT_POLICY_NAME = 'DRONAUTICAPOLICY'

itemRepository = DynamodbItemRepository()
addItemUseCase = AddItemUseCase(itemRepository)
getItemUseCase = GetItemUseCase(itemRepository)

def generateCertificate(instanceId, name, model, capacity):
    # Create an IoT Thing for the drone
    thing_name = f"Instance-{instanceId}"  # Use DroneID as part of the Thing name
    iot.create_thing(
        thingName=thing_name,
        thingTypeName=capacity,
        attributePayload={
            'attributes': {
                'InstanceId': instanceId,
                'Name': name,
                'Model': model,
                'capacity': capacity
            },
            'merge': False
        },
    )
    # Create keys and certificate for the Thing
    cert_response = iot.create_keys_and_certificate(
        setAsActive=True
    )
    # Attach the certificate to the Thing
    iot.attach_thing_principal(
        thingName=thing_name,
        principal=cert_response['certificateArn']
    )

    # Attach the policy to the certificate
    iot.attach_policy(
        policyName=IOT_POLICY_NAME,
        target=cert_response['certificateArn']
    )

    # Upload the certificate files to S3
    certificate_pem = cert_response['certificatePem']
    private_key = cert_response['keyPair']['PrivateKey']
    public_key = cert_response['keyPair']['PublicKey']
    s3_prefix = f"certificates/{thing_name}/"
    certificate_s3_key = f"{s3_prefix}certificate.pem"
    private_key_s3_key = f"{s3_prefix}private.key"
    public_key_s3_key = f"{s3_prefix}public.key"
    s3.put_object(Bucket=CERTIFICATE_BUCKET_NAME, Key=certificate_s3_key, Body=certificate_pem)
    s3.put_object(Bucket=CERTIFICATE_BUCKET_NAME, Key=private_key_s3_key, Body=private_key)
    s3.put_object(Bucket=CERTIFICATE_BUCKET_NAME, Key=public_key_s3_key, Body=public_key)

    # Store the S3 paths in DynamoDB
    certPath= f"s3://{CERTIFICATE_BUCKET_NAME}/{s3_prefix}"

    return {
        "thing": thing_name,
        "certificateS3Path": certPath,
        "certificateArn": cert_response['certificateArn'],
        "certificateId": cert_response['certificateId'],
        "publicKey": public_key_s3_key,
        "privateKey": private_key_s3_key,
        "certificatePem": certificate_s3_key
    }

def lambda_handler(event, context):
    try:
        # Data from event 
        action = event['ACTION']
        if action not in ["GETITEM", "GETITEMS", "PUTITEM", "GETITEMBYID"]:
            raise Exception("Invalid Action")

        if action == "PUTITEM":
            instanceId = event['INSTANCE']["INSTANCEID"]
            name = event['INSTANCE']["NAME"]
            model = event['INSTANCE']["MODEL"]
            capacity = event['INSTANCE']["CAPACITY"]

            response = generateCertificate(instanceId, name, model, capacity)
            
            item = ItemModel(
                thing = response["thing"],
                certificateS3Path = response["certificateS3Path"],
                certificateArn = response["certificateArn"],
                certificateId = response["certificateId"],
                publicKey = response["publicKey"],
                privateKey = response["privateKey"],
                certificatePem = response["certificatePem"]
            )
            certificateId = addItemUseCase.execute(item)
            return {
                "STATE": "OK", 
                "VALUE": {
                    "CERTIFICATEID": certificateId
                }                
            }
        
        elif action == "GETITEMBYID":
            certificateId = event["INSTANCE"]['CERTIFICATEID']
            item = getItemUseCase.execute(certificateId)
            return {
                "STATE": "OK",
                "VALUE": {
                    "ITEM": item
                }
            } 

    except Exception as e: 
        return {
            "STATE": "ERROR",
            "VALUE": {
                "ERROR": str(e)
            }
        }
