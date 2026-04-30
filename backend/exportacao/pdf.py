"""
exportacao/pdf.py — Geração de relatório PDF por sessão
RF12 — Exportar relatório de sessão individual em formato PDF
Usa ReportLab
"""
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

# ─── Paleta de cores ─────────────────────────────────────────────────────────
COR_PRIMARIA    = colors.HexColor("#0A7C59")
COR_SECUNDARIA  = colors.HexColor("#1D9E75")
COR_LIGHT       = colors.HexColor("#E1F5EE")
COR_DANGER      = colors.HexColor("#A32D2D")
COR_DANGER_LIGHT= colors.HexColor("#FCEBEB")
COR_WARNING     = colors.HexColor("#BA7517")
COR_WARNING_LIGHT=colors.HexColor("#FAEEDA")
COR_GRAY        = colors.HexColor("#5F5E5A")
COR_GRAY_LIGHT  = colors.HexColor("#F1EFE8")
COR_BLACK       = colors.HexColor("#1a1a18")
COR_WHITE       = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm


def _estilos():
    base = getSampleStyleSheet()
    return {
        "titulo": ParagraphStyle("titulo", parent=base["Heading1"],
            fontSize=20, textColor=COR_PRIMARIA, spaceAfter=4,
            fontName="Helvetica-Bold", alignment=TA_LEFT),
        "subtitulo": ParagraphStyle("subtitulo", parent=base["Normal"],
            fontSize=11, textColor=COR_GRAY, spaceAfter=2, fontName="Helvetica"),
        "secao": ParagraphStyle("secao", parent=base["Heading2"],
            fontSize=12, textColor=COR_PRIMARIA, spaceBefore=14, spaceAfter=6,
            fontName="Helvetica-Bold"),
        "body": ParagraphStyle("body", parent=base["Normal"],
            fontSize=10, textColor=COR_BLACK, leading=14, fontName="Helvetica"),
        "alerta_danger": ParagraphStyle("alerta_danger", parent=base["Normal"],
            fontSize=10, textColor=COR_DANGER, leading=14, fontName="Helvetica",
            backColor=COR_DANGER_LIGHT, borderPadding=(6, 8, 6, 8)),
        "alerta_warning": ParagraphStyle("alerta_warning", parent=base["Normal"],
            fontSize=10, textColor=COR_WARNING, leading=14, fontName="Helvetica",
            backColor=COR_WARNING_LIGHT, borderPadding=(6, 8, 6, 8)),
        "rodape": ParagraphStyle("rodape", parent=base["Normal"],
            fontSize=8, textColor=COR_GRAY, alignment=TA_CENTER, fontName="Helvetica"),
        "metrica_label": ParagraphStyle("ml", parent=base["Normal"],
            fontSize=9, textColor=COR_GRAY, fontName="Helvetica", alignment=TA_CENTER),
        "metrica_valor": ParagraphStyle("mv", parent=base["Normal"],
            fontSize=18, textColor=COR_PRIMARIA, fontName="Helvetica-Bold", alignment=TA_CENTER),
        "metrica_unidade": ParagraphStyle("mu", parent=base["Normal"],
            fontSize=9, textColor=COR_GRAY, fontName="Helvetica", alignment=TA_CENTER),
    }


def _tabela_dados(linhas: list[tuple], col_widths=None) -> Table:
    """Tabela de duas colunas: label | valor"""
    col_widths = col_widths or [6 * cm, 10 * cm]
    t = Table(linhas, colWidths=col_widths, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("FONTNAME",    (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",    (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",   (0, 0), (0, -1), COR_GRAY),
        ("TEXTCOLOR",   (1, 0), (1, -1), COR_BLACK),
        ("FONTNAME",    (1, 0), (1, -1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [COR_WHITE, COR_GRAY_LIGHT]),
        ("TOPPADDING",  (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0,0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",(0, 0), (-1, -1), 10),
        ("GRID",        (0, 0), (-1, -1), 0.3, colors.HexColor("#D3D1C7")),
        ("ROUNDEDCORNERS", [4]),
    ]))
    return t


def _tabela_metricas(metricas: list[dict]) -> Table:
    """
    Cards de métricas principais: taxa, variação, recomendação, perda
    metricas = [{"label": ..., "valor": ..., "unidade": ..., "alerta": bool}]
    """
    estilos = _estilos()
    cells = []
    for m in metricas:
        cor = COR_DANGER if m.get("alerta") else COR_PRIMARIA
        cells.append([
            Paragraph(m["label"], estilos["metrica_label"]),
            Paragraph(str(m["valor"]),
                ParagraphStyle("mv_dyn", parent=estilos["metrica_valor"],
                    textColor=cor)),
            Paragraph(m["unidade"], estilos["metrica_unidade"]),
        ])

    # Transpor para uma única linha com N colunas
    row_labels  = [c[0] for c in cells]
    row_valores = [c[1] for c in cells]
    row_units   = [c[2] for c in cells]

    n = len(metricas)
    col_w = [(PAGE_W - 2 * MARGIN) / n] * n
    t = Table([row_labels, row_valores, row_units], colWidths=col_w)
    t.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), COR_LIGHT),
        ("TOPPADDING",   (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 10),
        ("LEFTPADDING",  (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEAFTER",    (0, 0), (-2, -1), 0.5, colors.HexColor("#9FE1CB")),
        ("ROUNDEDCORNERS", [8]),
    ]))
    return t


def gerar_pdf_sessao(sessao: dict, atleta: dict, alertas: list[dict]) -> bytes:
    """
    Gera o PDF completo de uma sessão de avaliação.

    Args:
        sessao:  dict com todos os campos da sessão (calculados)
        atleta:  dict com nome, codigo_anonimizado, perfil
        alertas: lista de dicts {"tipo": str, "mensagem": str}

    Returns:
        bytes do PDF gerado
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title="Relatório de Sessão — Nutri-Esportiva",
        author="Nutri-Esportiva / Instituto Mauá de Tecnologia",
    )

    estilos = _estilos()
    story   = []

    # ── Cabeçalho ──────────────────────────────────────────────────────────
    header_data = [[
        Paragraph("💧 <b>Nutri-Esportiva</b>", ParagraphStyle("hdr",
            fontSize=14, textColor=COR_PRIMARIA, fontName="Helvetica-Bold")),
        Paragraph(
            f"Relatório de Sessão<br/>"
            f"<font size='9' color='#5F5E5A'>Gerado em "
            f"{datetime.now().strftime('%d/%m/%Y às %H:%M')}</font>",
            ParagraphStyle("hdr_r", fontSize=11, textColor=COR_BLACK,
                fontName="Helvetica", alignment=TA_RIGHT)),
    ]]
    header_t = Table(header_data, colWidths=[10*cm, 6.7*cm])
    header_t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(header_t)
    story.append(HRFlowable(width="100%", thickness=2, color=COR_PRIMARIA, spaceAfter=14))

    # ── Identificação ──────────────────────────────────────────────────────
    story.append(Paragraph("Identificação", estilos["secao"]))
    data_sessao = sessao.get("criada_em", "")
    if hasattr(data_sessao, "strftime"):
        data_sessao = data_sessao.strftime("%d/%m/%Y %H:%M")

    story.append(_tabela_dados([
        ("Atleta (código)", atleta.get("codigo_anonimizado", "—")),
        ("Modalidade",      sessao.get("modalidade", "—")),
        ("Data / Hora",     data_sessao),
        ("Duração real",    f"{sessao.get('duracao_real_min', '—')} min"),
        ("Intensidade",     f"{sessao.get('intensidade_percebida', '—')} / 10"),
        ("Cidade / Clima",  f"{sessao.get('cidade', '—')} — "
                            f"{sessao.get('temperatura_c', '—')}°C, "
                            f"{sessao.get('umidade_pct', '—')}% umidade"),
    ]))
    story.append(Spacer(1, 14))

    # ── Métricas principais ────────────────────────────────────────────────
    story.append(Paragraph("Resultados", estilos["secao"]))
    variacao = float(sessao.get("variacao_massa_pct") or 0)
    story.append(_tabela_metricas([
        {"label": "Taxa de Sudorese",     "valor": f"{float(sessao.get('taxa_sudorese_lh') or 0):.2f}", "unidade": "L/h",  "alerta": False},
        {"label": "Variação de Massa",    "valor": f"{variacao:.1f}",           "unidade": "%",    "alerta": variacao > 2},
        {"label": "Recomendação Hídrica", "valor": sessao.get("recomendacao_ml_h", "—"),             "unidade": "ml/h", "alerta": False},
        {"label": "Perda Ajustada",       "valor": f"{float(sessao.get('perda_ajustada_l') or 0):.3f}", "unidade": "L",  "alerta": False},
    ]))
    story.append(Spacer(1, 14))

    # ── Detalhes calculados ────────────────────────────────────────────────
    story.append(Paragraph("Detalhes do Balanço Hídrico", estilos["secao"]))
    story.append(_tabela_dados([
        ("Massa pré-sessão",        f"{sessao.get('massa_pre_kg', '—')} kg"),
        ("Massa pós-sessão",        f"{sessao.get('massa_pos_kg', '—')} kg"),
        ("Total ingerido",          f"{sessao.get('total_ingestao_ml', 0)} ml"),
        ("Volume urinário",         f"{sessao.get('total_urina_ml', 0)} ml"),
        ("Balanço hídrico",         f"{sessao.get('balanco_hidrico_ml', '—')} ml"),
        ("Faixa-alvo (próx. sessão)",
            f"{sessao.get('faixa_alvo_min_ml_h', '—')} – "
            f"{sessao.get('faixa_alvo_max_ml_h', '—')} ml/h"),
    ]))
    story.append(Spacer(1, 14))

    # ── Dados pré/pós sessão ────────────────────────────────────────────────
    story.append(Paragraph("Dados Clínicos", estilos["secao"]))
    story.append(_tabela_dados([
        ("Cor da urina (pré)",      f"{sessao.get('cor_urina', '—')} / 8"),
        ("Sede (pré)",              f"{sessao.get('sede_nivel', '—')} / 5"),
        ("Exposição solar",         sessao.get("exposicao_solar", "—")),
        ("Vestimenta",              sessao.get("vestimenta", "—")),
        ("Fadiga (pós)",            f"{sessao.get('fadiga_nivel', '—')} / 10"),
        ("Tolerância hídrica (pós)",f"{sessao.get('tolerancia_hidrica', '—')} / 5"),
        ("Sintomas GI",             sessao.get("sintomas_gi") or "Nenhum relatado"),
    ]))
    story.append(Spacer(1, 14))

    # ── Alertas ─────────────────────────────────────────────────────────────
    if alertas:
        story.append(Paragraph("Alertas e Recomendações Clínicas", estilos["secao"]))
        for alerta in alertas:
            tipo   = alerta.get("tipo", "")
            msg    = alerta.get("mensagem", "")
            estilo = estilos["alerta_danger"] if tipo == "desidratacao" else estilos["alerta_warning"]
            prefixo = "⚠ " if tipo == "desidratacao" else "ℹ "
            story.append(KeepTogether([
                Paragraph(f"{prefixo}{msg}", estilo),
                Spacer(1, 6),
            ]))

    # ── IA ─────────────────────────────────────────────────────────────────
    if sessao.get("predicao_taxa") or sessao.get("anomalia_detectada"):
        story.append(Paragraph("Análise por Inteligência Artificial", estilos["secao"]))
        ia_linhas = []
        if sessao.get("predicao_taxa"):
            ia_linhas.append(("Predição de taxa (Random Forest)",
                f"{float(sessao['predicao_taxa']):.3f} L/h"))
        if sessao.get("anomalia_detectada"):
            ia_linhas.append(("Detecção de anomalia (Isolation Forest)",
                "⚠ Resultado atípico detectado em relação ao histórico"))
        story.append(_tabela_dados(ia_linhas))
        story.append(Spacer(1, 14))

    # ── Rodapé ──────────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=COR_GRAY, spaceBefore=10, spaceAfter=8))
    story.append(Paragraph(
        "Nutri-Esportiva — Instituto Mauá de Tecnologia — ICD 2026 | "
        "Dados protegidos por LGPD. Atleta identificado por código anonimizado.",
        estilos["rodape"],
    ))

    doc.build(story)
    return buffer.getvalue()