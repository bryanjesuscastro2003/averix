import json
import time
from datetime import datetime, timedelta
from Gps import GPSPathGenerator

class Drone:
    def __init__(self, name, id):
        self.id = id
        self.name = name
        self.batteryLevel = 100
        self.altitude = 0
        self.speed = 0
        self.isConnectedToGps = False
        self.isConnectedToServer = False
        self.current_action = None
        self.action_start_time = None
        self.action_duration = 0

        self.landing = False
        self.landing2 = False
        
        # GPS Setup
        self.baseLocation = (18.489543074164384, -97.39278599921742)
        self.pointALocation = None
        self.pointBLocation = None
        self.currentLocation = self.baseLocation
        self.currentRoute = None
        self.gps_gen = None

    def setGps(self):
        """Set GPS points for the drone"""
        self.gps_gen = GPSPathGenerator(self.pointALocation, self.pointBLocation, 
                                      self.baseLocation, points_per_route=10)
        self.gps_gen.set_route(self.currentRoute)    

    
    def setRoute(self, route_name):
        """Set the route for the drone"""
        if route_name in self.gps_gen.routes:
            self.currentRoute = route_name
            self.gps_gen.set_route(route_name)
            print(f"Route set to {route_name}")
            return True
        else:
            print(f"Route {route_name} not found")
            return False

    def setToAvailable(self):
        """Mark drone as available (instant action)"""
        print(f"{self.name} is now available for use!")
        self.current_action = "AVAILABLE"
        return True

    def setToUnavailable(self):
        """Mark drone as unavailable (instant action)"""
        print(f"{self.name} is now unavailable for use!")
        self.current_action = "UNAVAILABLE"
        return True

    def startAction(self, action_name, duration=5):
        """Start a timed action"""
        if self.current_action and self.isActionInProgress():
            print(f"Cannot start {action_name} - {self.current_action} in progress")
            return False
            
        self.current_action = action_name
        self.action_start_time = datetime.now()
        self.action_duration = timedelta(seconds=duration)
        print(f"{self.name} started {action_name}!")
        return True

    def isActionInProgress(self):
        """Check if current action is still running"""
        if not self.current_action or not self.action_start_time:
            return False
        return datetime.now() < self.action_start_time + self.action_duration

    def getCurrentAction(self):
        """Get current action status"""
        if self.isActionInProgress():
            elapsed = datetime.now() - self.action_start_time
            remaining = (self.action_duration - elapsed).total_seconds()
            return {
                "action": self.current_action,
                "progress": min(100, (elapsed.total_seconds() / self.action_duration.total_seconds()) * 100),
                "remaining_seconds": max(0, remaining)
            }
        return {"action": None, "progress": 0, "remaining_seconds": 0}

    # Action methods that return immediately but track duration
    def startMotorAction(self):
        return self.startAction("STARTUP", 3)
    
    def takeOffAction(self):
        return self.startAction("TAKEOFF", 3)
    
    def pointingToNorthAction(self):
        return self.startAction("POINTINGN", 3)
    
    def spinningAction(self):
        return self.startAction("SPINNING", 3)

    def moveForwardAction(self):
        if not self.isActionInProgress():
            point = self.gps_gen.get_next_point() 
            if point is not None:
                self.currentLocation = point
            else:
                self.currentLocation = self.baseLocation
            return self.startAction("MOVING", 2)  # Shorter duration for movement
        return False

    def landst1Action(self):
        self.landing = True
        return self.startAction("LANDST1", 3)

    def landst2Action(self):
        #self.landing2 = True
        return self.startAction("LANDST2", 3)

    def landst3Action(self):
        #self.landing2 = True
        return self.startAction("DOLANDST3", 3)

    def sleepAction(self):
        """Simulate sleep mode"""
        return self.startAction("SLEEP", 3)

    def confirmAction(self, nameAction):
        """Generate confirmation message with current status"""
        
        return json.dumps({
            "iID": self.id,
            "nA": nameAction,
            "sA": "TRUE",
            "cLN": {
                "lat": self.currentLocation[0],
                "lng": self.currentLocation[1]
            }
        })