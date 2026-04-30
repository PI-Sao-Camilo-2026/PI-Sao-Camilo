from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Literal
import random
import string

from database import get_db, Usuario
from services.auth_service import hash_senha

router = APIRouter()

# ─── SCHEMAS ─────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str = Field(min_length=6)
    tipo: Literal["atleta", "profissional"]


class UsuarioOut(BaseModel):
    id: int
    nome: str
    email: str
    tipo: str
    codigo_anonimizado: str


# ─── HELPERS ─────────────────────────────────────────

def gerar_codigo():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


# ─── ENDPOINT ───────────────────────────────────────

@router.post("/cadastro", response_model=UsuarioOut)
def cadastrar_usuario(dados: UsuarioCreate, db: Session = Depends(get_db)):

    existente = db.query(Usuario).filter(Usuario.email == dados.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    codigo = gerar_codigo()

    user = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=hash_senha(dados.senha),
        tipo=dados.tipo,
        codigo_anonimizado=codigo,
        ativo=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return UsuarioOut(
        id=user.id,
        nome=user.nome,
        email=user.email,
        tipo=user.tipo,
        codigo_anonimizado=user.codigo_anonimizado
    )