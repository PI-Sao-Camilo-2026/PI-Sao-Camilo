from __future__ import annotations

import logging
import os
from typing import Optional

import httpx

from services.calculo import gerar_recomendacao

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODELO            = "claude-haiku-4-5-20251001"
MAX_RETRIES       = 2      
TIMEOUT_S         = 15.0


async def obter_recomendacao(
    taxa_l_h: float,
    variacao_pct: float,
    duracao_segundos: Optional[float] = None,
    temp_celsius: Optional[float] = None,
    umidade_pct: Optional[float] = None,
    modalidade: Optional[str] = None,
    historico_taxas: Optional[list[float]] = None,
) -> dict:
    base = gerar_recomendacao(taxa_l_h, variacao_pct, duracao_segundos=duracao_segundos)

    if not ANTHROPIC_API_KEY:
        logger.info("ANTHROPIC_API_KEY não configurada — usando recomendação base.")
        return base

    contexto_historico = ""
    if historico_taxas:
        media = sum(historico_taxas) / len(historico_taxas)
        contexto_historico = (
            f" Histórico do atleta: média de {media:.2f} L/h "
            f"nas últimas {len(historico_taxas)} sessões."
        )

    prompt = (
        f"Atleta com taxa de sudorese de {taxa_l_h:.2f} L/h "
        f"e variação de massa de {variacao_pct:.1f}%. "
        f"Modalidade: {modalidade or 'não informada'}. "
        f"Temperatura: {temp_celsius if temp_celsius is not None else 'não informada'}°C. "
        f"Umidade: {umidade_pct if umidade_pct is not None else 'não informada'}%."
        f"{contexto_historico} "
        "Com base nesses dados, forneça uma recomendação de hidratação "
        "em 2 a 3 frases, objetiva e técnica, adequada para o contexto esportivo."
    )

    for tentativa in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key":         ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "content-type":      "application/json",
                    },
                    json={
                        "model":      MODELO,
                        "max_tokens": 256,
                        "messages":   [{"role": "user", "content": prompt}],
                    },
                )

            if resp.status_code == 200:
                content = resp.json().get("content", [])
                if content and content[0].get("text"):
                    base["texto_ia"] = content[0]["text"].strip()
                    logger.info("Recomendação IA gerada (tentativa %d).", tentativa)
                else:
                    logger.warning("API retornou 200 mas content vazio.")
                return base

            elif resp.status_code in (429, 529):
                logger.warning("Rate limit (status %s) — tentativa %d/%d", resp.status_code, tentativa, MAX_RETRIES)
                continue

            else:
                logger.warning("API Anthropic status %s: %s", resp.status_code, resp.text[:200])
                return base

        except httpx.TimeoutException:
            logger.warning("Timeout na chamada IA (tentativa %d/%d).", tentativa, MAX_RETRIES)
        except httpx.RequestError as e:
            logger.warning("Erro de conexão com API Anthropic: %s", e)
            return base   
        except Exception as e:
            logger.error("Erro inesperado na chamada IA: %s", e)
            return base

    logger.warning("Todas as %d tentativas falharam — usando fallback.", MAX_RETRIES)
    return base