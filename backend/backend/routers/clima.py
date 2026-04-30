import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from routers.auth import get_current_user
from database import Usuario

router = APIRouter()

OWM_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OWM_URL = "https://api.openweathermap.org/data/2.5/weather"


@router.get("/atual")
async def clima_atual(
    cidade: str,
    current: Usuario = Depends(get_current_user),
):
    """Retorna temperatura e umidade atual para preenchimento automático do pré-treino."""
    if not OWM_KEY:
        raise HTTPException(status_code=503, detail="Chave OpenWeatherMap não configurada")

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(OWM_URL, params={
            "q": cidade,
            "appid": OWM_KEY,
            "units": "metric",
            "lang": "pt_br",
        })

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Cidade não encontrada")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro ao consultar OpenWeatherMap")

    data = resp.json()
    return {
        "cidade": data["name"],
        "temp_celsius": round(data["main"]["temp"], 1),
        "umidade_pct": data["main"]["humidity"],
        "descricao": data["weather"][0]["description"],
        "icone": data["weather"][0]["icon"],
    }