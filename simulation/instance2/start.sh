#!/usr/bin/env bash
# stop script on error
set -e

# Update the system
yum update -y

# Install pip
yum install -y python3-pip

# Install requirements
pip install -r requirements.txt

# Check to see if root CA file exists, download if not
if [ ! -f ./root-CA.crt ]; then
  printf "\nDownloading AWS IoT Root CA certificate from AWS...\n"
  curl https://www.amazontrust.com/repository/AmazonRootCA1.pem > root-CA.crt
fi

# Check  if the folder for the AWS Device SDK for Python exists, create if not
if [ ! -d ./aws-iot-device-sdk-python-v2 ]; then
  mkdir -p ./aws-iot-device-sdk-python-v2
fi

# Check to see if AWS Device SDK for Python is already installed, install if not
if ! python3 -c "import awsiot" &> /dev/null; then
  printf "\nInstalling AWS SDK...\n"
  python3 -m pip install ./aws-iot-device-sdk-python-v2
  result=$?
  if [ $result -ne 0 ]; then
    printf "\nERROR: Failed to install SDK.\n"
    exit $result
  fi
fi

yum install -y awscli

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set region $AWS_REGION

aws s3 cp s3://dronautica/certificates/Instance-9dfe/certificate.pem $CERT_FILEPATH

aws s3 cp s3://dronautica/certificates/Instance-9dfe/private.key $PRI_KEY_FILEPATH

printf "\nRunning application...\n"
python3 main.py
