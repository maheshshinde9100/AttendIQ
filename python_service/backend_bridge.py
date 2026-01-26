import requests
import json
from face_processor import FaceService
import os

class BackendBridge:
    def __init__(self, base_url="http://localhost:8080/api/v1"):
        self.base_url = base_url
        self.token = None
        self.face_service = FaceService()

    def login(self, email, password):
        """Log in to the backend and store the JWT."""
        url = f"{self.base_url}/auth/authenticate"
        payload = {"email": email, "password": password}
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                self.token = response.json().get("token")
                print("Logged in successfully.")
                return True
            else:
                print(f"Login failed: {response.text}")
                return False
        except Exception as e:
            print(f"Error connecting to backend: {e}")
            return False

    def register_face(self):
        """Capture face and register embedding to the authenticated user."""
        if not self.token:
            print("Not authenticated. Please login first.")
            return

        embedding = self.face_service.capture_and_extract()
        if embedding:
            url = f"{self.base_url}/face/register"
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {"embedding": embedding}
            
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                print("Face biometric registered successfully in backend.")
            else:
                print(f"Failed to register face: {response.text}")

    def mark_attendance(self, status="PRESENT", location="Main Campus"):
        """Capture face and mark attendance."""
        if not self.token:
            print("Not authenticated. Please login first.")
            return

        embedding = self.face_service.capture_and_extract()
        if embedding:
            url = f"{self.base_url}/attendance/mark"
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "status": status,
                "location": location,
                "deviceId": "Python-Client-01",
                "faceEmbedding": embedding
            }
            
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                print(f"Attendance Result: {response.json().get('message')}")
            else:
                print(f"Failed to mark attendance: {response.text}")

if __name__ == "__main__":
    # Example usage flow
    bridge = BackendBridge()
    
    # 1. Login (Change these based on what you created in DataInitializer)
    # email = "mahesh.admin@attendiq.com"
    # password = "admin123"
    
    # if bridge.login(email, password):
    #     # 2. Register face for the user (Run once)
    #     # bridge.register_face()
        
    #     # 3. Mark attendance (Run daily)
    #     # bridge.mark_attendance()
    pass
