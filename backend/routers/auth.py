from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db, Usuario
from services.auth_service import (
    hash_senha, autenticar_usuario, criar_access_token,
    criar_refresh_token, decodificar_token, buscar_usuario_por_id,
)
from typing import Literal
from pydantic import Field

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class RegistroInput(BaseModel):
    nome: str
    email: EmailStr
    senha: str = Field(min_length=6)    
    tipo: Literal["atleta", "profissional"]    
    sexo: Optional[str] = None
    modalidade: Optional[str] = None
    profissional_id: Optional[int] = None  # para atletas criados por profissional


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    tipo_usuario: str
    usuario_id: int
    nome: str


class RefreshInput(BaseModel):
    refresh_token: str


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    payload = decodificar_token(token)
    if not payload or payload.get("token_type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    user = buscar_usuario_por_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user


def require_profissional(current: Usuario = Depends(get_current_user)) -> Usuario:
    if current.tipo != "profissional":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito a profissionais")
    return current


@router.post("/registrar", response_model=TokenResponse, status_code=201)
def registrar(body: RegistroInput, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == body.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    if body.tipo not in ("atleta", "profissional"):
        raise HTTPException(status_code=400, detail="Tipo inválido: use 'atleta' ou 'profissional'")

    user = Usuario(
        nome=body.nome,
        email=body.email,
        senha_hash=hash_senha(body.senha),
        tipo=body.tipo,
        sexo=body.sexo,
        modalidade=body.modalidade,
        profissional_id=body.profissional_id,
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
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = autenticar_usuario(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    return TokenResponse(
        access_token=criar_access_token(user.id, user.tipo),
        refresh_token=criar_refresh_token(user.id),
        tipo_usuario=user.tipo,
        usuario_id=user.id,
        nome=user.nome,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshInput, db: Session = Depends(get_db)):
    payload = decodificar_token(body.refresh_token)
    if not payload or payload.get("token_type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido")
    user = buscar_usuario_por_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")

    return TokenResponse(
        access_token=criar_access_token(user.id, user.tipo),
        refresh_token=criar_refresh_token(user.id),
        tipo_usuario=user.tipo,
        usuario_id=user.id,
        nome=user.nome,
    )


@router.get("/me")
def me(current: Usuario = Depends(get_current_user)):
    return {
        "id": current.id,
        "nome": current.nome,
        "email": current.email,
        "tipo": current.tipo,
        "sexo": current.sexo,
        "modalidade": current.modalidade,
    }