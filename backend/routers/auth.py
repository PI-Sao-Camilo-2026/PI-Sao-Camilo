from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
import random, string

from database import get_db, Usuario
from dependencies import get_current_user
from services.auth_service import (
    hash_senha,
    autenticar_usuario,
    criar_access_token,
    criar_refresh_token,
    decodificar_token,
    buscar_usuario_por_id,
)

router = APIRouter()


class RegistroInput(BaseModel):
    nome: str
    email: EmailStr
    senha: str = Field(min_length=6)
    tipo: Literal["atleta", "profissional"]
    sexo: Optional[str] = None
    modalidade: Optional[str] = None
    profissional_id: Optional[int] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    tipo_usuario: str
    usuario_id: int
    nome: str


class RefreshInput(BaseModel):
    refresh_token: str



@router.post("/registrar", response_model=TokenResponse, status_code=201)
def registrar(body: RegistroInput, db: Session = Depends(get_db)):
    """Cria um novo usuário e retorna tokens de acesso."""

    if db.query(Usuario).filter(Usuario.email == body.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado",
        )

    codigo = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

    user = Usuario(
        nome=body.nome,
        email=body.email,
        senha_hash=hash_senha(body.senha),
        tipo=body.tipo,
        sexo=body.sexo,
        modalidade=body.modalidade,
        profissional_id=body.profissional_id,
        codigo_anonimizado=codigo,
        ativo=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=criar_access_token(user.id, user.tipo),
        refresh_token=criar_refresh_token(user.id),
        tipo_usuario=user.tipo,
        usuario_id=user.id,
        nome=user.nome,
    )


@router.post("/login", response_model=TokenResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login com e-mail e senha."""
    user = autenticar_usuario(db, form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
        )

    return TokenResponse(
        access_token=criar_access_token(user.id, user.tipo),
        refresh_token=criar_refresh_token(user.id),
        tipo_usuario=user.tipo,
        usuario_id=user.id,
        nome=user.nome,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshInput, db: Session = Depends(get_db)):
    """Renova o access token usando o refresh token."""
    payload = decodificar_token(body.refresh_token)
    if not payload or payload.get("token_type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido",
        )
    user = buscar_usuario_por_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
        )

    return TokenResponse(
        access_token=criar_access_token(user.id, user.tipo),
        refresh_token=criar_refresh_token(user.id),
        tipo_usuario=user.tipo,
        usuario_id=user.id,
        nome=user.nome,
    )