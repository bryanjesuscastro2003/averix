import os
import sys
from datetime import datetime
from Instance import Drone
from Mqtt import AWSIoTMQTTClient
import time
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

endpoint = os.getenv("AWS_IOT_ENDPOINT") 
certFilepath = os.getenv("CERT_FILEPATH")
priKeyFilepath = os.getenv("PRI_KEY_FILEPATH")
caFilepath = os.getenv("CA_FILEPATH")
clientId = os.getenv("CLIENT_ID")
topicSub = os.getenv("TOPIC_SUB")
topicPub = os.getenv("TOPIC_PUB")
topicAct = os.getenv("TOPIC_ACT")
droneName = os.getenv("DRONE_NAME")
droneId = os.getenv("DRONE_ID")
baseLocationLat = os.getenv("BASE_LOCATION_LAT")
baseLocationLng = os.getenv("BASE_LOCATION_LNG")


def clear_screen():
    """Clear the console screen in a cross-platform way"""
    os.system('cls' if os.name == 'nt' else 'clear')

def loading_animation(duration=3, steps=3):
    """Show a loading animation without blocking MQTT"""
    start_time = datetime.now()
    while (datetime.now() - start_time).seconds < duration:
        for i in range(steps):
            print("Loading" + "." * (i + 1), end='\r')
            time.sleep(1)
    clear_screen()

def welcome_message():
    """Display welcome message with non-blocking animation"""
    loading_animation()
    print("-------------------------")
    print("Welcome to the Drone Simulation!")
    print("This simulation will demonstrate the functionality of a drone.")
    print("Let's get started!")
    print("-------------------------")
    time.sleep(2)  # Allow time to read the message
    clear_screen()

def initialize_mqtt_client():
    """Initialize and return the MQTT client with error handling"""
    global baseLocationLat, baseLocationLng
    try:
        
        env_vars = [endpoint, certFilepath, priKeyFilepath, caFilepath, clientId, topicSub, topicPub, topicAct, droneName, droneId, baseLocationLat, baseLocationLng]
        if any(var is None for var in env_vars):
            raise ValueError("One or more environment variables are missing. Please check your .env file.")

        print(baseLocationLat)
        print(baseLocationLng)

        baseLocationLat = float(baseLocationLat)
        baseLocationLng = float(baseLocationLng)

        return AWSIoTMQTTClient(
            endpoint=endpoint,
            cert_filepath=certFilepath,
            pri_key_filepath=priKeyFilepath,
            ca_filepath=caFilepath,
            client_id=clientId,
            topicSub=topicSub,
            topicPub=topicPub,
            topicAct=topicAct,
            drone=Drone(droneName, droneId, baseLocationLat, baseLocationLng),
        )
    except Exception as e:
        print(f"Failed to initialize MQTT client: {str(e)}")
        sys.exit(1)

def main():
    try:
        welcome_message()
        
        
        # Initialize client
        mqtt_client = initialize_mqtt_client()
        
        # Connect with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"Connection attempt {attempt + 1} of {max_retries}")
                mqtt_client.connect()
                mqtt_client.subscribe()
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                print(f"Connection failed, retrying... ({str(e)})")
                time.sleep(2 ** attempt)  # Exponential backoff
        
        # Main loop
        print("\nDrone simulation running. Press Ctrl+C to exit.")
        mqtt_client.run()
        
    except KeyboardInterrupt:
        print("\nSimulation stopped by user")
    except Exception as e:
        print(f"\nFatal error: {str(e)}")
    finally:
        if 'mqtt_client' in locals():
            print("Cleaning up MQTT connection...")
            mqtt_client.disconnect()
        print("Simulation ended")

if __name__ == '__main__':
    main()