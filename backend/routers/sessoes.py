from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

from database import get_db, Sessao, RegistroFluido, RecomendacaoIA, Usuario
from routers.auth import get_current_user, require_profissional
from services.calculo import calcular_taxa_sudorese
from services.ia import obter_recomendacao

router = APIRouter()


# ── SCHEMAS ─────────────────────────────────

class PreTreinoInput(BaseModel):
    peso_pre: float = Field(gt=0, lt=300)
    temp_celsius: Optional[float] = Field(default=25.0)
    umidade_pct: Optional[float] = Field(default=60.0)
    cor_urina_basal: Optional[int] = Field(default=2)


class PosTreinoInput(BaseModel):
    sessao_id: int
    peso_pos: float
    condicao_vestimenta: Literal["seco", "umido", "encharcado"]
    duracao_minutos: float


class SessaoResponse(BaseModel):
    id: int
    status: str
    peso_pre: Optional[float]
    peso_pos: Optional[float]
    ingestao_ml: Optional[float]
    taxa_sudorese: Optional[float]
    variacao_peso_pct: Optional[float]
    criado_em: datetime

    class Config:
        from_attributes = True


# ── PRE TREINO (🔥 ESSA É A QUE VOCÊ USA)

@router.post("/pre-treino", response_model=SessaoResponse)
def iniciar_pre_treino(
    body: PreTreinoInput,
    db: Session = Depends(get_db),
):
    sessao = Sessao(
        atleta_id=1,
        peso_pre=body.peso_pre,
        temp_celsius=body.temp_celsius,
        umidade_pct=body.umidade_pct,
        cor_urina_basal=body.cor_urina_basal,
        ingestao_ml=0,
        status="durante",
    )

    db.add(sessao)
    db.commit()
    print({
    "id": sessao.id,
    "peso_pre": sessao.peso_pre,
    "status": sessao.status
})
    db.refresh(sessao)

    return sessao