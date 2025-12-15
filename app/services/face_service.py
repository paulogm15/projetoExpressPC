import cv2
import json
import os
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))

CASCADE_PATH = os.path.join(
    PROJECT_ROOT,
    "haarcascade_frontalface_default.xml"
)

DB_PATH = os.path.join(
    PROJECT_ROOT,
    "data",
    "faces.json"
)

face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

if face_cascade.empty():
    raise RuntimeError("❌ Haar Cascade não foi carregado. Verifique o caminho.")


def _load_db():
    if not os.path.exists(DB_PATH):
        return {}
    with open(DB_PATH, "r") as f:
        return json.load(f)


def _save_db(db):
    with open(DB_PATH, "w") as f:
        json.dump(db, f)


def _extract_face(gray):
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) == 0:
        return None, None

    x, y, w, h = faces[0]
    face_img = gray[y:y+h, x:x+w]
    face_img = cv2.resize(face_img, (100, 100))

    return face_img, (x, y, w, h)



def cadastrar_rosto(nome):
    cap = cv2.VideoCapture(0)
    db = _load_db()

    print("Pressione ESPAÇO para capturar o rosto")

    while True:
        ret, frame = cap.read()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        face, box = _extract_face(gray)

        if box:
            x, y, w, h = box
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

        cv2.imshow("Cadastro", frame)

        key = cv2.waitKey(1)
        if key == 32 and face is not None:
            db[nome] = face.tolist()
            _save_db(db)
            break

    cap.release()
    cv2.destroyAllWindows()


def reconhecer_rosto():
    cap = cv2.VideoCapture(0)
    db = _load_db()

    if not db:
        print("Base vazia")
        return

    while True:
        ret, frame = cap.read()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        face, box = _extract_face(gray)

        if face is not None and box is not None:
            x, y, w, h = box
            nome_reconhecido = "Desconhecido"

            for nome, data in db.items():
                stored = np.array(data)
                diff = np.mean((stored - face) ** 2)

                if diff < 2000:
                    nome_reconhecido = nome
                    break

            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(
                frame,
                nome_reconhecido,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 255, 0),
                2
            )

        cv2.imshow("Reconhecimento", frame)

        if cv2.waitKey(1) == 27:  # ESC
            break

    cap.release()
    cv2.destroyAllWindows()
