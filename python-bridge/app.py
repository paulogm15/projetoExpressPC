from flask import Flask, request, jsonify
import face_recognition
import base64
import io
from PIL import Image
import numpy as np

app = Flask(__name__)

@app.route('/get-embedding', methods=['POST'])
def get_embedding():
    data = request.json
    # Converte base64 para imagem
    img_data = base64.b64decode(data['image'].split(',')[1])
    img = face_recognition.load_image_file(io.BytesIO(img_data))
    
    # Gera o vetor facial (o "embedding")
    encodings = face_recognition.face_encodings(img)
    
    if len(encodings) > 0:
        return jsonify({"embedding": encodings[0].tolist()})
    return jsonify({"error": "Nenhum rosto encontrado"}), 400

if __name__ == '__main__':
    app.run(port=5000)