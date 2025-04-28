import pygame
import sys
import math
from pygame.locals import *

# Initialize pygame
pygame.init()
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Drone Flight Simulator")

# Colors
SKY_BLUE = (135, 206, 235)
GROUND_GREEN = (34, 139, 34)
DRONE_COLOR = (70, 70, 70)
PROPELLER_COLOR = (200, 200, 200)
TEXT_COLOR = (255, 255, 255)

# Drone properties
class Drone:
    def __init__(self):
        self.x = width // 2
        self.y = height - 50
        self.altitude = 0
        self.speed = 0
        self.battery = 100
        self.propeller_angle = 0
        self.state = "GROUNDED"  # GROUNDED, TAKING_OFF, FLYING, LANDING
    
    def update(self):
        # Update propeller animation
        self.propeller_angle = (self.propeller_angle + 20) % 360
        
        # State-based behavior
        if self.state == "TAKING_OFF":
            self.y -= 1
            self.altitude += 0.5
            self.speed = min(self.speed + 0.1, 5)
            if self.altitude >= 100:
                self.state = "FLYING"
        
        elif self.state == "LANDING":
            self.y += 1
            self.altitude = max(0, self.altitude - 0.5)
            self.speed = max(0, self.speed - 0.1)
            if self.altitude <= 0:
                self.state = "GROUNDED"
        
        # Battery consumption
        if self.state != "GROUNDED":
            self.battery = max(0, self.battery - 0.05)
    
    def draw(self, surface):
        # Drone body (quadcopter style)
        body_rect = pygame.Rect(self.x - 20, self.y - 10, 40, 20)
        pygame.draw.ellipse(surface, DRONE_COLOR, body_rect)
        
        # Arms
        pygame.draw.line(surface, DRONE_COLOR, (self.x, self.y), (self.x - 30, self.y - 15), 3)
        pygame.draw.line(surface, DRONE_COLOR, (self.x, self.y), (self.x + 30, self.y - 15), 3)
        pygame.draw.line(surface, DRONE_COLOR, (self.x, self.y), (self.x - 30, self.y + 15), 3)
        pygame.draw.line(surface, DRONE_COLOR, (self.x, self.y), (self.x + 30, self.y + 15), 3)
        
        # Propellers (animated)
        for offset in [(-30, -15), (30, -15), (-30, 15), (30, 15)]:
            prop_x = self.x + offset[0]
            prop_y = self.y + offset[1]
            
            # Rotating propellers
            for i in range(2):
                angle = self.propeller_angle + (i * 180)
                end_x = prop_x + 15 * math.cos(math.radians(angle))
                end_y = prop_y + 15 * math.sin(math.radians(angle))
                pygame.draw.line(surface, PROPELLER_COLOR, (prop_x, prop_y), (end_x, end_y), 2)
        
        # Camera gimbal
        pygame.draw.circle(surface, (50, 50, 50), (self.x, self.y - 5), 5)

# Initialize drone and clock
drone = Drone()
clock = pygame.time.Clock()

# Load font (fallback to default if needed)
try:
    font = pygame.font.SysFont('Arial', 24)
except:
    font = pygame.font.Font(None, 24)  # Default font

# Main game loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == QUIT:
            running = False
        elif event.type == KEYDOWN:
            if event.key == K_t and drone.state == "GROUNDED":
                drone.state = "TAKING_OFF"
            elif event.key == K_l and drone.state == "FLYING":
                drone.state = "LANDING"
            elif event.key == K_ESCAPE:
                running = False
    
    # Update drone
    drone.update()
    
    # Draw everything
    screen.fill(SKY_BLUE)
    
    # Draw ground
    pygame.draw.rect(screen, GROUND_GREEN, (0, height - 50, width, 50))
    
    # Draw drone
    drone.draw(screen)
    
    # Draw status info
    status_text = [
        f"State: {drone.state}",
        f"Altitude: {drone.altitude:.1f}m",
        f"Speed: {drone.speed:.1f}km/h",
        f"Battery: {drone.battery:.1f}%",
        "Controls: T-Takeoff, L-Land, ESC-Exit"
    ]
    
    for i, text in enumerate(status_text):
        text_surface = font.render(text, True, TEXT_COLOR)
        screen.blit(text_surface, (10, 10 + i * 30))
    
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()