from fastapi import FastAPI
from app.routers.face import router

app = FastAPI(
    title="Microsserviço de Reconhecimento Facial (OpenCV)",
    version="1.0.0"
)

app.include_router(router)
