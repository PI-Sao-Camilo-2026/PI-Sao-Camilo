"""
routers/sessoes.py
Fluxo completo: pré-treino → fluidos → pós-treino → histórico.
"""
from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.orm import Session

from database import (
    get_db, Sessao, RegistroFluido, RecomendacaoIA, Usuario
)
from dependencies import get_current_user, require_profissional
from services.calculo import calcular_taxa_sudorese
from services.ia import obter_recomendacao

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class PreTreinoInput(BaseModel):
    peso_pre: float = Field(gt=0, lt=300)
    temp_celsius: Optional[float] = Field(default=None, ge=-10, le=60)
    umidade_pct: Optional[float] = Field(default=None, ge=0, le=100)
    cor_urina_basal: Optional[int] = Field(default=None, ge=1, le=8)
    sensacao_termica: Optional[float] = None
    vento: Optional[float] = None
    radiacao: Optional[float] = None
    condicao: Optional[str] = None
    sol: Optional[str] = None
    bexiga_esvaziada: Optional[bool] = False
    vestimenta_padrao: Optional[bool] = False
    modalidade: Optional[str] = None
    duracao: Optional[float] = None
    intensidade: Optional[str] = None
    vestimenta: Optional[str] = None
    sede: Optional[str] = None
    sintomas: Optional[str] = None
    hidratacao: Optional[str] = None


class FinalizarInput(BaseModel):
    tempo_total_segundos: Optional[int] = None
    ingestao_ml: Optional[float] = 0
    volume_urina_ml: Optional[float] = 0


class PosTreinoInput(BaseModel):
    sessao_id: int
    peso_pos: float = Field(gt=0, lt=300)
    condicao_vestimenta: Literal["seco", "umido", "encharcado"]
    duracao_minutos: float = Field(gt=0, lt=1440)
    total_ingerido_ml: Optional[float] = 0
    isotonicos_ml: Optional[float] = 0
    outros_ml: Optional[float] = 0
    volume_urina_ml: Optional[float] = 0
    gel_g: Optional[float] = 0
    fruta_g: Optional[float] = 0
    gasto_energetico_kcal: Optional[float] = None
    ingestao_energetica_kcal: Optional[float] = None


class SessaoResponse(BaseModel):
    id: int
    status: str
    peso_pre: Optional[float]
    peso_pos: Optional[float]
    ingestao_ml: Optional[float]
    taxa_sudorese: Optional[float]
    variacao_peso_pct: Optional[float]
    duracao_minutos: Optional[float]
    modalidade: Optional[str]
    intensidade: Optional[str]
    criado_em: datetime

    class Config:
        from_attributes = True


# ── ATENÇÃO: rotas fixas ANTES das rotas com parâmetro ───────────────────────
# /historico, /historico/stats e /atleta/{id} devem vir antes de /{sessao_id}
# para o FastAPI não tentar converter "historico" como inteiro.

# ── Histórico ─────────────────────────────────────────────────────────────────

@router.get("/historico", response_model=List[SessaoResponse])
def historico(
    limit: int = 20,
    offset: int = 0,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Histórico de sessões concluídas do atleta logado."""
    return (
        db.query(Sessao)
        .filter(Sessao.atleta_id == current.id, Sessao.status == "concluida")
        .order_by(desc(Sessao.criado_em))
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/historico/stats")
def historico_stats(
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Estatísticas consolidadas do atleta logado."""
    sessoes = (
        db.query(Sessao)
        .filter(Sessao.atleta_id == current.id, Sessao.status == "concluida")
        .order_by(desc(Sessao.criado_em))
        .all()
    )

    taxas  = [s.taxa_sudorese    for s in sessoes if s.taxa_sudorese]
    perdas = [s.variacao_peso_pct for s in sessoes if s.variacao_peso_pct]

    return {
        "total_sessoes":    len(sessoes),
        "taxa_media":       round(sum(taxas) / len(taxas), 2)   if taxas  else None,
        "taxa_maxima":      round(max(taxas), 2)                 if taxas  else None,
        "maior_perda_pct":  round(max(perdas), 2)                if perdas else None,
        "sessoes_por_mes":  _agregar_por_mes(sessoes),
    }


# ── Profissional: sessões de um atleta ───────────────────────────────────────

@router.get("/atleta/{atleta_id}", response_model=List[SessaoResponse])
def sessoes_de_atleta(
    atleta_id: int,
    limit: int = 50,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """Sessões de um atleta vinculado ao profissional."""
    atleta = db.query(Usuario).filter(
        Usuario.id == atleta_id,
        Usuario.profissional_id == prof.id,
    ).first()

    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")

    return (
        db.query(Sessao)
        .filter(Sessao.atleta_id == atleta_id, Sessao.status == "concluida")
        .order_by(desc(Sessao.criado_em))
        .limit(limit)
        .all()
    )


# ── Pré-treino ────────────────────────────────────────────────────────────────

@router.post("/pre-treino")
def iniciar_pre_treino(
    body: PreTreinoInput,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Inicia nova sessão com dados do pré-treino."""
    sessao = Sessao(
        atleta_id=current.id,
        peso_pre=body.peso_pre,
        temp_celsius=body.temp_celsius,
        umidade_pct=body.umidade_pct,
        cor_urina_basal=body.cor_urina_basal,
        sensacao_termica=body.sensacao_termica,
        vento=body.vento,
        radiacao=body.radiacao,
        condicao=body.condicao,
        sol=body.sol,
        bexiga_esvaziada=body.bexiga_esvaziada,
        vestimenta_padrao=body.vestimenta_padrao,
        modalidade=body.modalidade,
        duracao=body.duracao,
        intensidade=body.intensidade,
        vestimenta=body.vestimenta,
        sede=body.sede,
        sintomas=body.sintomas,
        hidratacao=body.hidratacao,
        ingestao_ml=0,
        status="durante",
    )
    db.add(sessao)
    db.commit()
    db.refresh(sessao)
    logger.info("Sessão %s iniciada para atleta %s", sessao.id, current.id)
    return {"id": sessao.id, "status": sessao.status, "atleta_id": sessao.atleta_id}


# ── Fluido (durante) ──────────────────────────────────────────────────────────

@router.post("/{sessao_id}/fluido")
def registrar_fluido(
    sessao_id: int,
    volume_ml: float,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra ingestão de fluido durante o treino."""
    sessao = _get_sessao_atleta(db, sessao_id, current.id)

    if sessao.status != "durante":
        raise HTTPException(status_code=400, detail="Sessão não está em andamento")

    if volume_ml < 0:
        # Ajuste negativo (usuário desfez um registro)
        sessao.ingestao_ml = max(0, (sessao.ingestao_ml or 0) + volume_ml)
    else:
        db.add(RegistroFluido(sessao_id=sessao_id, volume_ml=volume_ml))
        sessao.ingestao_ml = (sessao.ingestao_ml or 0) + volume_ml

    db.commit()
    return {"ingestao_total_ml": sessao.ingestao_ml}


# ── Finalizar durante (sem cálculo de taxa) ───────────────────────────────────

@router.post("/{sessao_id}/finalizar")
def finalizar_durante(
    sessao_id: int,
    body: FinalizarInput,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fecha a etapa 'durante' — dados básicos, sem cálculo de taxa."""
    sessao = _get_sessao_atleta(db, sessao_id, current.id)

    sessao.tempo_total_segundos = body.tempo_total_segundos
    sessao.ingestao_ml          = body.ingestao_ml or sessao.ingestao_ml or 0
    sessao.volume_urina_ml      = body.volume_urina_ml or 0
    sessao.status               = "pos"

    db.commit()
    db.refresh(sessao)

    return {
        "ok": True,
        "sessao": {
            "id":                    sessao.id,
            "atleta_id":             sessao.atleta_id,
            "status":                sessao.status,
            "ingestao_ml":           sessao.ingestao_ml,
            "volume_urina_ml":       sessao.volume_urina_ml,
            "tempo_total_segundos":  sessao.tempo_total_segundos,
        },
    }


# ── Pós-treino (com cálculo de taxa + IA) ─────────────────────────────────────

@router.post("/pos-treino")
async def finalizar_pos_treino(
    body: PosTreinoInput,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Finaliza a sessão calculando taxa de sudorese e obtendo
    recomendação personalizada da IA.
    """
    sessao = _get_sessao_atleta(db, body.sessao_id, current.id)

    # Cálculo da taxa
    try:
        resultado = calcular_taxa_sudorese(
            peso_pre=sessao.peso_pre,
            peso_pos=body.peso_pos,
            ingestao_ml=sessao.ingestao_ml or 0,
            duracao_minutos=body.duracao_minutos,
            condicao_vestimenta=body.condicao_vestimenta,
            urina_ml=body.volume_urina_ml or 0,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Salva pós-treino
    sessao.peso_pos            = body.peso_pos
    sessao.condicao_vestimenta = body.condicao_vestimenta
    sessao.duracao_minutos     = body.duracao_minutos
    sessao.volume_urina_ml     = body.volume_urina_ml or 0
    sessao.taxa_sudorese       = resultado["taxa_sudorese"]
    sessao.variacao_peso_pct   = resultado["variacao_peso_pct"]
    sessao.status              = "concluida"

    # Histórico para contexto da IA (últimas 10 sessões)
    historico_taxas = [
        h[0] for h in (
            db.query(Sessao.taxa_sudorese)
            .filter(
                Sessao.atleta_id == current.id,
                Sessao.taxa_sudorese.isnot(None),
                Sessao.id != sessao.id,
            )
            .order_by(desc(Sessao.criado_em))
            .limit(10)
            .all()
        )
    ]

    # Recomendação da IA
    rec = await obter_recomendacao(
        taxa_l_h=resultado["taxa_sudorese"],
        variacao_pct=resultado["variacao_peso_pct"],
        temp_celsius=sessao.temp_celsius,
        umidade_pct=sessao.umidade_pct,
        modalidade=sessao.modalidade or current.modalidade,
        historico_taxas=historico_taxas,
        duracao_segundos=sessao.tempo_total_segundos,
    )

    # Persiste recomendação
    recomendacao = RecomendacaoIA(
        sessao_id=sessao.id,
        texto=rec.get("texto_ia") or rec["texto"],
        ingestao_recomendada_ml_h=rec["ingestao_recomendada_ml_h"],
        intervalo_minutos=rec["intervalo_minutos"],
    )
    db.add(recomendacao)
    db.commit()
    db.refresh(sessao)

    logger.info(
        "Sessão %s concluída — taxa %.2f L/h, variação %.1f%%",
        sessao.id, sessao.taxa_sudorese, sessao.variacao_peso_pct,
    )

    return {
        "sessao_id":         sessao.id,
        "taxa_sudorese":     sessao.taxa_sudorese,
        "variacao_peso_pct": sessao.variacao_peso_pct,
        "recomendacao":      rec,
    }


# ── Detalhe de uma sessão ─────────────────────────────────────────────────────
# IMPORTANTE: esta rota com parâmetro dinâmico fica por ÚLTIMO
# para não engolir /historico, /historico/stats e /atleta/{id}

@router.get("/{sessao_id}")
def detalhe_sessao(
    sessao_id: int,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna detalhe de uma sessão com recomendação."""
    sessao = _get_sessao_atleta(db, sessao_id, current.id)

    rec = (
        db.query(RecomendacaoIA)
        .filter(RecomendacaoIA.sessao_id == sessao_id)
        .first()
    )

    return {
        "sessao": {
            "id":                sessao.id,
            "status":            sessao.status,
            "peso_pre":          sessao.peso_pre,
            "peso_pos":          sessao.peso_pos,
            "ingestao_ml":       sessao.ingestao_ml,
            "taxa_sudorese":     sessao.taxa_sudorese,
            "variacao_peso_pct": sessao.variacao_peso_pct,
            "duracao_minutos":   sessao.duracao_minutos,
            "modalidade":        sessao.modalidade,
            "criado_em":         sessao.criado_em.isoformat() if sessao.criado_em else None,
        },
        "recomendacao": {
            "texto":                     rec.texto,
            "ingestao_recomendada_ml_h": rec.ingestao_recomendada_ml_h,
            "intervalo_minutos":         rec.intervalo_minutos,
        } if rec else None,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_sessao_atleta(db: Session, sessao_id: int, atleta_id: int) -> Sessao:
    """Busca sessão garantindo que pertence ao atleta logado."""
    s = db.query(Sessao).filter(
        Sessao.id == sessao_id,
        Sessao.atleta_id == atleta_id,
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return s


def _agregar_por_mes(sessoes: list) -> list:
    """Agrupa taxa média por mês para o gráfico do histórico."""
    meses: dict[str, list] = defaultdict(list)
    for s in sessoes:
        if s.taxa_sudorese and s.criado_em:
            chave = s.criado_em.strftime("%Y-%m")
            meses[chave].append(s.taxa_sudorese)
    return [
        {"mes": k, "taxa_media": round(sum(v) / len(v), 2)}
        for k, v in sorted(meses.items())
    ]