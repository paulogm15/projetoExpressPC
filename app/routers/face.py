from fastapi import APIRouter, UploadFile, File, Form
import tempfile
from app.services.face_service import cadastrar_rosto, reconhecer_rosto

router = APIRouter(prefix="/face", tags=["Reconhecimento Facial"])


@router.post("/cadastrar")
async def cadastrar(nome: str = Form(...), file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(await file.read())
        sucesso = cadastrar_rosto(nome, tmp.name)

    return {"sucesso": sucesso}


@router.post("/reconhecer")
async def reconhecer(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(await file.read())
        nome, confianca = reconhecer_rosto(tmp.name)

    return {
        "reconhecido": nome is not None,
        "nome": nome,
        "confianca": confianca
    }
