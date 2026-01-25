import cv2
import numpy as np
from insightface.app import FaceAnalysis
import requests
import json

class FaceService:
    def __init__(self, model_name='buffalo_l'):
        """
        Initializes the InsightFace model. 
        Note: The first time this runs, it will download the models (approx 200MB).
        """
        self.app = FaceAnalysis(name=model_name, providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        print("InsightFace model loaded successfully.")

    def get_embedding(self, image_path):
        """
        Detects a face in the image and returns its embedding vector.
        """
        img = cv2.imread(image_path)
        if img is None:
            return None, "Image not found."

        faces = self.app.get(img)
        if not faces:
            return None, "No face detected in the image."
        
        # We take the first face detected (assuming one person per registration/mark)
        embedding = faces[0].embedding.tolist()
        return embedding, None

    def capture_and_extract(self):
        """
        Opens the webcam, captures a frame, and extracts the embedding.
        """
        cap = cv2.VideoCapture(0)
        print("Camera opened. Press 's' to capture and save, or 'q' to quit.")
        
        embedding = None
        error = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Draw instructions on frame
            cv2.putText(frame, "Press 's' to capture face", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.imshow('Face Capture', frame)
            
            key = cv2.waitKey(1)
            if key & 0xFF == ord('s'):
                faces = self.app.get(frame)
                if faces:
                    embedding = faces[0].embedding.tolist()
                    print("Face captured and embedding extracted.")
                    break
                else:
                    print("No face detected, try again.")
            elif key & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        return embedding

if __name__ == "__main__":
    # Test local extraction
    service = FaceService()
    # embedding = service.capture_and_extract()
    # print(embedding)
