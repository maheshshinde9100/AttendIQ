from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import base64
import numpy as np
import cv2
from face_processor import FaceService
import os

app = FastAPI()

# Enable CORS for Java backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

face_service = FaceService()

@app.post("/extract-embedding")
async def extract_embedding(image_data: str = Form(...)):
    """
    Receives a base64 image string and returns the 128d face embedding.
    """
    try:
        # Decode base64 image
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
            
        img_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"success": False, "message": "Invalid image data"}

        embedding, err = face_service.get_embedding(img)
        
        if err:
            return {"success": False, "message": err}
            
        return {"success": True, "embedding": embedding}
        
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
