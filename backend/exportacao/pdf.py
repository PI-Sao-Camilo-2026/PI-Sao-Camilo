from __future__ import annotations

import io
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

COR_PRIMARIA     = colors.HexColor("#0A7C59")
COR_SECUNDARIA   = colors.HexColor("#1D9E75")
COR_LIGHT        = colors.HexColor("#E1F5EE")
COR_DANGER       = colors.HexColor("#A32D2D")
COR_DANGER_LIGHT = colors.HexColor("#FCEBEB")
COR_WARNING      = colors.HexColor("#BA7517")
COR_WARNING_LIGHT= colors.HexColor("#FAEEDA")
COR_GRAY         = colors.HexColor("#5F5E5A")
COR_GRAY_LIGHT   = colors.HexColor("#F1EFE8")
COR_BLACK        = colors.HexColor("#1a1a18")
COR_WHITE        = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm
CONTENT_W = PAGE_W - 2 * MARGIN



def _estilos() -> dict:
    base = getSampleStyleSheet()
    return {
        "titulo": ParagraphStyle(
            "titulo", parent=base["Heading1"],
            fontSize=20, textColor=COR_PRIMARIA, spaceAfter=4,
            fontName="Helvetica-Bold", alignment=TA_LEFT,
        ),
        "subtitulo": ParagraphStyle(
            "subtitulo", parent=base["Normal"],
            fontSize=11, textColor=COR_GRAY, spaceAfter=2,
            fontName="Helvetica",
        ),
        "secao": ParagraphStyle(
            "secao", parent=base["Heading2"],
            fontSize=12, textColor=COR_PRIMARIA,
            spaceBefore=14, spaceAfter=6,
            fontName="Helvetica-Bold",
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"],
            fontSize=10, textColor=COR_BLACK, leading=14,
            fontName="Helvetica",
        ),
        "alerta_danger": ParagraphStyle(
            "alerta_danger", parent=base["Normal"],
            fontSize=10, textColor=COR_DANGER, leading=14,
            fontName="Helvetica",
        ),
        "alerta_warning": ParagraphStyle(
            "alerta_warning", parent=base["Normal"],
            fontSize=10, textColor=COR_WARNING, leading=14,
            fontName="Helvetica",
        ),
        "rodape": ParagraphStyle(
            "rodape", parent=base["Normal"],
            fontSize=8, textColor=COR_GRAY, alignment=TA_CENTER,
            fontName="Helvetica",
        ),
        "metrica_label": ParagraphStyle(
            "ml", parent=base["Normal"],
            fontSize=9, textColor=COR_GRAY,
            fontName="Helvetica", alignment=TA_CENTER,
        ),
        "metrica_valor": ParagraphStyle(
            "mv", parent=base["Normal"],
            fontSize=18, textColor=COR_PRIMARIA,
            fontName="Helvetica-Bold", alignment=TA_CENTER,
        ),
        "metrica_unidade": ParagraphStyle(
            "mu", parent=base["Normal"],
            fontSize=9, textColor=COR_GRAY,
            fontName="Helvetica", alignment=TA_CENTER,
        ),
    }



def _tabela_dados(linhas: list[tuple], col_widths: list | None = None) -> Table:
    col_widths = col_widths or [6 * cm, CONTENT_W - 6 * cm]
    t = Table(linhas, colWidths=col_widths, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("FONTNAME",       (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",       (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",      (0, 0), (0, -1),  COR_GRAY),
        ("TEXTCOLOR",      (1, 0), (1, -1),  COR_BLACK),
        ("FONTNAME",       (1, 0), (1, -1),  "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [COR_WHITE, COR_GRAY_LIGHT]),
        ("TOPPADDING",     (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 6),
        ("LEFTPADDING",    (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",   (0, 0), (-1, -1), 10),
        ("GRID",           (0, 0), (-1, -1), 0.3, colors.HexColor("#D3D1C7")),
    ]))
    return t


def _tabela_metricas(metricas: list[dict]) -> Table:
    estilos = _estilos()
    n       = len(metricas)
    col_w   = [CONTENT_W / n] * n

    row_labels  = []
    row_valores = []
    row_units   = []

    for m in metricas:
        cor_valor = COR_DANGER if m.get("alerta") else COR_PRIMARIA
        row_labels.append(Paragraph(m["label"], estilos["metrica_label"]))
        row_valores.append(
            Paragraph(
                str(m["valor"]),
                ParagraphStyle(
                    "mv_dyn", parent=estilos["metrica_valor"],
                    textColor=cor_valor,
                ),
            )
        )
        row_units.append(Paragraph(m["unidade"], estilos["metrica_unidade"]))

    t = Table([row_labels, row_valores, row_units], colWidths=col_w)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), COR_LIGHT),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("LINEAFTER",     (0, 0), (-2, -1), 0.5, colors.HexColor("#9FE1CB")),
    ]))
    return t


def _bloco_alerta(msg: str, tipo: str, estilos: dict) -> Table:

    prefixo   = "aviso" if tipo == "desidratacao" else "cuidado  "
    estilo    = estilos["alerta_danger"] if tipo == "desidratacao" else estilos["alerta_warning"]
    bg_color  = COR_DANGER_LIGHT if tipo == "desidratacao" else COR_WARNING_LIGHT
    bd_color  = COR_DANGER if tipo == "desidratacao" else COR_WARNING

    paragrafo = Paragraph(f"{prefixo}{msg}", estilo)
    t = Table([[paragrafo]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), bg_color),
        ("TOPPADDING",   (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
        ("LEFTPADDING",  (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("LINEABOVE",    (0, 0), (-1, 0),  1.5, bd_color),
        ("LINEBEFORE",   (0, 0), (0, -1),  3,   bd_color),
        ("LINEBELOW",    (0, -1),(-1, -1), 0.3, bd_color),
    ]))
    return t



def gerar_pdf_sessao(sessao: dict, atleta: dict, alertas: list[dict]) -> bytes:
    """
    Gera o PDF completo de uma sessão de avaliação.

    Args:
        sessao:  dict com todos os campos calculados da sessão
        atleta:  dict com 'codigo_anonimizado' e outros dados do atleta
        alertas: lista de dicts {"tipo": str, "mensagem": str}

    Returns:
        bytes do PDF gerado, pronto para download ou envio
    """
    buffer = io.BytesIO()
    doc    = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN,  bottomMargin=MARGIN,
        title="Relatório de Sessão — Nutri-Esportiva",
        author="Nutri-Esportiva / Instituto Mauá de Tecnologia",
    )

    estilos = _estilos()
    story   = []

    header_t = Table(
        [[
            Paragraph(
                "<b>Nutri-Esportiva</b>",
                ParagraphStyle("hdr", fontSize=14, textColor=COR_PRIMARIA,
                            fontName="Helvetica-Bold"),
            ),
            Paragraph(
                f"Relatório de Sessão<br/>"
                f"<font size='9' color='#5F5E5A'>Gerado em "
                f"{datetime.now().strftime('%d/%m/%Y às %H:%M')}</font>",
                ParagraphStyle("hdr_r", fontSize=11, textColor=COR_BLACK,
                            fontName="Helvetica", alignment=TA_RIGHT),
            ),
        ]],
        colWidths=[CONTENT_W * 0.6, CONTENT_W * 0.4],
    )
    header_t.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(header_t)
    story.append(HRFlowable(width="100%", thickness=2, color=COR_PRIMARIA, spaceAfter=14))

    data_sessao = sessao.get("criada_em", "")
    if hasattr(data_sessao, "strftime"):
        data_sessao = data_sessao.strftime("%d/%m/%Y %H:%M")

    story.append(Paragraph("Identificação", estilos["secao"]))
    story.append(_tabela_dados([
        ("Atleta (código)", atleta.get("codigo_anonimizado", "—")),
        ("Modalidade",      sessao.get("modalidade", "—")),
        ("Data / Hora",     data_sessao),
        ("Duração real",    f"{sessao.get('duracao_real_min', '—')} min"),
        ("Intensidade",     f"{sessao.get('intensidade_percebida', '—')} / 10"),
        ("Cidade / Clima",
            f"{sessao.get('cidade', '—')} — "
            f"{sessao.get('temperatura_c', '—')}°C, "
            f"{sessao.get('umidade_pct', '—')}% umidade"),
    ]))
    story.append(Spacer(1, 14))

    variacao = float(sessao.get("variacao_massa_pct") or 0)
    story.append(Paragraph("Resultados", estilos["secao"]))
    story.append(_tabela_metricas([
        {
            "label":   "Taxa de Sudorese",
            "valor":   f"{float(sessao.get('taxa_sudorese_lh') or 0):.2f}",
            "unidade": "L/h",
            "alerta":  False,
        },
        {
            "label":   "Variação de Massa",
            "valor":   f"{variacao:.1f}",
            "unidade": "%",
            "alerta":  variacao > 2,
        },
        {
            "label":   "Recomendação Hídrica",
            "valor":   sessao.get("recomendacao_ml_h", "—"),
            "unidade": "ml/h",
            "alerta":  False,
        },
        {
            "label":   "Perda Ajustada",
            "valor":   f"{float(sessao.get('perda_ajustada_l') or 0):.3f}",
            "unidade": "L",
            "alerta":  False,
        },
    ]))
    story.append(Spacer(1, 14))

    story.append(Paragraph("Detalhes do Balanço Hídrico", estilos["secao"]))
    story.append(_tabela_dados([
        ("Massa pré-sessão",          f"{sessao.get('massa_pre_kg', '—')} kg"),
        ("Massa pós-sessão",          f"{sessao.get('massa_pos_kg', '—')} kg"),
        ("Total ingerido",            f"{sessao.get('total_ingestao_ml', 0)} ml"),
        ("Volume urinário",           f"{sessao.get('total_urina_ml', 0)} ml"),
        ("Balanço hídrico",           f"{sessao.get('balanco_hidrico_ml', '—')} ml"),
        ("Faixa-alvo (próx. sessão)",
            f"{sessao.get('faixa_alvo_min_ml_h', '—')} – "
            f"{sessao.get('faixa_alvo_max_ml_h', '—')} ml/h"),
    ]))
    story.append(Spacer(1, 14))

    story.append(Paragraph("Dados Clínicos", estilos["secao"]))
    story.append(_tabela_dados([
        ("Cor da urina (pré)",       f"{sessao.get('cor_urina', '—')} / 8"),
        ("Sede (pré)",               f"{sessao.get('sede_nivel', '—')} / 5"),
        ("Exposição solar",          sessao.get("exposicao_solar", "—")),
        ("Vestimenta",               sessao.get("vestimenta", "—")),
        ("Fadiga (pós)",             f"{sessao.get('fadiga_nivel', '—')} / 10"),
        ("Tolerância hídrica (pós)", f"{sessao.get('tolerancia_hidrica', '—')} / 5"),
        ("Sintomas GI",              sessao.get("sintomas_gi") or "Nenhum relatado"),
    ]))
    story.append(Spacer(1, 14))

    if alertas:
        story.append(Paragraph("Alertas e Recomendações Clínicas", estilos["secao"]))
        for alerta in alertas:
            tipo = alerta.get("tipo", "")
            msg  = alerta.get("mensagem", "")
            story.append(KeepTogether([
                _bloco_alerta(msg, tipo, estilos),
                Spacer(1, 6),
            ]))

    if sessao.get("predicao_taxa") or sessao.get("anomalia_detectada"):
        story.append(Paragraph("Análise por Inteligência Artificial", estilos["secao"]))
        ia_linhas = []
        if sessao.get("predicao_taxa"):
            ia_linhas.append((
                "Predição de taxa (Random Forest)",
                f"{float(sessao['predicao_taxa']):.3f} L/h",
            ))
        if sessao.get("anomalia_detectada"):
            ia_linhas.append((
                "Detecção de anomalia (Isolation Forest)",
                "Resultado atípico detectado em relação ao histórico",
            ))
        story.append(_tabela_dados(ia_linhas))
        story.append(Spacer(1, 14))

    story.append(HRFlowable(
        width="100%", thickness=0.5, color=COR_GRAY,
        spaceBefore=10, spaceAfter=8,
    ))
    story.append(Paragraph(
        "Nutri-Esportiva — Instituto Mauá de Tecnologia — ICD 2026 | "
        "Dados protegidos por LGPD. Atleta identificado por código anonimizado.",
        estilos["rodape"],
    ))

    doc.build(story)
    return buffer.getvalue()


def _formatar_data(data) -> str:
    if not data:
        return "—"
    if hasattr(data, "strftime"):
        return data.strftime("%d/%m/%Y")
    return str(data)

def gerar_pdf_historico_atleta(sessoes: list[dict], atleta: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title=f"Histórico - {atleta.get('nome', 'Atleta')}"
    )
    estilos = _estilos()
    story = []

    story.append(Paragraph(f"<b>Histórico de Sessões</b>", estilos["titulo"]))
    story.append(Paragraph(f"Atleta: {atleta.get('nome', '—')} ({atleta.get('codigo_anonimizado', '—')})", estilos["subtitulo"]))
    story.append(Paragraph(f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}", estilos["subtitulo"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COR_PRIMARIA, spaceAfter=14))

    taxas    = [s.get("taxa_sudorese_lh")   for s in sessoes if s.get("taxa_sudorese_lh")   is not None]
    perdas   = [s.get("variacao_massa_pct") for s in sessoes if s.get("variacao_massa_pct") is not None]
    recomend = [s.get("recomendacao_ml_h")  for s in sessoes if s.get("recomendacao_ml_h")  is not None]
    balancos = [s.get("balanco_hidrico_ml") for s in sessoes if s.get("balanco_hidrico_ml") is not None]

    taxa_media       = sum(taxas)    / len(taxas)    if taxas    else None
    taxa_maxima      = max(taxas)                     if taxas    else None
    perda_media      = sum(perdas)   / len(perdas)   if perdas   else None
    perda_maxima     = max(perdas)                    if perdas   else None
    rec_media        = sum(recomend) / len(recomend) if recomend else None
    balanco_medio    = sum(balancos) / len(balancos) if balancos else None
    ingestao_total   = sum(s.get("total_ingestao_ml") or 0 for s in sessoes)

    def _classificar(pct):
        if pct is None:   return "Sem dados"
        if pct <= 1.0:    return "Bem hidratado"
        if pct <= 2.0:    return "Desidratação leve"
        if pct <= 3.0:    return "Desidratação moderada"
        return "Desidratação grave (>3%)"

    sessoes_graves    = sum(1 for p in perdas if p > 3.0)
    sessoes_moderadas = sum(1 for p in perdas if 2.0 < p <= 3.0)
    sessoes_leves     = sum(1 for p in perdas if 1.0 < p <= 2.0)
    sessoes_ok        = sum(1 for p in perdas if p <= 1.0)

    story.append(Paragraph("Resumo Estatístico", estilos["secao"]))
    story.append(_tabela_metricas([
        {"label": "Sessões",              "valor": len(sessoes),                                    "unidade": "",    "alerta": False},
        {"label": "Taxa Sudorese Média",  "valor": f"{taxa_media:.2f}"  if taxa_media  else "—",   "unidade": "L/h", "alerta": False},
        {"label": "Perda Média de Massa", "valor": f"{perda_media:.1f}" if perda_media else "—",   "unidade": "%",   "alerta": bool(perda_media and perda_media > 2)},
        {"label": "Ingestão Total",       "valor": f"{ingestao_total:.0f}",                        "unidade": "ml",  "alerta": False},
    ]))
    story.append(Spacer(1, 18))

    story.append(Paragraph("Hidratação e Desidratação", estilos["secao"]))
    story.append(Spacer(1, 6))

    story.append(_tabela_metricas([
        {"label": "Taxa Sudorese Máxima", "valor": f"{taxa_maxima:.2f}" if taxa_maxima else "—",   "unidade": "L/h", "alerta": bool(taxa_maxima and taxa_maxima > 2.5)},
        {"label": "Maior Perda de Massa", "valor": f"{perda_maxima:.1f}" if perda_maxima else "—", "unidade": "%",   "alerta": bool(perda_maxima and perda_maxima > 2)},
        {"label": "Reposição Recomendada","valor": f"{rec_media:.0f}" if rec_media else "—",       "unidade": "ml/h","alerta": False},
        {"label": "Balanço Hídrico Médio","valor": f"{balanco_medio:.0f}" if balanco_medio else "—","unidade": "ml", "alerta": bool(balanco_medio and balanco_medio < -500)},
    ]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Distribuição por Nível de Desidratação", estilos["subtitulo"]))
    story.append(Spacer(1, 6))
    niveis_data = [
        ["Classificação",              "Sessões", "% do Total"],
        ["Bem hidratado (≤1%)",      str(sessoes_ok),        f"{sessoes_ok/len(perdas)*100:.0f}%" if perdas else "—"],
        ["Desidratação leve (1–2%)", str(sessoes_leves),     f"{sessoes_leves/len(perdas)*100:.0f}%" if perdas else "—"],
        ["Desidratação moderada (2–3%)", str(sessoes_moderadas), f"{sessoes_moderadas/len(perdas)*100:.0f}%" if perdas else "—"],
        ["Desidratação grave (>3%)", str(sessoes_graves),    f"{sessoes_graves/len(perdas)*100:.0f}%" if perdas else "—"],
    ]
    t_niveis = Table(niveis_data, colWidths=[9*cm, 3*cm, 3*cm])
    t_niveis.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  COR_PRIMARIA),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  COR_WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("ALIGN",         (1, 0), (-1, -1), "CENTER"),
        ("GRID",          (0, 0), (-1, -1), 0.3, colors.HexColor("#D3D1C7")),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [COR_WHITE, COR_GRAY_LIGHT]),
        ("TEXTCOLOR",     (0, 1), (-1, 1),  COR_PRIMARIA),
        ("TEXTCOLOR",     (0, 4), (-1, 4),  COR_DANGER),
        ("FONTNAME",      (0, 4), (-1, 4),  "Helvetica-Bold"),
    ]))
    story.append(t_niveis)
    story.append(Spacer(1, 10))

    if sessoes_graves > 0:
        story.append(_bloco_alerta(
            f"{sessoes_graves} sessão(ões) com desidratação grave (>3%). "
            "Recomenda-se revisão do protocolo de hidratação.",
            "desidratacao",
            estilos,
        ))
        story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Referência: American College of Sports Medicine (ACSM) — "
        "perda ≤1% adequada; 1–2% leve; 2–3% moderada; >3% grave com risco de desempenho.",
        ParagraphStyle("nota", parent=estilos["body"], fontSize=8, textColor=COR_GRAY, fontName="Helvetica-Oblique"),
    ))
    story.append(Spacer(1, 18))

    story.append(Paragraph("Listagem Detalhada de Sessões", estilos["secao"]))
    table_data = [["Data", "Modalidade", "Duração", "Taxa (L/h)", "Variação (%)", "Ingestão (ml)", "Nível Hidratação"]]
    for s in sessoes:
        variacao = s.get("variacao_massa_pct")
        nivel    = s.get("hidratacao_nivel") or _classificar(variacao)
        table_data.append([
            _formatar_data(s.get("criada_em")),
            s.get("modalidade", "—"),
            f"{s.get('duracao_real_min') or '—'} min",
            f"{s.get('taxa_sudorese_lh') or '—'}",
            f"{variacao:.1f}%" if variacao is not None else "—",
            f"{s.get('total_ingestao_ml') or '—'}",
            nivel,
        ])

    col_widths = [2.2*cm, 2.8*cm, 2*cm, 2*cm, 2.2*cm, 2.2*cm, 3.6*cm]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)

    cmd_cores = [
        ("BACKGROUND",    (0, 0), (-1, 0),  COR_PRIMARIA),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  COR_WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.3, colors.HexColor("#D3D1C7")),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [COR_WHITE, COR_GRAY_LIGHT]),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for i, s in enumerate(sessoes, start=1):
        variacao = s.get("variacao_massa_pct")
        if variacao is not None and variacao > 3.0:
            cmd_cores.append(("BACKGROUND", (0, i), (-1, i), COR_DANGER_LIGHT))
            cmd_cores.append(("TEXTCOLOR",  (0, i), (-1, i), COR_DANGER))
        elif variacao is not None and variacao > 2.0:
            cmd_cores.append(("BACKGROUND", (0, i), (-1, i), COR_WARNING_LIGHT))
            cmd_cores.append(("TEXTCOLOR",  (0, i), (-1, i), COR_WARNING))

    t.setStyle(TableStyle(cmd_cores))
    story.append(t)

    story.append(HRFlowable(width="100%", thickness=0.5, color=COR_GRAY, spaceBefore=14, spaceAfter=8))
    story.append(Paragraph(
        "Nutri-Esportiva — Histórico do atleta — Dados protegidos por LGPD",
        estilos["rodape"],
    ))
    doc.build(story)
    return buffer.getvalue()


def gerar_pdf_historico_equipe(sessoes_por_atleta: dict, profissional: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title=f"Histórico da Equipe - {profissional.get('nome', 'Profissional')}"
    )
    estilos = _estilos()
    story = []

    story.append(Paragraph("<b>Relatório da Equipe</b>", estilos["titulo"]))
    story.append(Paragraph(f"Profissional: {profissional.get('nome', '—')}", estilos["subtitulo"]))
    story.append(Paragraph(f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}", estilos["subtitulo"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COR_PRIMARIA, spaceAfter=14))

    total_atletas = len(sessoes_por_atleta)
    total_sessoes = sum(len(data['sessoes']) for data in sessoes_por_atleta.values())
    story.append(Paragraph(f"Total de atletas: {total_atletas} | Sessões registradas: {total_sessoes}", estilos["body"]))
    story.append(Spacer(1, 12))

    for idx, (atleta_id, data) in enumerate(sessoes_por_atleta.items()):
        if idx > 0:
            story.append(PageBreak())

        story.append(Paragraph(f"Atleta: {data['nome']}", estilos["secao"]))
        sessoes = data['sessoes']
        if not sessoes:
            story.append(Paragraph("Nenhuma sessão registrada.", estilos["body"]))
            continue

        taxas = [s.get("taxa_sudorese_lh") for s in sessoes if s.get("taxa_sudorese_lh")]
        perdas = [s.get("variacao_massa_pct") for s in sessoes if s.get("variacao_massa_pct")]
        media_taxa = sum(taxas)/len(taxas) if taxas else None
        media_perda = sum(perdas)/len(perdas) if perdas else None

        story.append(Paragraph(
            f"Média de taxa de sudorese: {media_taxa:.2f} L/h  |  "
            f"Média de perda de massa: {media_perda:.1f}%" if media_taxa and media_perda else "Dados insuficientes",
            estilos["body"]
        ))
        story.append(Spacer(1, 6))

        story.append(Paragraph("Últimas sessões", estilos["subtitulo"]))
        table_data = [["Data", "Modalidade", "Taxa (L/h)", "Variação (%)", "Ingestão (ml)"]]
        for s in sessoes[:10]:  
            table_data.append([
                _formatar_data(s.get("criada_em")),
                s.get("modalidade", "—"),
                f"{s.get('taxa_sudorese_lh', '—')}",
                f"{s.get('variacao_massa_pct', '—')}",
                f"{s.get('total_ingestao_ml', '—')}",
            ])

        col_w = [2.5*cm, 3*cm, 2.5*cm, 2.5*cm, 2.5*cm]
        t2 = Table(table_data, colWidths=col_w, repeatRows=1)
        t2.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), COR_PRIMARIA),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D3D1C7")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [COR_WHITE, COR_GRAY_LIGHT]),
        ]))
        story.append(t2)
        story.append(Spacer(1, 8))

    story.append(HRFlowable(width="100%", thickness=0.5, color=COR_GRAY, spaceBefore=14, spaceAfter=8))
    story.append(Paragraph(
        "Nutri-Esportiva — Relatório de equipe — Dados anonimizados conforme LGPD",
        estilos["rodape"],
    ))
    doc.build(story)
    return buffer.getvalue()