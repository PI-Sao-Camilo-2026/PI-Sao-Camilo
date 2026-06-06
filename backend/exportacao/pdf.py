from __future__ import annotations

import io
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
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


def _estilos_pdf() -> dict:
    styles = getSampleStyleSheet()
    normal = styles["Normal"]

    return {
        "titulo": ParagraphStyle(
            "DocTitulo", parent=normal, fontName="Helvetica-Bold", fontSize=22,
            leading=26, textColor=COR_PRIMARIA, spaceAfter=6
        ),
        "subtitulo": ParagraphStyle(
            "DocSubtitulo", parent=normal, fontName="Helvetica-Bold", fontSize=14,
            leading=18, textColor=COR_SECUNDARIA, spaceBefore=12, spaceAfter=8
        ),
        "h3": ParagraphStyle(
            "DocH3", parent=normal, fontName="Helvetica-Bold", fontSize=11,
            leading=14, textColor=COR_BLACK, spaceBefore=10, spaceAfter=4
        ),
        "corpo": ParagraphStyle(
            "DocCorpo", parent=normal, fontName="Helvetica", fontSize=10,
            leading=14, textColor=COR_BLACK, spaceAfter=6
        ),
        "corpo_cinza": ParagraphStyle(
            "DocCorpoCinza", parent=normal, fontName="Helvetica", fontSize=9,
            leading=13, textColor=COR_GRAY, spaceAfter=4
        ),
        "ia_txt": ParagraphStyle(
            "DocIaTxt", parent=normal, fontName="Helvetica-Oblique", fontSize=10,
            leading=14, textColor=colors.HexColor("#115E42")
        ),
        "card_titulo_perda": ParagraphStyle(
            "CardTitlePerda", parent=normal, fontName="Helvetica", fontSize=9,
            leading=11, textColor=COR_DANGER, alignment=TA_CENTER
        ),
        "card_valor_perda": ParagraphStyle(
            "CardValPerda", parent=normal, fontName="Helvetica-Bold", fontSize=16,
            leading=20, textColor=COR_DANGER, alignment=TA_CENTER
        ),
        "card_titulo_ingest": ParagraphStyle(
            "CardTitleIngest", parent=normal, fontName="Helvetica", fontSize=9,
            leading=11, textColor=COR_PRIMARIA, alignment=TA_CENTER
        ),
        "card_valor_ingest": ParagraphStyle(
            "CardValIngest", parent=normal, fontName="Helvetica-Bold", fontSize=16,
            leading=20, textColor=COR_PRIMARIA, alignment=TA_CENTER
        ),
    }


def _formatar_data(dt_val) -> str:
    if not dt_val:
        return "—"
    if isinstance(dt_val, str):
        try:
            dt_val = datetime.fromisoformat(dt_val.replace("Z", ""))
        except ValueError:
            return dt_val[:16]
    if isinstance(dt_val, datetime):
        return dt_val.strftime("%d/%m/%Y %H:%M")
    return str(dt_val)


def gerar_pdf_sessao(dados: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN
    )

    estilos = _estilos_pdf()
    story = []

    atleta = dados.get("atleta", {})
    sessao = dados.get("sessao", {})
    rec = dados.get("recomendacao", {})

    nome_atleta = atleta.get("codigo_anonimizado") or atleta.get("nome", "Atleta")
    dt_criacao = sessao.get("criado_em") or sessao.get("criada_em")

    def _header_footer(canvas, document):
        canvas.saveState()
        canvas.setFillColor(COR_PRIMARIA)
        canvas.rect(0, PAGE_H - 0.5*cm, PAGE_W, 0.5*cm, stroke=0, fill=1)

        canvas.setFillColor(COR_BLACK)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(MARGIN, PAGE_H - 1.2*cm, "RELATÓRIO DE AVALIAÇÃO INDIVIDUAL")
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 1.2*cm, f"Atleta: {nome_atleta}")

        canvas.setStrokeColor(COR_GRAY_LIGHT)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, PAGE_H - 1.3*cm, PAGE_W - MARGIN, PAGE_H - 1.3*cm)

        canvas.line(MARGIN, 1.5*cm, PAGE_W - MARGIN, 1.5*cm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(COR_GRAY)
        canvas.drawString(MARGIN, 1.1*cm, f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        canvas.drawRightString(PAGE_W - MARGIN, 1.1*cm, f"Página {document.page}")
        canvas.restoreState()

    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("AVALIAÇÃO DE HIDRATAÇÃO", estilos["titulo"]))
    story.append(Paragraph(f"Identificação do Atleta: <b>{nome_atleta}</b>", estilos["corpo"]))
    story.append(Paragraph(f"Data da Atividade: {_formatar_data(dt_criacao)}", estilos["corpo_cinza"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Dados da Sessão", estilos["subtitulo"]))

    mod = sessao.get("modalidade", "—")
    dur = sessao.get("duracao_minutos", "—")
    dur_str = f"{dur} min" if dur != "—" else "—"
    txt_clima = sessao.get("clima_texto") or "Não informado"

    peso_pre = sessao.get("peso_pre")
    peso_pos = sessao.get("peso_pos")
    p_pre_str = f"{peso_pre:.2f} kg" if isinstance(peso_pre, (int, float)) else "—"
    p_pos_str = f"{peso_pos:.2f} kg" if isinstance(peso_pos, (int, float)) else "—"

    info_data = [
        [Paragraph("<b>Modalidade:</b>", estilos["corpo"]), Paragraph(str(mod), estilos["corpo"]),
         Paragraph("<b>Duração:</b>", estilos["corpo"]), Paragraph(dur_str, estilos["corpo"])],
        [Paragraph("<b>Peso Pré:</b>", estilos["corpo"]), Paragraph(p_pre_str, estilos["corpo"]),
         Paragraph("<b>Peso Pós:</b>", estilos["corpo"]), Paragraph(p_pos_str, estilos["corpo"])],
        [Paragraph("<b>Ambiente:</b>", estilos["corpo"]), Paragraph(str(txt_clima), estilos["corpo"]), "", ""]
    ]
    t_info = Table(info_data, colWidths=[3*cm, 4.5*cm, 3*cm, 4.5*cm])
    t_info.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("SPAN", (1, 2), (3, 2)),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Métricas Calculadas", estilos["subtitulo"]))

    taxa = sessao.get("taxa_sudorese") or sessao.get("taxa_sudorese_lh")
    taxa_str = f"{taxa:.2f} L/h" if isinstance(taxa, (int, float)) else "—"

    v_pct = sessao.get("variacao_peso_pct") or sessao.get("variacao_massa_pct")
    v_pct_str = f"{v_pct:.1f}%" if isinstance(v_pct, (int, float)) else "—"

    ing_tot = sessao.get("total_ingestao_ml") or sessao.get("ingestao_ml")
    ing_tot_str = f"{ing_tot:.0f} ml" if isinstance(ing_tot, (int, float)) else "—"

    is_danger = isinstance(v_pct, (int, float)) and v_pct > 2.0
    cor_card_massa = COR_DANGER_LIGHT if is_danger else COR_GRAY_LIGHT
    estilo_lbl_massa = estilos["card_titulo_perda"] if is_danger else estilos["corpo_cinza"]
    estilo_val_massa = estilos["card_valor_perda"] if is_danger else ParagraphStyle("CVM", parent=estilos["titulo"], alignment=TA_CENTER, textColor=COR_BLACK)

    card_massa_story = [
        Spacer(1, 6),
        Paragraph("VARIAÇÃO DE MASSA", estilo_lbl_massa),
        Spacer(1, 4),
        Paragraph(v_pct_str, estilo_val_massa),
        Spacer(1, 6)
    ]
    card_ingest_story = [
        Spacer(1, 6),
        Paragraph("INGESTÃO TOTAL", estilos["card_titulo_ingest"]),
        Spacer(1, 4),
        Paragraph(ing_tot_str, estilos["card_valor_ingest"]),
        Spacer(1, 6)
    ]

    t_cards = Table([[card_massa_story, card_ingest_story]], colWidths=[7.5*cm, 7.5*cm])
    t_cards.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), cor_card_massa),
        ("BACKGROUND", (1, 0), (1, 0), COR_LIGHT),
        ("BOX", (0, 0), (0, 0), 0.5, COR_DANGER if is_danger else COR_GRAY_LIGHT),
        ("BOX", (1, 0), (1, 0), 0.5, COR_SECUNDARIA),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(t_cards)
    story.append(Spacer(1, 15))

    story.append(Paragraph(f"<b>Taxa de Sudorese Estimada:</b> {taxa_str}", estilos["h3"]))
    story.append(Spacer(1, 10))

    if rec and rec.get("texto"):
        story.append(Paragraph("Diretriz de Hidratação Recomenda", estilos["subtitulo"]))
        box_story = [
            Spacer(1, 8),
            Paragraph(rec["texto"], estilos["ia_txt"]),
            Spacer(1, 8)
        ]
        t_box = Table([[box_story]], colWidths=[15*cm])
        t_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), COR_LIGHT),
            ("BOX", (0, 0), (0, 0), 1, COR_SECUNDARIA),
            ("LEFTPADDING", (0, 0), (0, 0), 12),
            ("RIGHTPADDING", (0, 0), (0, 0), 12),
        ]))
        story.append(t_box)

    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    buffer.seek(0)
    return buffer.getvalue()


def gerar_pdf_historico_atleta(atleta: dict, sessoes: list) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN
    )

    estilos = _estilos_pdf()
    story = []

    nome_atleta = atleta.get("codigo_anonimizado") or atleta.get("nome", "Atleta")

    def _header_footer(canvas, document):
        canvas.saveState()
        canvas.setFillColor(COR_PRIMARIA)
        canvas.rect(0, PAGE_H - 0.5*cm, PAGE_W, 0.5*cm, stroke=0, fill=1)

        canvas.setFillColor(COR_BLACK)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(MARGIN, PAGE_H - 1.2*cm, "HISTÓRICO COMPLETO DO ATLETA")
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 1.2*cm, f"Atleta: {nome_atleta}")

        canvas.setStrokeColor(COR_GRAY_LIGHT)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, PAGE_H - 1.3*cm, PAGE_W - MARGIN, PAGE_H - 1.3*cm)

        canvas.line(MARGIN, 1.5*cm, PAGE_W - MARGIN, 1.5*cm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(COR_GRAY)
        canvas.drawString(MARGIN, 1.1*cm, f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        canvas.drawRightString(PAGE_W - MARGIN, 1.1*cm, f"Pág. {document.page}")
        canvas.restoreState()

    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("HISTÓRICO EVOLUTIVO", estilos["titulo"]))
    story.append(Paragraph(f"Atleta: <b>{nome_atleta}</b>", estilos["subtitulo"]))
    story.append(Paragraph(f"Relatório contendo o compilado de todas as sessões registradas cronologicamente.", estilos["corpo_cinza"]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Últimas sessões", estilos["subtitulo"]))
    table_data = [["Data", "Modalidade", "Taxa (L/h)", "Variação (%)", "Ingestão (ml)"]]
    for s in sessoes[:10]:  
        dt = s.get("criada_em") or s.get("criado_em")
        
        taxa = s.get("taxa_sudorese_lh") or s.get("taxa_sudorese")
        taxa_str = f"{taxa:.2f}" if isinstance(taxa, (int, float)) else "—"

        var_massa = s.get("variacao_massa_pct") or s.get("variacao_peso_pct")
        var_massa_str = f"{var_massa:.1f}%" if isinstance(var_massa, (int, float)) else "—"

        ingestao = s.get("total_ingestao_ml") or s.get("ingestao_ml")
        ingestao_str = f"{ingestao:.0f} ml" if isinstance(ingestao, (int, float)) else "—"

        table_data.append([
            _formatar_data(dt),
            s.get("modalidade") or "—",
            taxa_str,
            var_massa_str,
            ingestao_str,
        ])

    col_w = [4*cm, 3.5*cm, 3*cm, 3*cm, 3.5*cm]
    t2 = Table(table_data, colWidths=col_w, repeatRows=1)
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COR_PRIMARIA),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D3D1C7")),
        ("ALIGN", (2, 0), (-1, -1), "CENTER"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
    ]))
    for r_idx in range(1, len(table_data)):
        bg = COR_WHITE if r_idx % 2 == 1 else COR_GRAY_LIGHT
        t2.setStyle(TableStyle([("BACKGROUND", (0, r_idx), (-1, r_idx), bg)]))

    story.append(t2)
    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    buffer.seek(0)
    return buffer.getvalue()


def gerar_pdf_historico_equipe(sessoes_por_atleta: dict, profissional: dict) -> bytes:
    """
    Gera PDF consolidando o histórico de múltiplos atletas da equipe,
    incluindo Modalidade, Nome, Ingestão de Água e Cor da Urina Final.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN
    )

    estilos = _estilos_pdf()
    story = []

    nome_prof = profissional.get("nome", "Profissional")
    email_prof = profissional.get("email", "—")
    modalidade_equipe = profissional.get("modalidade_equipe")

    if modalidade_equipe:
        titulo_principal = f"HISTÓRICO DA EQUIPE - {modalidade_equipe.upper()}"
    else:
        titulo_principal = "HISTÓRICO DA EQUIPE"

    def _header_footer(canvas, document):
        canvas.saveState()
        canvas.setFillColor(COR_PRIMARIA)
        canvas.rect(0, PAGE_H - 0.5*cm, PAGE_W, 0.5*cm, stroke=0, fill=1)

        canvas.setFillColor(COR_BLACK)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(MARGIN, PAGE_H - 1.2*cm, titulo_principal)
        
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 1.2*cm, f"Prof. {nome_prof} ({email_prof})")

        canvas.setStrokeColor(COR_GRAY_LIGHT)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, PAGE_H - 1.3*cm, PAGE_W - MARGIN, PAGE_H - 1.3*cm)

        canvas.line(MARGIN, 1.5*cm, PAGE_W - MARGIN, 1.5*cm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(COR_GRAY)
        data_str = datetime.now().strftime("%d/%m/%Y %H:%M")
        canvas.drawString(MARGIN, 1.1*cm, f"Gerado em: {data_str}")
        canvas.drawRightString(PAGE_W - MARGIN, 1.1*cm, f"Pág. {document.page}")
        canvas.restoreState()

    story.append(Spacer(1, 1*cm))
    story.append(Paragraph(titulo_principal, estilos["titulo"]))
    
    texto_subtitulo = f"Relatório consolidado de monitoramento de hidratação e sudorese."
    if modalidade_equipe:
        texto_subtitulo += f" Filtro aplicado: atletas com atividades na modalidade <b>{modalidade_equipe}</b>."
        
    story.append(Paragraph(texto_subtitulo, estilos["corpo_cinza"]))
    story.append(Spacer(1, 1.5*cm))

    atleta_ids = list(sessoes_por_atleta.keys())
    for i, atl_id in enumerate(atleta_ids):
        dados = sessoes_por_atleta[atl_id]
        nome_atleta = dados.get("codigo_anonimizado") or dados.get("nome", "Atleta")
        sessoes = dados.get("sessoes", [])

        atleta_story = []
        atleta_story.append(HRFlowable(width="100%", thickness=1.5, color=COR_SECUNDARIA, spaceAfter=8))
        atleta_story.append(Paragraph(f"Atleta: {nome_atleta}", estilos["subtitulo"]))
        atleta_story.append(Paragraph(f"Total de sessões avaliadas: {len(sessoes)}", estilos["corpo_cinza"]))
        atleta_story.append(Spacer(1, 6))

        if not sessoes:
            atleta_story.append(Paragraph("<i>Nenhuma sessão concluída registrada para este atleta nesta filtragem.</i>", estilos["corpo"]))
            atleta_story.append(Spacer(1, 1*cm))
            story.append(KeepTogether(atleta_story))
            continue

        # CABEÇALHO ATUALIZADO CONFORME PEDIDO
        table_data = [["Data/Hora", "Atleta", "Modalidade", "Taxa", "Var. Peso", "Ingestão", "Urina Final"]]
        
        for s in sessoes:
            dt = s.get("criado_em") or s.get("criada_em")
            
            taxa = s.get("taxa_sudorese") or s.get("taxa_sudorese_lh")
            taxa_str = f"{taxa:.2f} L/h" if isinstance(taxa, (int, float)) else "—"

            var_massa = s.get("variacao_peso_pct") or s.get("variacao_massa_pct")
            var_massa_str = f"{var_massa:.1f}%" if isinstance(var_massa, (int, float)) else "—"

            ingestao = s.get("total_ingestao_ml") or s.get("ingestao_ml")
            ingestao_str = f"{ingestao:.0f} ml" if isinstance(ingestao, (int, float)) else "—"
            
            urina = s.get("cor_urina_final") or s.get("cor_urina_pos") or "—"

            table_data.append([
                _formatar_data(dt),
                nome_atleta,
                s.get("modalidade") or "—",
                taxa_str,
                var_massa_str,
                ingestao_str,
                str(urina)
            ])

        # Redistribuição das larguras das colunas para caber perfeitamente na folha A4 (Total 17cm de largura útil)
        col_w = [2.8*cm, 2.7*cm, 2.5*cm, 2.0*cm, 2.0*cm, 2.5*cm, 2.5*cm]
        
        t2 = Table(table_data, colWidths=col_w, repeatRows=1)
        t2.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), COR_PRIMARIA),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8), # Fonte levemente menor para comportar o volume de colunas
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D3D1C7")),
            ("ALIGN", (3, 0), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
        ]))
        
        for row_idx in range(1, len(table_data)):
            bg = COR_WHITE if row_idx % 2 == 1 else COR_GRAY_LIGHT
            t2.setStyle(TableStyle([("BACKGROUND", (0, row_idx), (-1, row_idx), bg)]))

        atleta_story.append(t2)
        atleta_story.append(Spacer(1, 1.5*cm))

        story.append(KeepTogether(atleta_story))

        if i < len(atleta_ids) - 1:
            story.append(PageBreak())

    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    buffer.seek(0)
    return buffer.getvalue()