from __future__ import annotations
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import Usuario

logger = logging.getLogger(__name__)


_SECRET_KEY_RAW = os.getenv("SECRET_KEY", "")
if not _SECRET_KEY_RAW:
    raise ValueError(
        "SECRET_KEY não definida no .env. "
        "Gere uma com: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

SECRET_KEY    = _SECRET_KEY_RAW
ALGORITHM     = os.getenv("ALGORITHM", "HS256")
ACCESS_EXPIRE = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_EXPIRE= int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS",  "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


def verificar_senha(senha: str, hash: str) -> bool:
    return pwd_context.verify(senha, hash)


def _criar_token(data: dict, expires_delta: timedelta) -> str:
    payload = data.copy()

    agora = datetime.now(timezone.utc)
    payload.update({
        "exp": agora + expires_delta,
        "iat": agora,
        "nbf": agora,
    })
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def criar_access_token(user_id: int, tipo: str) -> str:
    return _criar_token(
        {"sub": str(user_id), "tipo": tipo, "token_type": "access"},
        timedelta(minutes=ACCESS_EXPIRE),
    )


def criar_refresh_token(user_id: int) -> str:
    return _criar_token(
        {"sub": str(user_id), "token_type": "refresh"},
        timedelta(days=REFRESH_EXPIRE),
    )


def decodificar_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        logger.warning("Token inválido: %s", e)
        return None


def autenticar_usuario(
    db: Session, email: str, senha: str
) -> Optional[Usuario]:
    user = (
        db.query(Usuario)
        .filter(Usuario.email == email, Usuario.ativo == True)
        .first()
    )
    if not user or not verificar_senha(senha, user.senha_hash):
        return None
    return user


def buscar_usuario_por_id(db: Session, user_id: int) -> Optional[Usuario]:
    return (
        db.query(Usuario)
        .filter(Usuario.id == user_id, Usuario.ativo == True)
        .first()
    )