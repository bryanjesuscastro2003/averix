import time 
import random 
from flask import Flask, request, jsonify

app = Flask(__name__)


class Drone:
    def __init__(self, id):
        self.id = id
        self.status = "idle"
        self.battery_level = 100    
        self.position = {"x": 0, "y": 0, "z": 0}
        
    def take_off(self):
        if self.status == "idle" and self.battery_level > 20:
            self.status = "flying"
            self.position["z"] = 10  # Assume the drone takes off to a height of 10 units
            print(f"Drone {self.id} has taken off.")
        else:
            print(f"Drone {self.id} cannot take off. Status: {self.status}, Battery: {self.battery_level}%")

    def land(self):
        if self.status == "flying":
            self.status = "idle"
            self.position["z"] = 0  # Assume the drone lands back to ground level
            print(f"Drone {self.id} has landed.")
        else:
            print(f"Drone {self.id} cannot land. Status: {self.status}")

    def move_to(self, x, y, z):
        if self.status == "flying":
            self.position = {"x": x, "y": y, "z": z}
            print(f"Drone {self.id} moved to position ({x}, {y}, {z}).")
        else:
            print(f"Drone {self.id} cannot move. Status: {self.status}")

    def get_status(self):
        return {
            "id": self.id,
            "status": self.status,
            "battery_level": self.battery_level,
            "position": self.position
        }
    
    def simulate_battery_drain(self):
        if self.status == "flying" and self.battery_level > 0:
            time.sleep(1)  # Simulate time passing
            self.battery_level -= random.randint(1, 5)  # Random battery drain
            print(f"Drone {self.id} battery level: {self.battery_level}%")
            if self.battery_level <= 20:
                print(f"Drone {self.id} battery low. Returning to base.")
                self.land()



# Create a drone instance
drone = Drone(id="DRONE_001")

@app.route('/takeoff', methods=['POST'])
def takeoff():
    drone.take_off()
    return jsonify(drone.get_status())

@app.route('/land', methods=['POST'])
def land():
    drone.land()
    return jsonify(drone.get_status())


@app.route('/move', methods=['POST'])
def move():
    data = request.json
    x = data.get('x')
    y = data.get('y')
    z = data.get('z')
    drone.move_to(x, y, z)
    return jsonify(drone.get_status())

@app.route('/status', methods=['GET'])
def status():
    return jsonify(drone.get_status())

@app.route('/simulate_battery_drain', methods=['POST'])
def simulate_battery_drain():
    drone.simulate_battery_drain()
    return jsonify(drone.get_status())


if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")