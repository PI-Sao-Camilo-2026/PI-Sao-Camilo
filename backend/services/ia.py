import os
import httpx
from services.calculo import gerar_recomendacao

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

async def obter_recomendacao(
    taxa_l_h: float,
    variacao_pct: float,
    temp_celsius: float | None = None,
    umidade_pct: float | None = None,
    modalidade: str | None = None,
    historico_taxas: list[float] | None = None,
) -> dict:

    base = gerar_recomendacao(taxa_l_h, variacao_pct)

    if not ANTHROPIC_API_KEY:
        return base

    contexto_historico = ""
    if historico_taxas:
        media = sum(historico_taxas) / len(historico_taxas)
        contexto_historico = f" Média histórica: {media:.2f} L/h."

    prompt = (
        f"Atleta com taxa de sudorese de {taxa_l_h:.2f} L/h. "
        f"Variação de peso {variacao_pct:.1f}%. "
        f"Modalidade: {modalidade or 'não informada'}. "
        f"Temperatura: {temp_celsius or 'não informada'}°C. "
        f"Umidade: {umidade_pct or 'não informada'}%. "
        f"{contexto_historico} "
        "Dê recomendação de hidratação em 2-3 frases, objetiva e técnica."
    )

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 256,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )

            if resp.status_code == 200:
                ia_text = resp.json()["content"][0]["text"]
                base["texto_ia"] = ia_text

    except Exception as e:
        print("Erro IA:", e)

    return base