from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from collections import defaultdict

from database import get_db, Sessao, RegistroFluido, RecomendacaoIA, Usuario
from dependencies import get_current_user, require_profissional  # ✅ CORRIGIDO: de dependencies.py
from services.calculo import calcular_taxa_sudorese
from services.ia import obter_recomendacao

router = APIRouter()

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
    duracao_minutos: float = Field(gt=0, lt=500)
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
    criado_em: datetime

    class Config:
        from_attributes = True


@router.get("/historico", response_model=List[SessaoResponse])
def historico(
    limit: int = 20,
    offset: int = 0,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
    sessoes = (
        db.query(Sessao)
        .filter(Sessao.atleta_id == current.id, Sessao.status == "concluida")
        .all()
    )

    taxas  = [s.taxa_sudorese    for s in sessoes if s.taxa_sudorese]
    perdas = [s.variacao_peso_pct for s in sessoes if s.variacao_peso_pct]

    return {
        "total_sessoes": len(sessoes),
        "taxa_media":    round(sum(taxas)  / len(taxas),  2) if taxas  else None,
        "taxa_maxima":   round(max(taxas),                2) if taxas  else None,
        "maior_perda_pct": round(max(perdas),             2) if perdas else None,
        "sessoes_por_mes": _agregar_por_mes(sessoes),
    }


@router.get("/atleta/{atleta_id}", response_model=List[SessaoResponse])
def sessoes_de_atleta(
    atleta_id: int,
    limit: int = 30,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
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



@router.post("/pre-treino")
def iniciar_pre_treino(
    body: PreTreinoInput,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
    return sessao

@router.post("/{sessao_id}/fluido")
def registrar_fluido(
    sessao_id: int,
    volume_ml: float,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessao = _get_sessao_atleta(db, sessao_id, current.id)

    if sessao.status != "durante":
        raise HTTPException(status_code=400, detail="Sessão não está em andamento")

    db.add(RegistroFluido(sessao_id=sessao_id, volume_ml=volume_ml))
    sessao.ingestao_ml = (sessao.ingestao_ml or 0) + volume_ml
    db.commit()

    return {"ingestao_total_ml": sessao.ingestao_ml}



@router.post("/{sessao_id}/finalizar")
def finalizar_sessao(
    sessao_id: int,
    body: FinalizarInput,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessao = _get_sessao_atleta(db, sessao_id, current.id)

    sessao.tempo_total_segundos = body.tempo_total_segundos
    sessao.ingestao_ml          = body.ingestao_ml
    sessao.volume_urina_ml      = body.volume_urina_ml
    sessao.status               = "concluida"

    db.commit()
    db.refresh(sessao)

    return {
        "ok": True,
        "sessao": {
            "id":                    sessao.id,
            "atleta_id":             sessao.atleta_id,
            "peso_pre":              sessao.peso_pre,
            "peso_pos":              sessao.peso_pos,
            "tempo_total_segundos":  sessao.tempo_total_segundos,
            "ingestao_ml":           sessao.ingestao_ml,
            "volume_urina_ml":       sessao.volume_urina_ml,
            "status":                sessao.status,
            "taxa_sudorese":         sessao.taxa_sudorese,
            "variacao_peso_pct":     sessao.variacao_peso_pct,
            "criado_em":             sessao.criado_em,
            "atualizado_em":         sessao.atualizado_em,
        },
    }



@router.post("/pos-treino")
async def finalizar_pos_treino(
    body: PosTreinoInput,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessao = _get_sessao_atleta(db, body.sessao_id, current.id)

    try:
        resultado = calcular_taxa_sudorese(
            peso_pre=sessao.peso_pre,
            peso_pos=body.peso_pos,
            ingestao_ml=sessao.ingestao_ml or 0,
            duracao_minutos=body.duracao_minutos,
            condicao_vestimenta=body.condicao_vestimenta,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    sessao.peso_pos            = body.peso_pos
    sessao.condicao_vestimenta = body.condicao_vestimenta
    sessao.duracao_minutos     = body.duracao_minutos
    sessao.taxa_sudorese       = resultado["taxa_sudorese"]
    sessao.variacao_peso_pct   = resultado["variacao_peso_pct"]
    sessao.status              = "concluida"

    historico_taxas = [
        h[0] for h in (
            db.query(Sessao.taxa_sudorese)
            .filter(Sessao.atleta_id == current.id, Sessao.taxa_sudorese != None)
            .order_by(desc(Sessao.criado_em))
            .limit(10)
            .all()
        )
    ]

    rec = await obter_recomendacao(
        taxa_l_h=resultado["taxa_sudorese"],
        variacao_pct=resultado["variacao_peso_pct"],
        temp_celsius=sessao.temp_celsius,
        umidade_pct=sessao.umidade_pct,
        modalidade=current.modalidade,
        historico_taxas=historico_taxas,
    )

    db.add(RecomendacaoIA(
        sessao_id=sessao.id,
        texto=rec.get("texto_ia") or rec["texto"],
        ingestao_recomendada_ml_h=rec["ingestao_recomendada_ml_h"],
        intervalo_minutos=rec["intervalo_minutos"],
    ))
    db.commit()
    db.refresh(sessao)

    return {
        "sessao_id":         sessao.id,
        "taxa_sudorese":     sessao.taxa_sudorese,
        "variacao_peso_pct": sessao.variacao_peso_pct,
        "recomendacao":      rec,
    }

@router.get("/{sessao_id}")
def detalhe_sessao(
    sessao_id: int,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
            "criado_em":         sessao.criado_em.isoformat(),
        },
        "recomendacao": {
            "texto":                     rec.texto,
            "ingestao_recomendada_ml_h": rec.ingestao_recomendada_ml_h,
            "intervalo_minutos":         rec.intervalo_minutos,
        } if rec else None,
    }



def _get_sessao_atleta(db: Session, sessao_id: int, atleta_id: int) -> Sessao:
    s = db.query(Sessao).filter(
        Sessao.id == sessao_id,
        Sessao.atleta_id == atleta_id,
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return s


def _agregar_por_mes(sessoes: list) -> list:
    meses = defaultdict(list)
    for s in sessoes:
        if s.taxa_sudorese and s.criado_em:
            meses[s.criado_em.strftime("%Y-%m")].append(s.taxa_sudorese)
    return [
        {"mes": k, "taxa_media": round(sum(v) / len(v), 2)}
        for k, v in sorted(meses.items())
    ]