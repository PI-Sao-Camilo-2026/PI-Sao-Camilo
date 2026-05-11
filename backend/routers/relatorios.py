import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, Usuario, Sessao
from dependencies import get_current_user, require_profissional
from exportacao.pdf   import gerar_pdf_sessao
from exportacao.excel import gerar_excel_historico

router = APIRouter()

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
    return {
        "id":                s.id,
        "data":              s.criado_em,
        "criada_em":         s.criado_em,
        "modalidade":        s.modalidade,
        "duracao_real_min":  s.duracao_minutos,
        "intensidade_percebida": None,         
        "temperatura_c":     s.temp_celsius,
        "umidade_pct":       s.umidade_pct,
        "massa_pre_kg":      s.peso_pre,
        "massa_pos_kg":      s.peso_pos,
        "total_ingestao_ml": s.ingestao_ml,
        "total_urina_ml":    s.volume_urina_ml,
        "perda_ajustada_l":  None,
        "taxa_sudorese_lh":  s.taxa_sudorese,
        "variacao_massa_pct": s.variacao_peso_pct,
        "balanco_hidrico_ml": None,
        "recomendacao_ml_h": None,
        "anomalia_detectada": False,
        "total_alertas":     0,
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