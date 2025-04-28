import time
import sys
import threading
from enum import Enum

class DroneState(Enum):
    GROUNDED = 0
    TAKING_OFF = 1
    HOVERING = 2
    LANDING = 3

class TerminalDrone:
    def __init__(self, name):
        self.name = name
        self.state = DroneState.GROUNDED
        self.altitude = 0
        self.battery = 100
        self._running = False
        self._animation_thread = None
        
        # Drone ASCII art frames
        self.frames = {
            'ground': [
                "       ▲       ",
                "      / \\      ",
                "     /   \\     ",
                "    /     \\    ",
                "   /       \\   ",
                "  /         \\  ",
                " ▼           ▼ "
            ],
            'takeoff': [
                "       ▲       ",
                "      /⏱\\      ",
                "     /   \\     ",
                "    /     \\    ",
                "   /       \\   ",
                "  /         \\  ",
                " ▼           ▼ "
            ],
            'flying': [
                "       ✈       ",
                "      /⏱\\      ",
                "     /   \\     ",
                "    /     \\    ",
                "   /       \\   ",
                "  /         \\  ",
                "             ▼ "
            ],
            'high': [
                "       ✈       ",
                "      /⏱\\      ",
                "     /   \\     ",
                "    /     \\    ",
                "   /       \\   ",
                "  /         \\  ",
                "               "
            ]
        }
        
    def _clear_screen(self):
        """Clear the terminal screen"""
        print("\033[H\033[J", end="")
        
    def _draw_drone(self, frame_type, altitude_bar):
        """Draw the drone with altitude indicator"""
        self._clear_screen()
        print(f"{self.name} | Battery: {self.battery}% | State: {self.state.name}")
        print(f"Altitude: {self.altitude}m {'▇' * (self.altitude // 5)}")
        print()
        
        # Add empty lines to position the drone vertically
        for _ in range(10 - min(self.altitude // 10, 10)):
            print()
            
        # Draw the drone
        for line in self.frames[frame_type]:
            print(" " * 20 + line)
            
        # Draw ground line
        print("\n" + "_" * 50 + "\n")
        
    def _animate_takeoff(self):
        """Animate the takeoff sequence"""
        self.state = DroneState.TAKING_OFF
        
        # Spool up animation
        for i in range(5):
            self._draw_drone('takeoff', 0)
            print(f"Starting motors... [{i+1}/5]")
            time.sleep(0.3)
            
        # Ascending animation
        for alt in range(0, 51, 5):
            self.altitude = alt
            frame = 'takeoff' if alt < 30 else 'flying'
            self._draw_drone(frame, alt)
            print(f"Ascending... {alt}m")
            time.sleep(0.2)
            
        self.state = DroneState.HOVERING
        self._draw_drone('high', self.altitude)
        print("✔️ Reached cruising altitude!")
        time.sleep(1)
        
    def _animate_landing(self):
        """Animate the landing sequence"""
        self.state = DroneState.LANDING
        
        # Descending animation
        for alt in range(self.altitude, -1, -5):
            self.altitude = max(0, alt)
            frame = 'flying' if alt > 20 else 'takeoff'
            self._draw_drone(frame, self.altitude)
            print(f"Descending... {self.altitude}m")
            time.sleep(0.3)
            
        self.state = DroneState.GROUNDED
        self._draw_drone('ground', 0)
        print("✔️ Landed safely!")
        time.sleep(1)
        
    def takeoff(self):
        """Start takeoff sequence"""
        if self.state != DroneState.GROUNDED:
            print("Drone not on ground!")
            return
            
        self._running = True
        self._animation_thread = threading.Thread(target=self._animate_takeoff)
        self._animation_thread.start()
        
    def land(self):
        """Start landing sequence"""
        if self.state != DroneState.HOVERING:
            print("Drone not in flight!")
            return
            
        self._animate_landing()
        self._running = False
        
    def status(self):
        """Show current drone status"""
        self._draw_drone('ground' if self.state == DroneState.GROUNDED else 'flying', self.altitude)
        print(f"Current status: {self.state.name}")
