import json
from awscrt import mqtt, http
from awsiot import mqtt_connection_builder
from concurrent.futures import ThreadPoolExecutor
import threading
import time

class AWSIoTMQTTClient:
    def __init__(self, endpoint, cert_filepath, pri_key_filepath, ca_filepath, 
                 client_id, topicSub, topicPub, topicAct, drone, proxy_host=None, proxy_port=0, port=8883):
        self.endpoint = endpoint
        self.cert_filepath = cert_filepath
        self.pri_key_filepath = pri_key_filepath
        self.ca_filepath = ca_filepath
        self.client_id = client_id
        self.topicSub = topicSub
        self.topicPub = topicPub
        self.topicAct = topicAct
        self.drone = drone
        self.port = port
        self.mqtt_connection = None
        self.executor = ThreadPoolExecutor(max_workers=5)
        #self.reminderOn = False
        self.reminder_lock = threading.Lock()
        self._reminderOn = False
        self.landst1_reminder_on = False  # Flag for LANDST1 reminders
        self.landst2_reminder_on = False  # Flag for LANDST2 reminders
        
        # Proxy configuration
        self.proxy_options = None
        if proxy_host and proxy_port:
            self.proxy_options = http.HttpProxyOptions(
                host_name=proxy_host,
                port=proxy_port)
    
    @property
    def reminderOn(self):
        with self.reminder_lock:
            return self._reminderOn

    @reminderOn.setter
    def reminderOn(self, value):
        with self.reminder_lock:
            self._reminderOn = value

    def _on_connection_interrupted(self, connection, error, **kwargs):
        print(f"Connection interrupted. error: {error}")

    def _on_connection_resumed(self, connection, return_code, session_present, **kwargs):
        print(f"Connection resumed. return_code: {return_code} session_present: {session_present}")
        
        if return_code == mqtt.ConnectReturnCode.ACCEPTED and not session_present:
            print("Session did not persist. Resubscribing to existing topics...")
            resubscribe_future, _ = connection.resubscribe_existing_topics()
            resubscribe_future.add_done_callback(self._on_resubscribe_complete)

    def _on_resubscribe_complete(self, resubscribe_future):
        resubscribe_results = resubscribe_future.result()
        print(f"Resubscribe results: {resubscribe_results}")

    def _on_message_received(self, topic, payload, dup, qos, retain, **kwargs):
        try:
            message = json.loads(payload.decode('utf-8'))
            print(f"\nRaw message received on topic '{topic}': {message}")
            
            # Process message in a separate thread to avoid blocking
            self.executor.submit(self._process_message, message)
                
        except Exception as e:
            print(f"Error processing message: {str(e)}")

    def _process_message(self, message):
        """Process message in background thread"""
        print(f"Processing message: {message}")
        if 'ACTION' in message:
            action = message['ACTION'].upper()
            
            if action == "STARTUP" and not self.drone.isActionInProgress() and not self.drone.landing:
                if self.drone.startMotorAction():
                    self.publish_status_updates("GETDAT", interval=1)
            

            elif action == "GETDAT1":
                if "VALUE" in message:
                    value = json.loads(message["VALUE"])
                    self.drone.pointALocation = (value["lat"], value["lng"])
                    self.publish(self.drone.confirmAction("GETDAT1"))
        
            elif action == "GETDAT2":
                if "VALUE" in message:
                    value = json.loads(message["VALUE"])
                    self.drone.pointBLocation = (value["lat"], value["lng"])
                    self.publish(self.drone.confirmAction("GETDAT2"))
            
            elif action == "GETMFST":
                if "VALUE" in message:
                    value = message["VALUE"]
                    self.drone.currentRoute = value
                    self.drone.setGps()
                    self.publish(self.drone.confirmAction("GETMFST"))
            
            elif action == "SHOW":
                point = self.drone.gps_gen.get_next_point()
                print(f"Current point 1: {point}")
                point = self.drone.gps_gen.get_next_point()
                print(f"Current point 2: {point}")

                    
            elif action == "TAKEOFF" and not self.drone.isActionInProgress() and not self.drone.landing:
                self.landst1_reminder_on = False
                self.landst2_reminder_on = False
                time.sleep(0.1)
                if self.drone.takeOffAction():
                    self.publish_status_updates("TAKEOFF", interval=1)
                    
            elif action == "POINTINGN" and not self.drone.isActionInProgress() and not self.drone.landing:
                if self.drone.pointingToNorthAction():
                    self.publish_status_updates("POINTINGN", interval=1)
                    
            elif action == "SPINNING" and not self.drone.isActionInProgress() and not self.drone.landing:
                if self.drone.spinningAction():
                    self.publish_status_updates("SPINNING", interval=1)
                    
            elif action == "MOVINGFORWARD" and not self.drone.isActionInProgress() and not self.drone.landing:
                # Handle movement as a sequence of actions
                for _ in range(5):
                    if self.drone.moveForwardAction():
                        self.publish_status_updates("TRACKING", interval=1)
                
                if self.drone.pointingToNorthAction():
                    self.publish_status_updates("POINTINGN", interval=1)
            
            elif action == "LANDST1" and not self.drone.landing2:
                self.landst1_reminder_on = False
                self.landst2_reminder_on = False
                time.sleep(0.1)  
                
                # Enable LANDST1 reminder
                self.landst1_reminder_on = True
                if self.drone.landst1Action():
                    self.publish_status_updates("LANDST1", interval=1)
                self.executor.submit(self.publish_status_updates_reminder, "LANDST1", interval=10)

            elif action == "LANDST2":   
                self.landst1_reminder_on = False
                self.landst2_reminder_on = False
                time.sleep(0.1)

                self.landst2_reminder_on = True
                
                if self.drone.currentRoute == "ZA":
                    self.drone.setRoute("AB")
                    self.drone.currentRoute = "AB"
                elif self.drone.currentRoute == "AB":
                    self.drone.setRoute("BZ")
                    self.drone.currentRoute = "BZ"
                else:
                    self.drone.setRoute("ZA")
                    self.drone.currentRoute = "ZA"
                
                self.drone.landing = False
                self.drone.landing2 = False
                
                if self.drone.landst2Action():
                    self.reminderOn = True
                    self.publish_status_updates("LANDST2", interval=1)
                self.executor.submit(self.publish_status_updates_reminder, "LANDST2", interval=10)
                
            elif action == "DOLANDST3":
                if self.drone.landst3Action():
                    self.publish_status_updates("DOLANDST3", interval=1)

            elif action == "SLEEP":
                if self.drone.sleepAction():
                    self.publish_status_updates("SLEEP", interval=1)

    def publish_status_updates(self, action_name, interval=1):
        """Publish periodic status updates during an action"""
        while self.drone.isActionInProgress():
            #self.publish(self.drone.confirmAction(action_name))
            time.sleep(interval)  # This is non-blocking due to thread pool
        
        # Final completion message
        self.publish(self.drone.confirmAction(action_name))

    def publish_status_updates_reminder(self, action_name, interval=5):
        """Publish reminders for the specified action, checking its specific flag"""
        while True:
            with self.reminder_lock:
                if action_name == "LANDST1" and not self.landst1_reminder_on:
                    break
                if action_name == "LANDST2" and not self.landst2_reminder_on:
                    break
            
            self.publish(self.drone.confirmAction(action_name))
            time.sleep(interval)


    def connect(self):
        """Establish MQTT connection"""
        print(f"Connecting to {self.endpoint} with client ID '{self.client_id}'...")
        
        self.mqtt_connection = mqtt_connection_builder.mtls_from_path(
            endpoint=self.endpoint,
            port=self.port,
            cert_filepath=self.cert_filepath,
            pri_key_filepath=self.pri_key_filepath,
            ca_filepath=self.ca_filepath,
            on_connection_interrupted=self._on_connection_interrupted,
            on_connection_resumed=self._on_connection_resumed,
            client_id=self.client_id,
            clean_session=False,
            keep_alive_secs=30,
            http_proxy_options=self.proxy_options)
        
        connect_future = self.mqtt_connection.connect()
        connect_future.result()
        print("Connected!")
        
    def subscribe(self):
        """Subscribe to topics"""
        print(f"Subscribing to topic '{self.topicSub}'...")
        subscribe_future, _ = self.mqtt_connection.subscribe(
            topic=self.topicSub,
            qos=mqtt.QoS.AT_MOST_ONCE,
            callback=self._on_message_received)
        subscribe_future.result()

    def publish(self, message, isStart=False):
        """Publish a message"""
        topic = self.topicPub if not isStart else self.topicAct
        
        if isinstance(message, (dict, list)):
            message = json.dumps(message)
            
        print(f"Publishing to '{topic}': {message}")
        publish_future = self.mqtt_connection.publish(
            topic=topic,
            payload=message,
            qos=mqtt.QoS.AT_MOST_ONCE)
        return publish_future

    def run(self):
        """Main run loop"""
        while True:
            try:
                self.drone.setToAvailable()
                self.publish(self.drone.confirmAction("AVAILABLE"), isStart=True)
                
                while True:
                    # Just keep the connection alive
                    time.sleep(1)
                    
            except KeyboardInterrupt:
                print("\nDisconnecting...")

                print(" 1 - Disconnect instance")
                print(" 2 - Simulate unexpected restart")
                chroice = input("Choose an option: ")
                if chroice == "1":
                    self.drone.setToUnavailable()
                    self.publish(self.drone.confirmAction("UNAVAILABLE"), isStart=True)
                    self.disconnect()
                    break
                else:
                    print("Simulating unexpected restart...")


    def disconnect(self):
        """Cleanup connection"""
        if self.mqtt_connection:
            disconnect_future = self.mqtt_connection.disconnect()
            disconnect_future.result()
        self.executor.shutdown()