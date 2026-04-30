from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import Usuario
import os


SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


def verificar_senha(senha: str, hash: str) -> bool:
    return pwd_context.verify(senha, hash)


def criar_token(data: dict, expires_delta: timedelta) -> str:
    payload = data.copy()
    now = datetime.utcnow()

    payload.update({
        "exp": now + expires_delta,
        "iat": now,
        "nbf": now
    })

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def criar_access_token(user_id: int, tipo: str) -> str:
    return criar_token(
        {"sub": str(user_id), "tipo": tipo, "token_type": "access"},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def criar_refresh_token(user_id: int) -> str:
    return criar_token(
        {"sub": str(user_id), "token_type": "refresh"},
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decodificar_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        print(f"Erro ao decodificar token: {e}")
        return None


def autenticar_usuario(db: Session, email: str, senha: str) -> Optional[Usuario]:
    user = db.query(Usuario).filter(Usuario.email == email, Usuario.ativo == True).first()
    if not user or not verificar_senha(senha, user.senha_hash):
        return None
    return user


def buscar_usuario_por_id(db: Session, user_id: int) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.id == user_id, Usuario.ativo == True).first()