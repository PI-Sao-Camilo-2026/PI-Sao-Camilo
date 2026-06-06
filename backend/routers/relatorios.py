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

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional  

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
    # BLINDAGEM 1: Usar taxa_sudorese.isnot(None) em vez do texto de status 
    return db.query(Sessao).filter(
        Sessao.atleta_id == atleta_id,
        Sessao.taxa_sudorese.isnot(None)
    ).order_by(desc(Sessao.criado_em)).all()


def _sessao_para_dict(s: Sessao) -> dict:
    if not s:
        return {}
        
    variacao = getattr(s, 'variacao_peso_pct', 0.0)
    status_hidr = _classificar_hidratacao(variacao)
    
    total_ingestao = 0.0
    if hasattr(s, 'fluidos') and s.fluidos:
        try:
            total_ingestao = sum(float(getattr(f, 'quantidade_ml', 0) or 0) for f in s.fluidos)
        except Exception:
            total_ingestao = 0.0
        
    rec_texto = ""
    if hasattr(s, 'recomendacao') and s.recomendacao:
        rec_texto = getattr(s.recomendacao, 'texto', "") or ""

    # AJUSTE DA COR DA URINA (Verifique se no seu modelo o nome é exatamente esse)
    cor_urina_final = getattr(s, 'cor_urina_final', None) or getattr(s, 'cor_urina_pos', None) or getattr(s, 'cor_urina_basal', "—")

    return {
        "id": getattr(s, 'id', None),
        "atleta_id": getattr(s, 'atleta_id', None),
        "modalidade": getattr(s, 'modalidade', "Não informada") or "Não informada",
        "duracao_minutos": getattr(s, 'duracao_minutos', 0) or 0,
        "peso_pre": getattr(s, 'peso_pre', None),
        "peso_pos": getattr(s, 'peso_pos', None),
        "taxa_sudorese": getattr(s, 'taxa_sudorese', 0.0) or 0.0,
        "taxa_sudorese_lh": getattr(s, 'taxa_sudorese', 0.0) or 0.0,
        "variacao_peso_pct": variacao or 0.0,
        "variacao_massa_pct": variacao or 0.0,
        "total_ingestao_ml": total_ingestao if total_ingestao > 0 else (getattr(s, 'ingestao_ml', 0.0) or 0.0),
        "clima_temperatura": getattr(s, 'temp_celsius', None) or getattr(s, 'clima_temperatura', None),
        "clima_umidade": getattr(s, 'umidade_pct', None) or getattr(s, 'clima_umidade', None),
        "cor_urina_basal": getattr(s, 'cor_urina_basal', None),
        "cor_urina_final": cor_urina_final, # Adicionado explicitamente para o PDF
        "status_hidratacao": status_hidr["nivel"],
        "cor_status": status_hidr["cor"],
        "alerta_perigo": status_hidr["alerta"],
        "texto_ia": rec_texto,
        "criada_em": s.criado_em.isoformat() if (hasattr(s, 'criado_em') and s.criado_em) else None,
        "criado_em": s.criado_em.isoformat() if (hasattr(s, 'criado_em') and s.criado_em) else None
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
        Sessao.taxa_sudorese.isnot(None),
        Sessao.criado_em >= data_limite
    ).order_by(Sessao.criado_em.asc()).all()

    taxas  = [s.taxa_sudorese for s in sessoes if getattr(s, 'taxa_sudorese', None)]
    perdas = [s.variacao_peso_pct for s in sessoes if getattr(s, 'variacao_peso_pct', None)]

    atleta_map = {a.id: a for a in atletas}
    
    alertas_list = []
    for s in sessoes:
        v_peso = getattr(s, 'variacao_peso_pct', 0.0)
        if v_peso and v_peso > 2.0:
            atl = atleta_map.get(s.atleta_id)
            nome_atl = atl.nome if atl else "Atleta"
            tipo_alerta = "incompleto" if v_peso <= 3.0 else "perigo"
            titulo_alerta = "Desidratação Leve/Mod." if v_peso <= 3.0 else "Desidratação Crítica!"
            
            alertas_list.append({
                "titulo": f"{titulo_alerta} - {nome_atl}",
                "tempo": s.criado_em.strftime("%d/%m %H:%M") if s.criado_em else "Agora",
                "descricao": f"O atleta apresentou perda de massa corporal de <strong>{v_peso:.1f}%</strong> na sessão de {s.modalidade or 'Treino'}.",
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
        v_peso = getattr(s, 'variacao_peso_pct', None)
        if v_peso is None or not s.criado_em:
            continue
        data_str = s.criado_em.strftime("%d/%m")
        mod = s.modalidade or "Geral"
        agrupamento_diario[data_str][mod].append(v_peso)

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


@router.get("/historico-pdf/{atleta_id}")
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
    pdf_bytes = gerar_pdf_historico_atleta(atleta_dict, sessoes_dict) # Corrigida a ordem dos parametros
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=historico_{_nome_arquivo(atleta.nome)}.pdf"}
    )


@router.get("/equipe-pdf")
def exportar_equipe_pdf(
    atleta_id: Optional[int] = None,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atletas_todos = db.query(Usuario).filter(
        Usuario.profissional_id == prof.id,
        Usuario.tipo == "atleta",
        Usuario.ativo == True
    ).all()

    modalidade_filtro = None

    if atleta_id:
        atleta_sel = db.query(Usuario).filter(Usuario.id == atleta_id).first()
        if atleta_sel:
            modalidade_filtro = getattr(atleta_sel, "modalidade", None)
            if not modalidade_filtro:
                ult_s = db.query(Sessao).filter(
                    Sessao.atleta_id == atleta_id,
                    Sessao.taxa_sudorese.isnot(None)
                ).order_by(desc(Sessao.criado_em)).first()
                if ult_s:
                    modalidade_filtro = getattr(ult_s, "modalidade", None)

    atletas_filtrados = []
    if modalidade_filtro:
        # Usando strip() e lower() para evitar que Vôlei e vôlei sejam tratados como diferentes
        mod_filtro_limpo = str(modalidade_filtro).strip().lower()
        for a in atletas_todos:
            mod_a = getattr(a, "modalidade", None)
            if mod_a and str(mod_a).strip().lower() == mod_filtro_limpo:
                atletas_filtrados.append(a)
                continue
            
            tem_sessao = db.query(Sessao).filter(
                Sessao.atleta_id == a.id,
                func.lower(Sessao.modalidade) == mod_filtro_limpo
            ).first()
            
            if tem_sessao or a.id == atleta_id:
                atletas_filtrados.append(a)
    else:
        atletas_filtrados = atletas_todos

    # Remove duplicados que possam ter entrado
    atletas_filtrados = list({a.id: a for a in atletas_filtrados}.values())

    sessoes_por_atleta = {}
    for atl in atletas_filtrados:
        # BLINDAGEM 2: Foco total na taxa_sudorese em vez do status
        query_sessoes = db.query(Sessao).filter(
            Sessao.atleta_id == atl.id, 
            Sessao.taxa_sudorese.isnot(None)
        )
        if modalidade_filtro:
            query_sessoes = query_sessoes.filter(
                func.lower(Sessao.modalidade) == str(modalidade_filtro).strip().lower()
            )
        
        sessoes = query_sessoes.order_by(desc(Sessao.criado_em)).all()
        sessoes_dict = [_sessao_para_dict(s) for s in sessoes]
        
        if sessoes_dict or atl.id == atleta_id:
            sessoes_por_atleta[atl.id] = {
                "nome": atl.nome,
                "codigo_anonimizado": atl.codigo_anonimizado or atl.nome,
                "sessoes": sessoes_dict
            }

    profissional_dict = {
        "nome": prof.nome,
        "email": prof.email,
        "modalidade_equipe": modalidade_filtro
    }

    pdf_bytes = gerar_pdf_historico_equipe(sessoes_por_atleta, profissional_dict)
    
    slug_modalidade = f"_{str(modalidade_filtro).replace(' ', '_')}" if modalidade_filtro else ""
    filename = f"relatorio_equipe{slug_modalidade}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
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