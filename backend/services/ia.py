from __future__ import annotations  
import logging
import os
from typing import Optional
import httpx
from services.calculo import gerar_recomendacao
logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

MODELO = "claude-haiku-4-5-20251001"


async def obter_recomendacao(
    taxa_l_h: float,
    variacao_pct: float,
    temp_celsius: Optional[float] = None,
    umidade_pct: Optional[float] = None,
    modalidade: Optional[str] = None,
    historico_taxas: Optional[list[float]] = None,
) -> dict:
    """
    Gera recomendação de hidratação personalizada via IA.

    Tenta chamar a API do Claude. Se a chave não estiver configurada
    ou a chamada falhar, retorna o fallback calculado localmente.

    Args:
        taxa_l_h:        Taxa de sudorese calculada (L/h)
        variacao_pct:    Variação de massa corporal (%)
        temp_celsius:    Temperatura ambiente (°C)
        umidade_pct:     Umidade relativa do ar (%)
        modalidade:      Modalidade esportiva do atleta
        historico_taxas: Taxas das últimas sessões para contexto

    Returns:
        dict com texto, texto_ia (se disponível), ingestao_recomendada_ml_h,
        intervalo_minutos, por_intervalo_ml, alerta
    """
    base = gerar_recomendacao(taxa_l_h, variacao_pct)

    if not ANTHROPIC_API_KEY:
        logger.info("ANTHROPIC_API_KEY não configurada — usando recomendação base.")
        return base

    contexto_historico = ""
    if historico_taxas:
        media = sum(historico_taxas) / len(historico_taxas)
        contexto_historico = (
            f" O histórico do atleta aponta média de {media:.2f} L/h "
            f"nas últimas {len(historico_taxas)} sessões."
        )

    prompt = (
        f"Atleta com taxa de sudorese de {taxa_l_h:.2f} L/h "
        f"e variação de massa de {variacao_pct:.1f}%. "
        f"Modalidade: {modalidade or 'não informada'}. "
        f"Temperatura: {temp_celsius if temp_celsius is not None else 'não informada'}°C. "
        f"Umidade: {umidade_pct if umidade_pct is not None else 'não informada'}%. "
        f"{contexto_historico} "
        "Com base nesses dados, forneça uma recomendação de hidratação "
        "em 2 a 3 frases, objetiva e técnica, adequada para o contexto esportivo."
    )

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key":           ANTHROPIC_API_KEY,
                    "anthropic-version":   "2023-06-01",
                    "content-type":        "application/json",
                },
                json={
                    "model":      MODELO,
                    "max_tokens": 256,
                    "messages":   [{"role": "user", "content": prompt}],
                },
            )

        if resp.status_code == 200:
            ia_text = resp.json()["content"][0]["text"]
            base["texto_ia"] = ia_text.strip()
            logger.info("Recomendação IA gerada com sucesso.")
        else:
            logger.warning(
                "API Anthropic retornou status %s: %s",
                resp.status_code,
                resp.text[:200],
            )

    except httpx.TimeoutException:
        logger.warning("Timeout na chamada à API Anthropic — usando fallback.")
    except httpx.RequestError as e:
        logger.warning("Erro de conexão com API Anthropic: %s — usando fallback.", e)
    except Exception as e:
        logger.error("Erro inesperado na chamada IA: %s", e)

    return base