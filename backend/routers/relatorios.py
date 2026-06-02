import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, Usuario, Sessao
from dependencies import get_current_user, require_profissional
from exportacao.pdf   import gerar_pdf_sessao
from exportacao.excel import gerar_excel_historico
from exportacao.pdf import gerar_pdf_historico_atleta, gerar_pdf_historico_equipe
from services.calculo import gerar_recomendacao

router = APIRouter()


def _classificar_hidratacao(variacao_pct: float | None) -> dict:
    """
    Classifica o nível de desidratação com base na variação de massa corporal.
    Referência: consenso ACSM/NATA.
    """
    if variacao_pct is None:
        return {"nivel": "Sem dados", "cor": "neutro", "alerta": False}
    if variacao_pct <= 1.0:
        return {"nivel": "Bem hidratado", "cor": "verde", "alerta": False}
    if variacao_pct <= 2.0:
        return {"nivel": "Desidratação leve", "cor": "amarelo", "alerta": False}
    if variacao_pct <= 3.0:
        return {"nivel": "Desidratação moderada", "cor": "laranja", "alerta": True}
    return {"nivel": "Desidratação grave (>3%)", "cor": "vermelho", "alerta": True}

def _nome_arquivo(nome: str) -> str:
    """Normaliza o nome do atleta para usar em nome de arquivo."""
    return nome.strip().replace(" ", "_")


def _buscar_atleta_do_profissional(
    atleta_id: int, prof: Usuario, db: Session
) -> Usuario:
    atleta = db.query(Usuario).filter(
        Usuario.id == atleta_id,
        Usuario.profissional_id == prof.id,
    ).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")
    return atleta


def _buscar_sessoes_concluidas(atleta_id: int, db: Session) -> list:
    return (
        db.query(Sessao)
        .filter(Sessao.atleta_id == atleta_id, Sessao.status == "concluida")
        .order_by(desc(Sessao.criado_em))
        .all()
    )


def _sessao_para_dict(s: Sessao) -> dict:
    classificacao = _classificar_hidratacao(s.variacao_peso_pct)

    # Recomendação de reposição (ml/h) derivada da taxa de sudorese
    recomendacao_ml_h = None
    if s.taxa_sudorese and s.variacao_peso_pct is not None:
        try:
            rec = gerar_recomendacao(s.taxa_sudorese, s.variacao_peso_pct)
            recomendacao_ml_h = rec["ingestao_recomendada_ml_h"]
        except Exception:
            pass

    # Balanço hídrico: ingestão − urina − perda por suor estimada
    balanco_hidrico_ml = None
    if s.ingestao_ml is not None and s.volume_urina_ml is not None and s.taxa_sudorese is not None and s.duracao_minutos:
        perda_suor_ml = s.taxa_sudorese * (s.duracao_minutos / 60) * 1000
        balanco_hidrico_ml = round(s.ingestao_ml - s.volume_urina_ml - perda_suor_ml, 1)

    return {
        "id":                    s.id,
        "data":                  s.criado_em,
        "criada_em":             s.criado_em,
        "modalidade":            s.modalidade,
        "duracao_real_min":      s.duracao_minutos,
        "intensidade_percebida": None,
        "temperatura_c":         s.temp_celsius,
        "umidade_pct":           s.umidade_pct,
        "massa_pre_kg":          s.peso_pre,
        "massa_pos_kg":          s.peso_pos,
        "total_ingestao_ml":     s.ingestao_ml,
        "total_urina_ml":        s.volume_urina_ml,
        "perda_ajustada_l":      None,
        "taxa_sudorese_lh":      s.taxa_sudorese,
        "variacao_massa_pct":    s.variacao_peso_pct,
        "balanco_hidrico_ml":    balanco_hidrico_ml,
        "recomendacao_ml_h":     recomendacao_ml_h,
        "anomalia_detectada":    False,
        "total_alertas":         0,
        # ── Campos de hidratação/desidratação ──
        "hidratacao_nivel":      classificacao["nivel"],
        "hidratacao_cor":        classificacao["cor"],
        "hidratacao_alerta":     classificacao["alerta"],
    }



@router.get("/pdf/{atleta_id}")
def gerar_pdf(
    atleta_id: int,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atleta  = _buscar_atleta_do_profissional(atleta_id, prof, db)
    sessoes = _buscar_sessoes_concluidas(atleta_id, db)

    if not sessoes:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma sessão concluída encontrada para este atleta",
        )

    sessao_dict  = _sessao_para_dict(sessoes[0])
    atleta_dict  = {
        "codigo_anonimizado": atleta.codigo_anonimizado or atleta.nome,
        "nome":               atleta.nome,
        "modalidade":         atleta.modalidade,
    }

    pdf_bytes = gerar_pdf_sessao(
        sessao=sessao_dict,
        atleta=atleta_dict,
        alertas=[],  
    )

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f"attachment; filename=relatorio_{_nome_arquivo(atleta.nome)}.pdf"
        },
    )

@router.get("/excel/{atleta_id}")
def exportar_excel(
    atleta_id: int,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atleta  = _buscar_atleta_do_profissional(atleta_id, prof, db)
    sessoes = _buscar_sessoes_concluidas(atleta_id, db)

    if not sessoes:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma sessão concluída encontrada para este atleta",
        )

    sessoes_dict = [_sessao_para_dict(s) for s in sessoes]
    atleta_dict  = {
        "codigo_anonimizado": atleta.codigo_anonimizado or atleta.nome,
        "nome":               atleta.nome,
    }

    xlsx_bytes = gerar_excel_historico(
        sessoes=sessoes_dict,
        atleta=atleta_dict,
    )

    return StreamingResponse(
        io.BytesIO(xlsx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition":
                f"attachment; filename=dados_{_nome_arquivo(atleta.nome)}.xlsx"
        },
    )

@router.get("/dashboard-stats")
def dashboard_stats(
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atletas = db.query(Usuario).filter(
        Usuario.profissional_id == prof.id,
        Usuario.ativo == True,
    ).all()

    ids = [a.id for a in atletas]
    if not ids:
        return {
            "total_atletas": 0,
            "taxa_media_l_h": None,
            "perda_media_pct": None,
            "total_sessoes": 0,
            "por_modalidade": [],
            "alertas": [],
        }

    sessoes = db.query(Sessao).filter(
        Sessao.atleta_id.in_(ids),
        Sessao.status == "concluida",
    ).all()

    taxas  = [s.taxa_sudorese    for s in sessoes if s.taxa_sudorese]
    perdas = [s.variacao_peso_pct for s in sessoes if s.variacao_peso_pct]

    atleta_map = {a.id: a for a in atletas}
    alertas = [
        {
            "tipo":        "desidratacao_grave",
            "atleta_nome": atleta_map.get(s.atleta_id, Usuario(nome="Desconhecido")).nome,
            "variacao_pct": s.variacao_peso_pct,
            "sessao_id":   s.id,
            "data":        s.criado_em.isoformat() if s.criado_em else None,
        }
        for s in sessoes
        if s.variacao_peso_pct and s.variacao_peso_pct > 3
    ]

    modalidade_map: dict[str, list] = {}
    for a in atletas:
        mod = a.modalidade or "Outro"
        taxas_atleta = [
            s.taxa_sudorese for s in sessoes
            if s.atleta_id == a.id and s.taxa_sudorese
        ]
        if taxas_atleta:
            modalidade_map.setdefault(mod, []).extend(taxas_atleta)

    por_modalidade = [
        {"modalidade": k, "taxa_media": round(sum(v) / len(v), 2)}
        for k, v in modalidade_map.items()
    ]

    return {
        "total_atletas":   len(atletas),
        "taxa_media_l_h":  round(sum(taxas)  / len(taxas),  2) if taxas  else None,
        "perda_media_pct": round(sum(perdas) / len(perdas), 2) if perdas else None,
        "total_sessoes":   len(sessoes),
        "por_modalidade":  por_modalidade,
        "alertas":         sorted(alertas, key=lambda x: x["data"] or "", reverse=True)[:10],
    }


@router.get("/historico-pdf/{atleta_id}")
def exportar_historico_atleta_pdf(
    atleta_id: int,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atleta = _buscar_atleta_do_profissional(atleta_id, prof, db)
    sessoes = _buscar_sessoes_concluidas(atleta_id, db)
    if not sessoes:
        raise HTTPException(status_code=404, detail="Nenhuma sessão encontrada para este atleta")
    sessoes_dict = [_sessao_para_dict(s) for s in sessoes]
    atleta_dict = {
        "nome": atleta.nome,
        "codigo_anonimizado": atleta.codigo_anonimizado or atleta.nome,
    }
    pdf_bytes = gerar_pdf_historico_atleta(sessoes_dict, atleta_dict)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=historico_{_nome_arquivo(atleta.nome)}.pdf"}
    )

@router.get("/equipe-pdf")
def exportar_equipe_pdf(
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atletas = db.query(Usuario).filter(
        Usuario.profissional_id == prof.id,
        Usuario.ativo == True,
    ).all()
    if not atletas:
        raise HTTPException(status_code=404, detail="Nenhum atleta vinculado à sua equipe")
    sessoes_por_atleta = {}
    for atl in atletas:
        sessoes = _buscar_sessoes_concluidas(atl.id, db)
        sessoes_dict = [_sessao_para_dict(s) for s in sessoes]
        sessoes_por_atleta[atl.id] = {
            "nome": atl.nome,
            "sessoes": sessoes_dict
        }
    profissional_dict = {"nome": prof.nome}
    pdf_bytes = gerar_pdf_historico_equipe(sessoes_por_atleta, profissional_dict)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=equipe_{prof.id}_historico.pdf"}
    )