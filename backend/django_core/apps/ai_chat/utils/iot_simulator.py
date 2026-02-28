import time
import random
import threading

class IoTSimulator:
    """
    Simulates a fleet of edge devices sending telemetry data.
    """
    def __init__(self):
        self.devices = [
            {"id": "edge-node-alpha", "type": "Edge Server", "location": "US-East", "cpu": 45, "temp": 55, "latency": 12},
            {"id": "drone-scout-01", "type": "Autonomous Drone", "location": "Sector 7G", "cpu": 80, "temp": 65, "latency": 45},
            {"id": "hvac-control-main", "type": "Smart Thermostat", "location": "HQ Bldg 1", "cpu": 15, "temp": 22, "latency": 5},
            {"id": "manufacturing-arm-b", "type": "Robotic Arm", "location": "Factory Floor", "cpu": 60, "temp": 70, "latency": 8}
        ]
        self._lock = threading.Lock()

    def generate_telemetry(self):
        """
        Generates the next tick of telemetry data with some random walk applied to metrics.
        """
        with self._lock:
            for d in self.devices:
                # Random walk for CPU (0-100)
                d["cpu"] = max(0, min(100, d["cpu"] + random.uniform(-5, 5)))
                # Random walk for Temp (dependent on CPU load roughly, 20-90)
                target_temp = 30 + (d["cpu"] / 2)
                d["temp"] = max(20, min(90, d["temp"] + (target_temp - d["temp"]) * 0.1 + random.uniform(-2, 2)))
                # Random walk for latency (5-200ms)
                d["latency"] = max(5, min(200, d["latency"] + random.uniform(-3, 3)))
                
                # Add timestamp
                d["timestamp"] = int(time.time() * 1000)

            # Return a deep copy to avoid thread safety issues during emit
            import copy
            return copy.deepcopy(self.devices)

# Singleton instance
simulator = IoTSimulator()
