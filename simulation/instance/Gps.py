import numpy as np
from math import radians, sin, cos, sqrt, atan2, degrees, asin

class GPSPathGenerator:
    def __init__(self, point_a, point_b, point_z, points_per_route=20):
        """
        Initialize with three GPS points and generate paths between them.
        
        Args:
            point_a (tuple): (lat, lon) of point A in decimal degrees
            point_b (tuple): (lat, lon) of point B in decimal degrees
            point_z (tuple): (lat, lon) of point Z (home/base) in decimal degrees
            points_per_route (int): Number of points to generate per route (including start/end)
        """
        self.points = {
            'Z': point_z,
            'A': point_a,
            'B': point_b
        }
        self.points_per_route = points_per_route
        self.current_route = None
        self.current_path = []
        self.reset_routes()
        
    def _haversine_interpolation(self, start, end, fraction):
        """
        Calculate intermediate point between two coordinates at a given fraction (0-1)
        along the great-circle path using Haversine formula.
        """
        lat1, lon1 = radians(start[0]), radians(start[1])
        lat2, lon2 = radians(end[0]), radians(end[1])
        
        # Haversine formula components
        d = 2 * asin(sqrt(sin((lat2-lat1)/2)**2 + cos(lat1)*cos(lat2)*sin((lon2-lon1)/2)**2))
        
        A = sin((1-fraction)*d) / sin(d)
        B = sin(fraction*d) / sin(d)
        x = A*cos(lat1)*cos(lon1) + B*cos(lat2)*cos(lon2)
        y = A*cos(lat1)*sin(lon1) + B*cos(lat2)*sin(lon2)
        z = A*sin(lat1) + B*sin(lat2)
        
        lat = atan2(z, sqrt(x**2 + y**2))
        lon = atan2(y, x)
        
        return degrees(lat), degrees(lon)
    
    def _generate_path(self, start, end, num_points):
        """Generate interpolated points between two coordinates including endpoints"""
        if num_points < 2:
            return [start]
        
        return [self._haversine_interpolation(start, end, i/(num_points-1)) for i in range(num_points)]
    
    def reset_routes(self):
        """Generate all flight paths including endpoints"""
        self.routes = {
            'ZA': self._generate_path(self.points['Z'], self.points['A'], self.points_per_route),
            'AB': self._generate_path(self.points['A'], self.points['B'], self.points_per_route),
            'BZ': self._generate_path(self.points['B'], self.points['Z'], self.points_per_route)
        }
        self.current_path = []
        
    def set_route(self, route_name):
        """Set the current active route"""
        if route_name in self.routes:
            self.current_route = route_name
            self.current_path = list(self.routes[route_name])  # Create a copy to consume
            return True
        return False
    
    def get_next_point(self):
        """Get and remove the next GPS point in current route"""
        if self.current_path:
            return self.current_path.pop(0)
        return None
    
    def get_remaining_points(self):
        """Check how many points remain in current route"""
        return len(self.current_path)
    
    def get_current_route_name(self):
        """Get name of the active route"""
        return self.current_route