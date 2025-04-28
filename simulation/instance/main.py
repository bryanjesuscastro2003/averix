import os
import sys
from datetime import datetime
from Instance import Drone
from Mqtt import AWSIoTMQTTClient
import time
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
    try:
        return AWSIoTMQTTClient(
            endpoint="a2racyjm6zpt4f-ats.iot.us-east-1.amazonaws.com",
            cert_filepath="DroneC1_small.cert.pem",
            pri_key_filepath="DroneC1_small.private.key",
            ca_filepath="root-CA.crt",
            client_id="drone-client-1",
            topicSub="dronautica/dataX/3808",
            topicPub="dronautica/dataY/5815",
            topicAct="dronautica/data/Dronautica",
            drone=Drone("DroneC1_small", "f4c7"),
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