import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import get_db, Usuario, Sessao
from dependencies import get_current_user, require_profissional
from exportacao.pdf   import gerar_pdf_sessao
from exportacao.excel import gerar_excel_historico
from exportacao.pdf import gerar_pdf_historico_atleta, gerar_pdf_historico_equipe
# from services.calculo import gerar_recommendacao

from collections import defaultdict
from datetime import datetime, timedelta

router = APIRouter()


def _classificar_hidratacao(variacao_pct: float | None) -> dict:
    if variacao_pct is None:
        return {"nivel": "Sem dados", "cor": "neutro", "alerta": False}
    if variacao_pct <= 1.0:
        return {"nivel": "Bem hidratado", "cor": "verde", "alerta": False}
    if variacao_pct <= 2.0:
        return {"nivel": "Desidratação leve", "cor": "amarelo", "alerta": False}
    if variacao_pct <= 3.0:
        return {"nivel": "Desidratação moderada", "cor": "laranja", "alerta": True}
    return {"nivel": "Desidratação grave", "cor": "vermelho", "alerta": True}


def _buscar_sessoes_concluidas(atleta_id: int, db: Session):
    return db.query(Sessao).filter(
        Sessao.atleta_id == atleta_id,
        Sessao.status == "concluida"
    ).order_by(desc(Sessao.criado_em)).all()


def _sessao_para_dict(s: Sessao) -> dict:
    return {
        "id": s.id,
        "data": s.criado_em.strftime("%d/%m/%Y") if s.criado_em else "—",
        "criado_em": s.criado_em.isoformat() if s.criado_em else None,
        "modalidade": s.modalidade,
        "duracao_minutos": s.duracao_minutos,
        "peso_pre": s.peso_pre,
        "peso_pos": s.peso_pos,
        "ingestao_ml": s.ingestao_ml,
        "taxa_sudorese": s.taxa_sudorese,
        "variacao_peso_pct": s.variacao_peso_pct,
        "clima_temperatura": s.clima_temperatura,
        "clima_condicao": s.clima_condicao,
    }


def _nome_arquivo(nome: str) -> str:
    return nome.lower().replace(" ", "_")


@router.get("/dashboard-stats")
def dashboard_stats(
    periodo: str = "30",
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    dias = int(periodo) if periodo in ["7", "15", "30", "90"] else 30
    data_limite = datetime.utcnow() - timedelta(days=dias)

    atletas = db.query(Usuario).filter(
        Usuario.profissional_id == prof.id,
        Usuario.ativo == True,
    ).all()

    ids = [a.id for a in atletas]
    if not ids:
        return {
            "total_atletas": 0,
            "total_atletas_sub": "0 ativos",
            "taxa_media_l_h": None,
            "taxa_media_sub": "Sem sessões",
            "perda_media_pct": None,
            "perda_media_sub": "Sem sessões",
            "total_sessoes": 0,
            "total_sessoes_sub": "0 no período",
            "por_modalidade": [],
            "alertas": [],
            "evolucao_sudorese": []
        }

    sessoes = db.query(Sessao).filter(
        Sessao.atleta_id.in_(ids),
        Sessao.status == "concluida",
        Sessao.criado_em >= data_limite
    ).order_by(Sessao.criado_em.asc()).all()

    taxas  = [s.taxa_sudorese    for s in sessoes if s.taxa_sudorese]
    perdas = [s.variacao_peso_pct for s in sessoes if s.variacao_peso_pct]

    atleta_map = {a.id: a for a in atletas}
    
    alertas_list = []
    for s in sessoes:
        if s.variacao_peso_pct and s.variacao_peso_pct > 2.0:
            atl = atleta_map.get(s.atleta_id)
            nome_atl = atl.nome if atl else "Atleta"
            tipo_alerta = "incompleto" if s.variacao_peso_pct <= 3.0 else "perigo"
            titulo_alerta = "Desidratação Leve/Mod." if s.variacao_peso_pct <= 3.0 else "Desidratação Crítica!"
            
            alertas_list.append({
                "titulo": f"{titulo_alerta} - {nome_atl}",
                "tempo": s.criado_em.strftime("%d/%m %H:%M") if s.criado_em else "Agora",
                "descricao": f"O atleta apresentou perda de massa corporal de <strong>{s.variacao_peso_pct:.1f}%</strong> na sessão de {s.modalidade or 'Treino'}.",
                "tipo": tipo_alerta,
                "data": s.criado_em.isoformat() if s.criado_em else ""
            })

    total_sessoes_periodo = len(sessoes)
    contagem_modalidades = defaultdict(int)
    for s in sessoes:
        mod = s.modalidade or "Geral"
        contagem_modalidades[mod] += 1

    por_modalidade = []
    for mod, qtd in contagem_modalidades.items():
        pct = (qtd / total_sessoes_periodo * 100) if total_sessoes_periodo > 0 else 0
        por_modalidade.append({
            "modalidade": mod,
            "quantidade": qtd,
            "percentual": round(pct, 1)
        })
    por_modalidade = sorted(por_modalidade, key=lambda x: x["quantidade"], reverse=True)

    agrupamento_diario = defaultdict(lambda: defaultdict(list))
    for s in sessoes:
        if s.variacao_peso_pct is None or not s.criado_em:
            continue
        data_str = s.criado_em.strftime("%d/%m")
        mod = s.modalidade or "Geral"
        agrupamento_diario[data_str][mod].append(s.variacao_peso_pct)

    evolucao_sudorese = []
    for data_str, mods_dict in agrupamento_diario.items():
        ponto_grafico = {"data": data_str}
        for mod, valores in mods_dict.items():
            media_pct = sum(valores) / len(valores)
            ponto_grafico[mod] = round(media_pct, 1)
        evolucao_sudorese.append(ponto_grafico)

    return {
        "total_atletas": len(atletas),
        "total_atletas_sub": f"{len(atletas)} cadastrados",
        "taxa_media_l_h": round(sum(taxas) / len(taxas), 2) if taxas else None,
        "taxa_media_sub": f"Média de {len(taxas)} sessões" if taxas else "Sem registros",
        "perda_media_pct": round(sum(perdas) / len(perdas), 1) if perdas else None,
        "perda_media_sub": "Alvo ideal: < 2.0%" if perdas else "Sem registros",
        "total_sessoes": total_sessoes_periodo,
        "total_sessoes_sub": f"Últimos {dias} dias",
        "por_modalidade": por_modalidade,
        "alertas": sorted(alertas_list, key=lambda x: x["data"], reverse=True)[:10],
        "evolucao_sudorese": evolucao_sudorese
    }


@router.get("/pdf/{atleta_id}")
def exportar_atleta_pdf(
    atleta_id: int,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atleta = db.query(Usuario).filter(
        Usuario.id == atleta_id,
        Usuario.profissional_id == prof.id,
        Usuario.ativo == True
    ).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado ou não pertence à sua equipe")
    sessoes = _buscar_sessoes_concluidas(atleta_id, db)
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
            "codigo_anonimizado": atl.codigo_anonimizado or atl.nome,
            "sessoes": sessoes_dict
        }
    pdf_bytes = gerar_pdf_historico_equipe(sessoes_por_atleta)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=relatorio_equipe.pdf"}
    )


@router.get("/excel/{atleta_id}")
def exportar_atleta_excel(
    atleta_id: int,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atleta = db.query(Usuario).filter(
        Usuario.id == atleta_id,
        Usuario.profissional_id == prof.id,
        Usuario.ativo == True
    ).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")
    sessoes = _buscar_sessoes_concluidas(atleta_id, db)
    sessoes_dict = [_sessao_para_dict(s) for s in sessoes]
    excel_bytes = gerar_excel_historico(sessoes_dict)
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=historico_{_nome_arquivo(atleta.nome)}.xlsx"}
    )