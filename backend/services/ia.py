"""
Serviço de recomendações de IA.
Usa cálculo local por padrão; se ANTHROPIC_API_KEY estiver configurada,
enriquece a recomendação com análise contextual do Claude.
"""
import os
import httpx
from services.calculo import gerar_recomendacao


ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"


async def obter_recomendacao(
    taxa_l_h: float,
    variacao_pct: float,
    temp_celsius: float | None = None,
    umidade_pct: float | None = None,
    modalidade: str | None = None,
    historico_taxas: list[float] | None = None,
) -> dict:
    """
    Retorna recomendação de hidratação.
    Se API Key da Anthropic estiver disponível, usa Claude para contexto adicional.
    """
    base = gerar_recomendacao(taxa_l_h, variacao_pct)

    if not ANTHROPIC_API_KEY:
        return base

    # Contexto extra via Claude
    contexto_historico = ""
    if historico_taxas:
        media = sum(historico_taxas) / len(historico_taxas)
        contexto_historico = f" A média histórica do atleta é {media:.2f} L/h."

    prompt = (
        f"Atleta com taxa de sudorese atual de {taxa_l_h:.2f} L/h e variação de peso de "
        f"{variacao_pct:.1f}% durante a sessão."
        f" Modalidade: {modalidade or 'não informada'}."
        f" Temperatura: {temp_celsius or 'não informada'}°C."
        f" Umidade: {umidade_pct or 'não informada'}%."
        f"{contexto_historico}"
        " Dê uma recomendação de hidratação personalizada e objetiva em 2-3 frases em português, "
        "focando nos próximos treinos. Seja direto e técnico."
    )

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                ANTHROPIC_URL,
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 256,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            if resp.status_code == 200:
                ia_text = resp.json()["content"][0]["text"]
                base["texto_ia"] = ia_text
    except Exception:
        pass  # Fallback para recomendação local

    return base