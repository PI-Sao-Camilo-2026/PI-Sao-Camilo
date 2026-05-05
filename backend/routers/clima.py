import os
import httpx

from fastapi import APIRouter, HTTPException, Depends

from routers.auth import get_current_user
from database import Usuario

router = APIRouter(prefix="/clima", tags=["Clima"])

# ✅ URL correta da API
OWM_URL = "https://api.openweathermap.org/data/2.5/weather"

# ✅ chave do .env
OWM_KEY = os.getenv("OPENWEATHER_API_KEY")


@router.get("/atual")
async def clima_atual(
    cidade: str,
):
    """
    Retorna dados climáticos atuais para preenchimento automático do pré-treino.
    """

    # ✅ valida chave
    if not OWM_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chave OpenWeatherMap não configurada"
        )

    try:
        print("KEY:", OWM_KEY)
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                OWM_URL,
                params={
                    "q": cidade,
                    "appid": OWM_KEY,
                    "units": "metric",
                    "lang": "pt_br",
                }
            )
            print("KEY:", OWM_KEY)
            print("STATUS:", resp.status_code)
            print("RESPOSTA:", resp.text)

    # ✅ erro de conexão/timeout
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Erro de conexão com OpenWeatherMap"
        )

    # ✅ cidade inválida
    if resp.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail="Cidade não encontrada"
        )

    # ✅ outros erros
    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Erro ao consultar OpenWeatherMap"
        )

    data = resp.json()

    # ✅ proteção contra campos ausentes
    main = data.get("main", {})
    weather = data.get("weather", [{}])
    wind = data.get("wind", {})

    return {
        "cidade": data.get("name"),

        "temp_celsius": round(main.get("temp", 0), 1),

        "umidade_pct": main.get("humidity"),

        "descricao": weather[0].get("description"),

        "icone": weather[0].get("icon"),

        # OpenWeather retorna em m/s
        "vento_mps": wind.get("speed", 0),
    }

#     return {
#     "cidade": cidade,
#     "temp_celsius": 28,
#     "umidade_pct": 70,
#     "descricao": "céu limpo",
#     "icone": "01d",
#     "vento_mps": 2.5,
# }