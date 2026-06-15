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

# ── Paleta São Camilo (fiel à imagem: cinza/preto, sem verde) ──────────────
COR_PRIMARIA      = colors.HexColor("#1a1a1a")   # preto texto
COR_LABEL         = colors.HexColor("#555555")   # cinza médio (labels)
COR_BORDA         = colors.HexColor("#CCCCCC")   # borda leve
COR_HEADER_BG     = colors.HexColor("#1a1a1a")   # cabeçalho tabela
COR_LINHA_PAR     = colors.HexColor("#F7F7F7")   # zebra leve
COR_DANGER        = colors.HexColor("#A32D2D")
COR_WHITE         = colors.white
COR_BLACK         = colors.HexColor("#1a1a1a")
COR_GRAY          = colors.HexColor("#555555")
COR_GRAY_LIGHT    = colors.HexColor("#F7F7F7")

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm
CONTENT_W = PAGE_W - 2 * MARGIN


def _estilos_pdf() -> dict:
    styles = getSampleStyleSheet()
    normal = styles["Normal"]
    return {
        "sistema": ParagraphStyle(
            "Sistema", parent=normal, fontName="Helvetica-Bold", fontSize=8,
            leading=10, textColor=COR_GRAY, spaceAfter=4,
            textTransform="uppercase", letterSpacing=1
        ),
        "titulo": ParagraphStyle(
            "DocTitulo", parent=normal, fontName="Helvetica-Bold", fontSize=26,
            leading=30, textColor=COR_BLACK, spaceAfter=6
        ),
        "subtitulo": ParagraphStyle(
            "DocSubtitulo", parent=normal, fontName="Helvetica-Bold", fontSize=14,
            leading=18, textColor=COR_BLACK, spaceBefore=14, spaceAfter=8
        ),
        "h3": ParagraphStyle(
            "DocH3", parent=normal, fontName="Helvetica-Bold", fontSize=11,
            leading=14, textColor=COR_BLACK, spaceBefore=10, spaceAfter=4
        ),
        "corpo": ParagraphStyle(
            "DocCorpo", parent=normal, fontName="Helvetica", fontSize=10,
            leading=14, textColor=COR_BLACK, spaceAfter=4
        ),
        "corpo_cinza": ParagraphStyle(
            "DocCorpoCinza", parent=normal, fontName="Helvetica", fontSize=9,
            leading=13, textColor=COR_GRAY, spaceAfter=4
        ),
        "label": ParagraphStyle(
            "DocLabel", parent=normal, fontName="Helvetica-Bold", fontSize=9,
            leading=12, textColor=COR_BLACK, spaceAfter=2
        ),
        "valor": ParagraphStyle(
            "DocValor", parent=normal, fontName="Helvetica", fontSize=10,
            leading=14, textColor=COR_BLACK, spaceAfter=4
        ),
    }


def _formatar_data(dt_val) -> str:
    if not dt_val:
        return "—"
    if isinstance(dt_val, str):
        try:
            dt_val = datetime.fromisoformat(dt_val.replace("Z", ""))
        except ValueError:
            return dt_val[:10]
    if isinstance(dt_val, datetime):
        return dt_val.strftime("%d/%m/%Y %H:%M")
    return str(dt_val)


def _formatar_data_curta(dt_val) -> str:
    """Retorna só dd/mm/yy para tabelas compactas."""
    if not dt_val:
        return "—"
    if isinstance(dt_val, str):
        try:
            dt_val = datetime.fromisoformat(dt_val.replace("Z", ""))
        except ValueError:
            return dt_val[:10]
    if isinstance(dt_val, datetime):
        return dt_val.strftime("%d/%m/%y")
    return str(dt_val)


# ── CABEÇALHO / RODAPÉ genérico ────────────────────────────────────────────
def _make_header_footer(nome_atleta_ou_titulo: str, subtexto_direita: str = ""):
    def _hf(canvas, document):
        canvas.saveState()
        # Faixa cinza no topo (bem fina, apenas decorativa)
        canvas.setFillColor(colors.HexColor("#EEEEEE"))
        canvas.rect(0, PAGE_H - 0.4*cm, PAGE_W, 0.4*cm, stroke=0, fill=1)

        canvas.setFillColor(COR_BLACK)
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.drawString(MARGIN, PAGE_H - 0.9*cm, "SISTEMA SÃO CAMILO")

        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(COR_GRAY)
        if subtexto_direita:
            canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 0.9*cm, subtexto_direita)

        # Linha separadora do cabeçalho
        canvas.setStrokeColor(COR_BORDA)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, PAGE_H - 1.1*cm, PAGE_W - MARGIN, PAGE_H - 1.1*cm)

        # Rodapé
        canvas.line(MARGIN, 1.5*cm, PAGE_W - MARGIN, 1.5*cm)
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(COR_GRAY)
        canvas.drawString(MARGIN, 1.1*cm, f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        canvas.drawRightString(PAGE_W - MARGIN, 1.1*cm, f"Página {document.page}")
        canvas.restoreState()
    return _hf


# ── RELATÓRIO INDIVIDUAL (histórico por atleta) ─────────────────────────────
def gerar_pdf_historico_atleta(atleta: dict, sessoes: list, profissional: dict = None) -> bytes:
    """
    Layout fiel à imagem: cabeçalho com nome/treinador/data, bloco Dados Médios
    em duas colunas, tabela Registro de Sessões detalhada.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=2.2*cm, bottomMargin=2*cm
    )

    estilos = _estilos_pdf()
    story = []

    nome_atleta  = atleta.get("nome") or atleta.get("codigo_anonimizado") or "Atleta"
    nome_prof    = (profissional or {}).get("nome", "—")
    data_export  = datetime.now().strftime("%d/%m/%Y %H:%M")

    hf = _make_header_footer(nome_atleta, f"Atleta: {nome_atleta}")

    # ── Título principal ────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("Relatório de Treinos", estilos["titulo"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=COR_BORDA, spaceAfter=10))

    # ── Linha de info: Atleta / Treinador / Data exportação ─────────────────
    info_rows = [
        [
            Paragraph("<b>Atleta:</b>", estilos["label"]),
            Paragraph(nome_atleta, estilos["valor"]),
            Paragraph("<b>Data de Exportação:</b>", estilos["label"]),
            Paragraph(data_export, estilos["valor"]),
        ],
        [
            Paragraph("<b>Treinador:</b>", estilos["label"]),
            Paragraph(nome_prof, estilos["valor"]),
            "", "",
        ],
    ]
    t_info = Table(info_rows, colWidths=[3*cm, 5.5*cm, 4*cm, 4.5*cm])
    t_info.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
    ]))
    story.append(t_info)
    story.append(HRFlowable(width="100%", thickness=0.5, color=COR_BORDA, spaceBefore=10, spaceAfter=0))

    # ── Seção Dados Médios ───────────────────────────────────────────────────
    if sessoes:
        story.append(Spacer(1, 0.5*cm))
        story.append(Paragraph("Dados Médios", estilos["subtitulo"]))

        # Cálculos
        n = len(sessoes)
        dur_vals   = [s.get("duracao_minutos", 0) or 0 for s in sessoes]
        intens_vals= [s.get("intensidade", 0) or 0 for s in sessoes]
        perda_vals = [abs(s.get("variacao_peso_pct", 0) or 0) for s in sessoes]
        taxa_vals  = [s.get("taxa_sudorese", 0) or 0 for s in sessoes]
        pre_vals   = [s.get("agua_pre_ml", 0) or s.get("ingestao_ml", 0) or 0 for s in sessoes]
        dur_vals_f = [s.get("agua_dur_ml", 0) or 0 for s in sessoes]
        urina_vals = [s.get("volume_urinario_ml", 0) or 0 for s in sessoes]
        temp_vals  = [s.get("clima_temperatura", 0) or 0 for s in sessoes]

        def avg(lst): return sum(lst) / len(lst) if lst else 0
        def avg_nz(lst): vals = [v for v in lst if v]; return sum(vals) / len(vals) if vals else 0

        perda_kg = avg_nz([
            (s.get("peso_pre") or 0) - (s.get("peso_pos") or 0)
            for s in sessoes
            if s.get("peso_pre") and s.get("peso_pos")
        ])

        # Duas colunas: Resultados Médios | Ingestão Média de Fluidos
        col_dados = [
            ["Sessões Analisadas:",       str(n)],
            ["Duração Média:",            f"{avg_nz(dur_vals):.0f} min" if any(dur_vals) else "—"],
            ["Intensidade Média:",        f"{avg_nz(intens_vals):.1f}" if any(intens_vals) else "—"],
            ["Perda de Massa Corporal:",  f"{perda_kg:.2f} kg" if perda_kg else "—"],
            ["Variação de Massa:",        f"{avg_nz(perda_vals):.2f}%" if any(perda_vals) else "—"],
            ["Taxa de Sudorese Estimada:", f"{avg_nz(taxa_vals):.2f} L/h" if any(taxa_vals) else "—"],
        ]
        col_fluidos = [
            ["Pré exercício:",            f"{avg_nz(pre_vals):.0f} ml" if any(pre_vals) else "—"],
            ["Durante exercício:",        f"{avg_nz(dur_vals_f):.0f} ml" if any(dur_vals_f) else "—"],
            ["Volume Urinário (Durante):", f"{avg_nz(urina_vals):.0f} ml" if any(urina_vals) else "—"],
            ["Temperatura Média:",        f"{avg_nz(temp_vals):.1f} °C" if any(temp_vals) else "—"],
        ]

        def _mini_table(rows):
            data = [[Paragraph(r[0], estilos["corpo_cinza"]),
                     Paragraph(f"<b>{r[1]}</b>", estilos["corpo"])] for r in rows]
            t = Table(data, colWidths=[4.8*cm, 2.8*cm])
            t.setStyle(TableStyle([
                ("VALIGN",        (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING",    (0, 0), (-1, -1), 0),
                ("LINEBELOW", (0, -1), (-1, -1), 0, colors.white),
            ]))
            return t

        header_dados   = Paragraph("<b>Resultados Médios</b>", estilos["h3"])
        header_fluidos = Paragraph("<b>Ingestão Média de Fluidos</b>", estilos["h3"])

        col_w_med = CONTENT_W / 2 - 0.5*cm
        t_medios = Table(
            [[header_dados, header_fluidos],
             [_mini_table(col_dados), _mini_table(col_fluidos)]],
            colWidths=[col_w_med, col_w_med]
        )
        t_medios.setStyle(TableStyle([
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",    (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING",   (1, 0), (1, -1), 24),
        ]))
        story.append(t_medios)

    # ── Seção Predição ML (opcional) ────────────────────────────────────────
    predicao = atleta.get("predicao")
    if predicao and predicao.get("disponivel"):
        story.append(Spacer(1, 0.3*cm))
        story.append(Paragraph("Predição de Desempenho", estilos["subtitulo"]))

        confianca_txt = {
            "alta":  "Alta — estimativa confiável com base no histórico",
            "media": "Média — estimativa razoável com alguma variação esperada",
            "baixa": "Baixa — histórico ainda reduzido",
        }.get(predicao.get("confianca", ""), "")

        taxa_prev = predicao.get("taxa_prevista", 0)
        ingestao_sug = round(taxa_prev * 1000 * 0.8) if taxa_prev else None

        pred_rows = [
            [Paragraph("<b>Taxa de Sudorese Estimada:</b>", estilos["label"]),
             Paragraph(f"{taxa_prev:.2f} L/h", estilos["valor"])],
            [Paragraph("<b>Ingestão Sugerida:</b>", estilos["label"]),
             Paragraph(f"{ingestao_sug} ml/h" if ingestao_sug else "—", estilos["valor"])],
            [Paragraph("<b>Confiança do Modelo:</b>", estilos["label"]),
             Paragraph(confianca_txt, estilos["corpo_cinza"])],
            [Paragraph("<b>Sessões Usadas no Treino:</b>", estilos["label"]),
             Paragraph(str(predicao.get("sessoes_usadas", "—")), estilos["valor"])],
        ]
        t_pred = Table(pred_rows, colWidths=[5*cm, CONTENT_W - 5*cm])
        t_pred.setStyle(TableStyle([
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING",    (0, 0), (-1, -1), 3),
            ("BACKGROUND",    (0, 0), (-1, -1), COR_LINHA_PAR),
            ("ROWBACKGROUNDS",(0, 0), (-1, -1), [COR_WHITE, COR_LINHA_PAR]),
            ("GRID",          (0, 0), (-1, -1), 0.3, COR_BORDA),
        ]))
        story.append(t_pred)

    # ── Seção Registro de Sessões ────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=COR_BORDA, spaceBefore=10, spaceAfter=0))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Registro de Sessões", estilos["subtitulo"]))

    cabecalho = [
        "Data", "Modalidade", "Duração\n(min)", "Intens.\n(0-10)", "Temp.\n(°C)",
        "Água\nIngerida\nPré (ml)", "Água\nIngerida\nDur. (ml)",
        "Perda de\nMassa (%)", "Sudorese\n(L/h)",
        "Urina\nEliminada\n(ml)", "Cor da\nUrina"
    ]

    table_data = [cabecalho]
    for s in sessoes:
        dt   = s.get("criado_em") or s.get("criada_em")
        taxa = s.get("taxa_sudorese") or s.get("taxa_sudorese_lh")
        var  = s.get("variacao_peso_pct") or s.get("variacao_massa_pct")
        ingestao_pre = s.get("agua_pre_ml") or s.get("ingestao_ml") or 0
        ingestao_dur = s.get("agua_dur_ml") or 0
        urina_vol    = s.get("volume_urinario_ml") or s.get("urina_eliminada_ml") or 0
        cor_urina    = s.get("cor_urina_final") or s.get("cor_urina_pos") or "—"
        temp         = s.get("clima_temperatura")
        intens       = s.get("intensidade")

        table_data.append([
            _formatar_data_curta(dt),
            s.get("modalidade") or "—",
            f"{s.get('duracao_minutos', 0) or 0:.0f}" if s.get("duracao_minutos") else "—",
            f"{intens}" if intens is not None else "—",
            f"{temp:.1f}" if isinstance(temp, (int, float)) else "—",
            f"{ingestao_pre:.0f}" if ingestao_pre else "—",
            f"{ingestao_dur:.0f}" if ingestao_dur else "—",
            f"{var:.1f}%" if isinstance(var, (int, float)) else "—",
            f"{taxa:.2f}" if isinstance(taxa, (int, float)) else "—",
            f"{urina_vol:.0f}" if urina_vol else "—",
            str(cor_urina).upper() if cor_urina and cor_urina != "—" else "—",
        ])

    # Larguras proporcionais à A4 (17cm útil)
    col_w = [1.8*cm, 2.2*cm, 1.4*cm, 1.3*cm, 1.3*cm,
             1.6*cm, 1.6*cm, 1.6*cm, 1.6*cm, 1.6*cm, 2.0*cm]

    t_sess = Table(table_data, colWidths=col_w, repeatRows=1)
    t_sess.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), COR_HEADER_BG),
        ("TEXTCOLOR",     (0, 0), (-1, 0), COR_WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 7.5),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("GRID",          (0, 0), (-1, -1), 0.3, COR_BORDA),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("LEADING",       (0, 0), (-1, 0), 9),
    ]))
    for r in range(1, len(table_data)):
        bg = COR_WHITE if r % 2 == 1 else COR_LINHA_PAR
        t_sess.setStyle(TableStyle([("BACKGROUND", (0, r), (-1, r), bg)]))
        # Pintar perda > 2% de vermelho
        var_val = sessoes[r-1].get("variacao_peso_pct") or sessoes[r-1].get("variacao_massa_pct")
        if isinstance(var_val, (int, float)) and var_val > 2.0:
            t_sess.setStyle(TableStyle([("TEXTCOLOR", (7, r), (7, r), COR_DANGER),
                                        ("FONTNAME",  (7, r), (7, r), "Helvetica-Bold")]))

    story.append(t_sess)
    story.append(Spacer(1, 0.5*cm))

    doc.build(story, onFirstPage=hf, onLaterPages=hf)
    buffer.seek(0)
    return buffer.getvalue()


# ── RELATÓRIO DE SESSÃO ÚNICA (mantido compatível) ─────────────────────────
def gerar_pdf_sessao(dados: dict) -> bytes:
    atleta = dados.get("atleta", {})
    sessao = dados.get("sessao", {})
    rec    = dados.get("recomendacao", {})
    atleta_dict = {"nome": atleta.get("nome", "Atleta"), "codigo_anonimizado": atleta.get("codigo_anonimizado")}
    return gerar_pdf_historico_atleta(atleta_dict, [sessao])


# ── RELATÓRIO DE EQUIPE / MODALIDADE ────────────────────────────────────────
def gerar_pdf_historico_equipe(sessoes_por_atleta: dict, profissional: dict) -> bytes:
    """
    Gera PDF consolidado para todos os atletas de uma modalidade.
    Mesmo estilo visual do relatório individual.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=2.2*cm, bottomMargin=2*cm
    )

    estilos = _estilos_pdf()
    story = []

    nome_prof         = profissional.get("nome", "Profissional")
    email_prof        = profissional.get("email", "—")
    modalidade_equipe = profissional.get("modalidade_equipe")
    data_export       = datetime.now().strftime("%d/%m/%Y %H:%M")

    titulo_pdf = f"Relatório da Equipe"
    if modalidade_equipe:
        titulo_pdf += f" — {modalidade_equipe}"

    subtexto_dir = f"Prof. {nome_prof}"
    hf = _make_header_footer(titulo_pdf, subtexto_dir)

    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph(titulo_pdf, estilos["titulo"]))
    story.append(HRFlowable(width="100%", thickness=0.5, color=COR_BORDA, spaceAfter=10))

    # Linha de info do profissional
    info_rows = [
        [
            Paragraph("<b>Profissional:</b>", estilos["label"]),
            Paragraph(nome_prof, estilos["valor"]),
            Paragraph("<b>Data de Exportação:</b>", estilos["label"]),
            Paragraph(data_export, estilos["valor"]),
        ],
        [
            Paragraph("<b>Modalidade:</b>", estilos["label"]),
            Paragraph(modalidade_equipe or "Todas", estilos["valor"]),
            Paragraph("<b>Atletas:</b>", estilos["label"]),
            Paragraph(str(len(sessoes_por_atleta)), estilos["valor"]),
        ],
    ]
    t_info = Table(info_rows, colWidths=[3*cm, 5.5*cm, 4*cm, 4.5*cm])
    t_info.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
    ]))
    story.append(t_info)

    # ── Um bloco por atleta ─────────────────────────────────────────────────
    atleta_ids = list(sessoes_por_atleta.keys())
    for i, atl_id in enumerate(atleta_ids):
        dados = sessoes_por_atleta[atl_id]
        nome_atleta = dados.get("nome") or dados.get("codigo_anonimizado") or "Atleta"
        sessoes = dados.get("sessoes", [])

        atleta_story = []
        atleta_story.append(HRFlowable(width="100%", thickness=1, color=COR_BORDA, spaceBefore=18, spaceAfter=8))
        atleta_story.append(Paragraph(f"Atleta: {nome_atleta}", estilos["subtitulo"]))
        atleta_story.append(Paragraph(f"Total de sessões: {len(sessoes)}", estilos["corpo_cinza"]))
        atleta_story.append(Spacer(1, 6))

        if not sessoes:
            atleta_story.append(Paragraph("<i>Nenhuma sessão registrada para este atleta.</i>", estilos["corpo"]))
            story.append(KeepTogether(atleta_story))
            continue

        # Tabela de sessões compacta (igual ao individual)
        cabecalho = [
            "Data", "Modalidade", "Dur.\n(min)", "Temp.\n(°C)",
            "Água\nPré (ml)", "Água\nDur. (ml)",
            "Perda\nMassa (%)", "Sudorese\n(L/h)",
            "Urina\n(ml)", "Cor da\nUrina"
        ]
        table_data = [cabecalho]
        for s in sessoes:
            dt   = s.get("criado_em") or s.get("criada_em")
            taxa = s.get("taxa_sudorese") or s.get("taxa_sudorese_lh")
            var  = s.get("variacao_peso_pct") or s.get("variacao_massa_pct")
            ingestao_pre = s.get("agua_pre_ml") or s.get("ingestao_ml") or 0
            ingestao_dur = s.get("agua_dur_ml") or 0
            urina_vol    = s.get("volume_urinario_ml") or s.get("urina_eliminada_ml") or 0
            cor_urina    = s.get("cor_urina_final") or s.get("cor_urina_pos") or "—"
            temp         = s.get("clima_temperatura")

            table_data.append([
                _formatar_data_curta(dt),
                s.get("modalidade") or "—",
                f"{s.get('duracao_minutos', 0) or 0:.0f}" if s.get("duracao_minutos") else "—",
                f"{temp:.1f}" if isinstance(temp, (int, float)) else "—",
                f"{ingestao_pre:.0f}" if ingestao_pre else "—",
                f"{ingestao_dur:.0f}" if ingestao_dur else "—",
                f"{var:.1f}%" if isinstance(var, (int, float)) else "—",
                f"{taxa:.2f}" if isinstance(taxa, (int, float)) else "—",
                f"{urina_vol:.0f}" if urina_vol else "—",
                str(cor_urina).upper() if cor_urina and cor_urina != "—" else "—",
            ])

        col_w = [2.0*cm, 2.5*cm, 1.4*cm, 1.4*cm,
                 1.7*cm, 1.7*cm, 1.8*cm, 1.8*cm, 1.4*cm, 1.7*cm]

        t_s = Table(table_data, colWidths=col_w, repeatRows=1)
        t_s.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0), COR_HEADER_BG),
            ("TEXTCOLOR",     (0, 0), (-1, 0), COR_WHITE),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, -1), 7.5),
            ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("GRID",          (0, 0), (-1, -1), 0.3, COR_BORDA),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("LEADING",       (0, 0), (-1, 0), 9),
        ]))
        for r in range(1, len(table_data)):
            bg = COR_WHITE if r % 2 == 1 else COR_LINHA_PAR
            t_s.setStyle(TableStyle([("BACKGROUND", (0, r), (-1, r), bg)]))
            var_val = sessoes[r-1].get("variacao_peso_pct") or sessoes[r-1].get("variacao_massa_pct")
            if isinstance(var_val, (int, float)) and var_val > 2.0:
                t_s.setStyle(TableStyle([("TEXTCOLOR", (6, r), (6, r), COR_DANGER),
                                        ("FONTNAME",  (6, r), (6, r), "Helvetica-Bold")]))

        atleta_story.append(t_s)
        atleta_story.append(Spacer(1, 0.8*cm))
        story.append(KeepTogether(atleta_story))

        # Quebra de página entre atletas (exceto o último)
        if i < len(atleta_ids) - 1:
            story.append(PageBreak())

    doc.build(story, onFirstPage=hf, onLaterPages=hf)
    buffer.seek(0)
    return buffer.getvalue()