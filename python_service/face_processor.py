import cv2
import numpy as np
import os
import requests
import urllib.request

class FaceService:
    def __init__(self):
        """
        Initializes the Face Detection (YuNet) and Recognition (SFace) models.
        These models are very small (~2MB) and require no C++ compiler to run.
        """
        self.models_dir = os.path.join(os.path.dirname(__file__), "models")
        if not os.path.exists(self.models_dir):
            os.makedirs(self.models_dir)

        # Model Paths
        self.detector_path = os.path.join(self.models_dir, "face_detection_yunet_2023mar.onnx")
        self.recognizer_path = os.path.join(self.models_dir, "face_recognition_sface_2021dec.onnx")

        self._ensure_models_downloaded()

        # Initialize OpenCV Models
        # [640, 480] is the base resolution for webcam capture
        self.detector = cv2.FaceDetectorYN.create(self.detector_path, "", (320, 320)) 
        self.recognizer = cv2.FaceRecognizerSF.create(self.recognizer_path, "")
        
        print("ONNX Face Models loaded successfully.")

    def _ensure_models_downloaded(self):
        """Downloads the models from the OpenCV Model Zoo if they are missing."""
        urls = {
            self.detector_path: "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
            self.recognizer_path: "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
        }

        # Some networks/GitHub configs block simple urllib, so we use a Request with a User-Agent
        for path, url in urls.items():
            if not os.path.exists(path):
                print(f"Downloading model: {os.path.basename(path)}...")
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as response, open(path, 'wb') as out_file:
                        out_file.write(response.read())
                    print(f"Successfully downloaded {os.path.basename(path)}")
                except Exception as e:
                    print(f"Failed to download {os.path.basename(path)}: {e}")
                    print("Please download the models manually and place them in the 'models' folder.")

    def get_embedding(self, frame):
        """
        Detects face in the frame, aligns it, and extracts the 128d embedding vector.
        """
        # Set dynamic input size based on frame
        height, width, _ = frame.shape
        self.detector.setInputSize((width, height))
        
        # 1. Detect
        _, faces = self.detector.detect(frame)
        if faces is None:
            return None, "No face detected."

        # 2. Align and Extract (Take only the first face)
        face = faces[0]
        aligned_face = self.recognizer.alignCrop(frame, face)
        embedding = self.recognizer.feature(aligned_face)
        
        return embedding[0].tolist(), None

    def capture_and_extract(self):
        """
        Opens the webcam, captures a frame, and extracts the embedding.
        """
        cap = cv2.VideoCapture(0)
        print("Camera opened. Press 's' to capture face, or 'q' to quit.")
        
        embedding = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Flip for mirror effect
            frame = cv2.flip(frame, 1)
            display_frame = frame.copy()
            
            # Real-time Detection for UI
            self.detector.setInputSize((frame.shape[1], frame.shape[0]))
            _, faces = self.detector.detect(frame)
            
            if faces is not None:
                for face in faces:
                    # Draw bounding box
                    box = list(map(int, face[:4]))
                    cv2.rectangle(display_frame, (box[0], box[1]), (box[0]+box[2], box[1]+box[3]), (0, 255, 0), 2)
            
            cv2.putText(display_frame, "Press 's' to capture", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.imshow('AttendIQ Face Capture', display_frame)
            
            key = cv2.waitKey(1)
            if key & 0xFF == ord('s'):
                emb, err = self.get_embedding(frame)
                if emb:
                    embedding = emb
                    print("Face captured successfully.")
                    break
                else:
                    print(f"Capture failed: {err}")
            elif key & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        return embedding

if __name__ == "__main__":
    service = FaceService()
    # service.capture_and_extract()
