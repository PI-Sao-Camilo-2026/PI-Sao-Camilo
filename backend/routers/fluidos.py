from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, RegistroFluido, Sessao
from dependencies import get_current_user
from database import Usuario

router = APIRouter()

@router.get("/sessao/{sessao_id}")
def fluidos_da_sessao(
    sessao_id: int,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    
    sessao = db.query(Sessao).filter(
        Sessao.id == sessao_id,
        Sessao.atleta_id == current.id,
    ).first()

    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    registros = (
        db.query(RegistroFluido)
        .filter(RegistroFluido.sessao_id == sessao_id)
        .order_by(RegistroFluido.registrado_em)
        .all()
    )

    total = sum(r.volume_ml for r in registros)

    return {
        "sessao_id": sessao_id,
        "total_ml":  total,
        "registros": [
            {
                "id":            r.id,
                "volume_ml":     r.volume_ml,
                "registrado_em": r.registrado_em.isoformat(),
            }
            for r in registros
        ],
    }