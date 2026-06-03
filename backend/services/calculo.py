from __future__ import annotations
from typing import Dict

FATOR_VESTIMENTA = {
    "seco": 0.0,
    "umido": 0.2,
    "encharcado": 0.5,
}


def calcular_taxa_sudorese(
    peso_pre: float,
    peso_pos: float,
    ingestao_ml: float,
    duracao_minutos: float,
    condicao_vestimenta: str = "umido",
    urina_ml: float = 0.0,
) -> dict:
    if duracao_minutos <= 0:
        print("[ERROR] duração inválida")
        raise ValueError("Duração inválida")

    if peso_pre <= 0 or peso_pos <= 0:
        print("[ERROR] pesos inválidos")
        raise ValueError("Pesos inválidos")

    duracao_h = duracao_minutos / 60

    perda_kg = abs(peso_pre - peso_pos)
    balanco_fluido = max(-2.0, min(2.0, (ingestao_ml - urina_ml) / 1000))

    perda_liquida = perda_kg + balanco_fluido

    fator = 1 + FATOR_VESTIMENTA.get(condicao_vestimenta, 0.2)
    perda_ajustada = perda_liquida * fator

    taxa_l_h = max(0, perda_ajustada / duracao_h)

    variacao_pct = (perda_ajustada / peso_pre) * 100
    if duracao_minutos is None or duracao_minutos <= 5:
        return {
        "taxa_sudorese": 1.0,
        "variacao_peso_pct": round(variacao_pct, 2),
        "perda_liquida_kg": round(perda_ajustada, 3),
        "alerta": "Sessão muito curta para cálculo confiável"
        }
    return {
        "taxa_sudorese": round(taxa_l_h, 2),
        "variacao_peso_pct": round(variacao_pct, 2),
        "perda_liquida_kg": round(perda_ajustada, 3),
    }


def gerar_recomendacao(
    taxa_l_h: float,
    variacao_pct: float,
    duracao_segundos: float
) -> dict:

    intervalo_min = 15

    # ================================
    # 🔴 VALIDAÇÃO BÁSICA
    # ================================
    if not duracao_segundos or duracao_segundos <= 300:
        return {
            "texto": "Tempo de sessão muito curto. Não foi possível gerar recomendação.",
            "ingestao_recomendada_ml_h": 500.0,
            "intervalo_minutos": intervalo_min,
            "por_intervalo_ml": 125.0,
            "alerta": "Dados insuficientes."
        }

    # converte para horas (FONTE ÚNICA DE VERDADE)
    duracao_horas = duracao_segundos / 3600


    # ================================
    # 🔵 INGESTÃO BASEADA NA SUDORESE
    # ================================
    taxa_l_h = max(0.1, min(float(taxa_l_h), 2.5))  # clamp fisiológico

    ingestao_recomendada_ml_h = taxa_l_h * 1000 * 0.8
    ingestao_recomendada_ml_h = max(150, min(1200, ingestao_recomendada_ml_h))

    por_intervalo = ingestao_recomendada_ml_h / (60 / intervalo_min)

    # ================================
    # ⚠️ ALERTAS
    # ================================
    if variacao_pct > 3:
        alerta = "Perda acima de 3% — risco alto de desidratação."
        nivel = "ALTO"
    elif variacao_pct > 2:
        alerta = "Perda moderada. Ajuste hidratação entre sessões."
        nivel = "MODERADO"
    else:
        alerta = "Hidratação dentro do esperado. Continue assim!"
        nivel = "OK"

    # ================================
    # TEXTO FINAL
    # ================================
    texto = (
        f"[{nivel}] Taxa de sudorese: {taxa_l_h:.2f} L/h. "
        f"Recomendação: {ingestao_recomendada_ml_h:.0f} ml/h. "
        f"Beba ~{por_intervalo:.0f} ml a cada {intervalo_min} min. "
        f"{alerta}"
    )


    return {
        "texto": texto,
        "taxa_sudorese": round(taxa_l_h, 2),
        "ingestao_recomendada_ml_h": round(ingestao_recomendada_ml_h, 1),
        "intervalo_minutos": intervalo_min,
        "por_intervalo_ml": round(por_intervalo, 1),
        "variacao_peso_pct": round(variacao_pct, 2),
        "nivel": nivel,
        "alerta": alerta
    }