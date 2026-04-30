from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db, RegistroFluido, Usuario
from routers.auth import get_current_user

router = APIRouter()


@router.get("/sessao/{sessao_id}")
def fluidos_da_sessao(
    sessao_id: int,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    registros = (
        db.query(RegistroFluido)
        .filter(RegistroFluido.sessao_id == sessao_id)
        .order_by(RegistroFluido.registrado_em)
        .all()
    )

    total = sum(r.volume_ml for r in registros)

    return {
        "sessao_id": sessao_id,
        "total_ml": total,
        "registros": [
            {
                "id": r.id,
                "volume_ml": r.volume_ml,
                "registrado_em": r.registrado_em.isoformat()
            }
            for r in registros
        ],
    }