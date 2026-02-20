import os
import sys
import face_recognition_models

# 1. Configura o caminho antes de QUALQUER coisa do face_recognition ser mencionada
models_path = face_recognition_models.__path__[0]
os.environ['FACE_RECOGNITION_MODELS'] = models_path

# 2. Força o Python a esquecer tentativas de importação anteriores, se houver
if 'face_recognition' in sys.modules:
    del sys.modules['face_recognition']

import face_recognition # Agora sim
from flask import Flask, request, jsonify
import base64
import io
import numpy as np

app = Flask(__name__)

@app.route('/get-embedding', methods=['POST'])
def get_embedding():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "Imagem não fornecida"}), 400
            
        # Decodifica Base64
        img_data = base64.b64decode(data['image'].split(',')[1])
        img = face_recognition.load_image_file(io.BytesIO(img_data))
        
        # Gera o embedding (vetor de 128 posições)
        encodings = face_recognition.face_encodings(img)
        
        if len(encodings) > 0:
            return jsonify({"embedding": encodings[0].tolist()})
        
        return jsonify({"error": "Nenhum rosto detectado na imagem"}), 400
    except Exception as e:
        print(f"Erro processando imagem: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(f"✅ Modelos localizados em: {models_path}")
    print("🚀 Servidor de IA rodando em http://localhost:5000")
    app.run(port=5000, debug=False)