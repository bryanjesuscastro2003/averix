import pybullet as p
import pybullet_data
import time
import os
import math

# Initialize PyBullet
physicsClient = p.connect(p.GUI)  # Use p.DIRECT for non-graphical version
p.setAdditionalSearchPath(pybullet_data.getDataPath())
p.setGravity(0, 0, -9.81)  # Set gravity

# Load the ground plane
planeId = p.loadURDF("plane.urdf")

# Load the custom drone URDF
droneStartPos = [0, 0, 0.1]  # Start position of the drone (slightly above the ground)
droneStartOrientation = p.getQuaternionFromEuler([0, 0, 0])  # Start orientation

# Get the full path to the URDF file
urdf_path = "/home/bryan/Documentos/Averix/simulation/quadcopter.urdf"
print(f"Loading URDF from: {urdf_path}")

# Load the drone URDF
droneId = p.loadURDF("r2d2.urdf", droneStartPos, droneStartOrientation)  # Load a simple drone model
# Stabilize the drone (let it settle on the ground)
print("Stabilizing drone...")
for _ in range(100):  # Run simulation for 100 steps to stabilize
    p.stepSimulation()
    time.sleep(1/240)
print("Drone stabilized.")

# Define target locations
locationZ = [0, 0, 5]  # Center location (home)
locationA = [120, 56, 5]  # Location A
locationB = [40, 2, 5]  # Location B

# Function to calculate distance between two points
def distance(point1, point2):
    return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2 + (point1[2] - point2[2])**2)

# Function to move the drone to a target location
def move_to_location(target_location, tolerance=0.1):
    print(f"Moving to {target_location}...")
    while True:
        current_position, _ = p.getBasePositionAndOrientation(droneId)
        dist = distance(current_position, target_location)
        if dist < tolerance:
            print(f"Reached {target_location}!")
            break

        # Calculate direction vector
        direction = [
            target_location[0] - current_position[0],
            target_location[1] - current_position[1],
            target_location[2] - current_position[2]
        ]

        # Normalize direction vector
        magnitude = math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2)
        direction = [d / magnitude for d in direction]

        # Apply force in the direction of the target
        force_magnitude = 10  # Adjust this for faster/slower movement
        force = [direction[0] * force_magnitude, direction[1] * force_magnitude, direction[2] * force_magnitude]
        p.applyExternalForce(droneId, -1, force, [0, 0, 0], p.WORLD_FRAME)

        # Step the simulation
        p.stepSimulation()

        # Update the camera to follow the drone
        camera_follow_drone(current_position)

        time.sleep(1/240)

# Function to simulate takeoff
def takeoff(target_height):
    print("Taking off...")
    target_location = [0, 0, target_height]  # Take off vertically
    move_to_location(target_location)
    print(f"Reached target height of {target_height} meters!")

# Function to simulate landing
def land():
    print("Landing...")
    current_position, _ = p.getBasePositionAndOrientation(droneId)
    target_location = [current_position[0], current_position[1], 0.1]  # Land at current (x, y) position
    move_to_location(target_location)
    print("Landing complete!")

# Function to update the camera to follow the drone
def camera_follow_drone(drone_position):
    # Set camera target to the drone's position
    camera_target = drone_position

    # Set camera distance and pitch (zoom level)
    camera_distance = 10  # Distance from the drone
    camera_pitch = -30  # Angle of the camera (tilt down)

    # Set camera yaw (rotation around the drone)
    camera_yaw = 45  # Angle of the camera (rotate around the drone)

    # Update the camera
    p.resetDebugVisualizerCamera(
        cameraDistance=camera_distance,
        cameraYaw=camera_yaw,
        cameraPitch=camera_pitch,
        cameraTargetPosition=camera_target
    )

# Main program
if __name__ == "__main__":
    try:
        # Initial state: Landed
        print("Drone is on the ground.")

        # Sequence of actions
        # 1. Take off to 5 meters
        takeoff(5)

        # 2. Move to Location A
        move_to_location(locationA)

        # 3. Land
        land()

        # 4. Take off to 5 meters
        takeoff(5)

        # 5. Move to Location B
        move_to_location(locationB)

        # 6. Land
        land()

        # 7. Take off to 5 meters
        takeoff(5)

        # 8. Move back to Location Z (center)
        move_to_location(locationZ)

        # 9. Land (trip finalized)
        land()

        print("Trip finalized.")
    except KeyboardInterrupt:
        print("Simulation terminated by user.")

# Disconnect from PyBullet
p.disconnect()
print("Simulation complete.")