"""
routers/predicao.py

Endpoints de Machine Learning — Random Forest (RF14)
Prefixo: /predicao
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, Sessao, Usuario
from dependencies import get_current_user, require_profissional
from services.ml_predicao import (
    treinar_modelo,
    prever_taxa_sudorese,
    modelo_disponivel,
    MIN_SESSOES,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class PredicaoInput(BaseModel):
    peso_pre: float = Field(gt=0, lt=300, description="Peso pré-treino em kg")
    temp_celsius: Optional[float] = Field(default=None, ge=-10, le=60)
    umidade_pct: Optional[float] = Field(default=None, ge=0, le=100)
    duracao: Optional[float] = Field(default=None, gt=0, description="Duração prevista em minutos")
    intensidade: Optional[str] = None
    modalidade: Optional[str] = None
    cor_urina_basal: Optional[int] = Field(default=None, ge=1, le=8)


class PredicaoResponse(BaseModel):
    disponivel: bool
    taxa_prevista: Optional[float] = None
    confianca: Optional[str] = None
    sessoes_usadas: Optional[int] = None
    sessoes_necessarias: int = MIN_SESSOES
    mensagem: str


# ── Helper ────────────────────────────────────────────────────────────────────

def _sessao_para_dict(s: Sessao) -> dict:
    return {
        "peso_pre":        s.peso_pre,
        "temp_celsius":    s.temp_celsius,
        "umidade_pct":     s.umidade_pct,
        "duracao":         s.duracao,
        "duracao_minutos": s.duracao_minutos,
        "intensidade":     s.intensidade,
        "modalidade":      s.modalidade,
        "cor_urina_basal": s.cor_urina_basal,
        "taxa_sudorese":   s.taxa_sudorese,
    }


def _buscar_sessoes_atleta(atleta_id: int, db: Session) -> list[dict]:
    sessoes = (
        db.query(Sessao)
        .filter(
            Sessao.atleta_id == atleta_id,
            Sessao.status == "concluida",
            Sessao.taxa_sudorese.isnot(None),
        )
        .order_by(desc(Sessao.criado_em))
        .all()
    )
    return [_sessao_para_dict(s) for s in sessoes]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/prever", response_model=PredicaoResponse)
def prever(
    body: PredicaoInput,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    RF14: Retorna a predição de taxa de sudorese para o atleta logado
    antes de iniciar uma nova sessão. Usa os dados pré-treino como features.
    Ativado apenas quando há >= 8 sessões históricas (RNF10).
    """
    atleta_id = current.id
    sessoes = _buscar_sessoes_atleta(atleta_id, db)
    n_sessoes = len(sessoes)

    # Treina / re-treina o modelo com o histórico atual
    # (re-treino incremental: rápido pois RF é fit completo de qualquer forma)
    if n_sessoes >= MIN_SESSOES:
        treinar_modelo(atleta_id, sessoes)

    if not modelo_disponivel(atleta_id):
        return PredicaoResponse(
            disponivel=False,
            sessoes_necessarias=MIN_SESSOES,
            mensagem=(
                f"Predição indisponível: você possui {n_sessoes} sessão(ões) registrada(s). "
                f"Complete mais {MIN_SESSOES - n_sessoes} para ativar este recurso."
            ),
        )

    resultado = prever_taxa_sudorese(
        atleta_id=atleta_id,
        peso_pre=body.peso_pre,
        temp_celsius=body.temp_celsius,
        umidade_pct=body.umidade_pct,
        duracao=body.duracao,
        intensidade=body.intensidade,
        modalidade=body.modalidade or current.modalidade,
        cor_urina_basal=body.cor_urina_basal,
    )

    if not resultado:
        return PredicaoResponse(
            disponivel=False,
            sessoes_necessarias=MIN_SESSOES,
            mensagem="Modelo não disponível. Tente novamente após registrar mais sessões.",
        )

    confianca_label = {
        "alta":  "Alta — estimativa confiável com base no seu histórico",
        "media": "Média — estimativa razoável, mas com alguma variação esperada",
        "baixa": "Baixa — histórico ainda reduzido; a predição pode variar",
    }.get(resultado["confianca"], "")

    return PredicaoResponse(
        disponivel=True,
        taxa_prevista=resultado["taxa_prevista"],
        confianca=resultado["confianca"],
        sessoes_usadas=n_sessoes,
        sessoes_necessarias=MIN_SESSOES,
        mensagem=confianca_label,
    )


@router.post("/treinar", response_model=dict)
def treinar_manualmente(
    atleta_id: int,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """
    Endpoint para o profissional forçar o re-treino do modelo de um atleta.
    Útil após importação de dados históricos em lote.
    """
    atleta = db.query(Usuario).filter(
        Usuario.id == atleta_id,
        Usuario.profissional_id == prof.id,
    ).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")

    sessoes = _buscar_sessoes_atleta(atleta_id, db)
    sucesso = treinar_modelo(atleta_id, sessoes)

    if not sucesso:
        return {
            "ok": False,
            "sessoes_encontradas": len(sessoes),
            "sessoes_necessarias": MIN_SESSOES,
            "mensagem": f"Atleta possui apenas {len(sessoes)} sessão(ões). Mínimo: {MIN_SESSOES}.",
        }

    return {
        "ok": True,
        "sessoes_usadas": len(sessoes),
        "mensagem": f"Modelo re-treinado com sucesso usando {len(sessoes)} sessões.",
    }


@router.get("/status")
def status_modelo(
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna status do modelo ML e, se houver sessões suficientes,
    treina automaticamente e retorna a predição para o próximo treino.
    """
    sessoes = _buscar_sessoes_atleta(current.id, db)
    n_sessoes = len(sessoes)

    # Auto-treina se tiver sessões suficientes e modelo ainda não existir
    if n_sessoes >= MIN_SESSOES and not modelo_disponivel(current.id):
        treinar_modelo(current.id, sessoes)

    disponivel = modelo_disponivel(current.id)

    resposta = {
        "modelo_disponivel":   disponivel,
        "sessoes_registradas": n_sessoes,
        "sessoes_necessarias": MIN_SESSOES,
        "pronto":              n_sessoes >= MIN_SESSOES,
        "faltam":              max(0, MIN_SESSOES - n_sessoes),
        "predicao":            None,
    }

    # Se modelo disponível, retorna predição já pronta usando última sessão como referência
    if disponivel and sessoes:
        ultima = sessoes[0]
        resultado = prever_taxa_sudorese(
            atleta_id=current.id,
            peso_pre=ultima.get("peso_pre") or 70,
            temp_celsius=ultima.get("temp_celsius"),
            umidade_pct=ultima.get("umidade_pct"),
            duracao=ultima.get("duracao") or ultima.get("duracao_minutos"),
            intensidade=ultima.get("intensidade"),
            modalidade=ultima.get("modalidade") or getattr(current, "modalidade", None),
            cor_urina_basal=ultima.get("cor_urina_basal"),
        )
        if resultado:
            resposta["predicao"] = {
                "disponivel":     True,
                "taxa_prevista":  resultado["taxa_prevista"],
                "confianca":      resultado["confianca"],
                "sessoes_usadas": n_sessoes,
            }

    return resposta