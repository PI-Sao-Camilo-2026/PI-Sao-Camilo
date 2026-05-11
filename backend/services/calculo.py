from __future__ import annotations
from typing import Optional

FATOR_VESTIMENTA = {
    "seco":       0.0,
    "umido":      0.2,   
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
    
    """
    Fórmula:
        Taxa (L/h) = (Perda_kg_corrigida + Fluidos_L) / Duração_h
        Variação (%) = (Peso_pré − Peso_pós) / Peso_pré × 100

    Args:
        peso_pre:            Peso antes do treino (kg)
        peso_pos:            Peso após o treino (kg)
        ingestao_ml:         Total ingerido durante o treino (ml)
        duracao_minutos:     Duração do treino (min)
        condicao_vestimenta: "seco" | "umido" | "encharcado"
        urina_ml:            Volume urinado durante o treino (ml)

    Returns:
        dict com taxa_sudorese, variacao_peso_pct, perda_kg_total
    """

    if duracao_minutos <= 0:
        raise ValueError("Duração deve ser maior que zero")

    if not peso_pre or peso_pre <= 0:
        raise ValueError("Peso pré-treino deve ser maior que zero")

    correcao   = FATOR_VESTIMENTA.get(condicao_vestimenta, 0.2)
    duracao_h  = duracao_minutos / 60
    perda_kg   = (peso_pre - peso_pos) + correcao
    fluidos_l  = (ingestao_ml - urina_ml) / 1000

    taxa_l_h      = (perda_kg + fluidos_l) / duracao_h
    variacao_pct  = ((peso_pre - peso_pos) / peso_pre) * 100

    return {
        "taxa_sudorese":    round(taxa_l_h,     2),
        "variacao_peso_pct": round(variacao_pct, 2),
        "perda_kg_total":   round(perda_kg + fluidos_l, 3),
    }


def gerar_recomendacao(taxa_l_h: float, variacao_pct: float) -> dict:
    intervalo_min             = 15
    ingestao_recomendada_ml_h = taxa_l_h * 1000
    por_intervalo             = ingestao_recomendada_ml_h / (60 / intervalo_min)

    if variacao_pct > 3:
        alerta = (
            "Perda acima de 3% — risco de desempenho prejudicado. "
            "Aumente a hidratação pré-treino."
        )
    elif variacao_pct > 2:
        alerta = "Perda moderada. Fique atento à hidratação nas próximas sessões."
    else:
        alerta = "Hidratação dentro do esperado. Continue assim!"

    texto = (
        f"Para sua próxima sessão nestas condições, sugerimos uma ingestão de "
        f"~{ingestao_recomendada_ml_h:.0f} ml/h. "
        f"Fracione isso bebendo ~{por_intervalo:.0f} ml a cada {intervalo_min} min. "
        f"{alerta}"
    )

    return {
        "texto":                      texto,
        "ingestao_recomendada_ml_h":  round(ingestao_recomendada_ml_h, 1),
        "intervalo_minutos":          intervalo_min,
        "por_intervalo_ml":           round(por_intervalo, 1),
        "alerta":                     alerta,
    }