from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db, Usuario
from services.auth_service import decodificar_token, buscar_usuario_por_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    payload = decodificar_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Token sem usuário"
        )

    try:
        user_id = int(user_id)
    except:
        raise HTTPException(
            status_code=401,
            detail="Token corrompido"
        )

    user = buscar_usuario_por_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Usuário não existe"
        )

    return user

def require_profissional(
    current: Usuario = Depends(get_current_user),
) -> Usuario:
    """Garante que o usuário logado é um profissional."""
    if current.tipo != "profissional":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a profissionais",
        )
    return current