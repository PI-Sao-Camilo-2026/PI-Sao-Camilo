import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(prefix="/clima", tags=["Clima"])

OWM_URL = "https://api.openweathermap.org/data/2.5/weather"
OWM_KEY = os.getenv("OPENWEATHER_API_KEY")


@router.get("/atual")
async def clima_atual(
    cidade: Optional[str] = Query(default=None, description="Nome da cidade"),
    lat: Optional[float]  = Query(default=None, description="Latitude"),
    lon: Optional[float]  = Query(default=None, description="Longitude"),
):
    
    if not OWM_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chave OpenWeatherMap não configurada no servidor",
        )

    if lat is not None and lon is not None:
        params = {"lat": lat, "lon": lon}
    elif cidade:
        params = {"q": cidade}
    else:
        raise HTTPException(
            status_code=422,
            detail="Informe 'cidade' ou 'lat' e 'lon'",
        )

    params.update({
        "appid": OWM_KEY,
        "units": "metric",
        "lang":  "pt_br",
    })

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(OWM_URL, params=params)
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Erro de conexão com OpenWeatherMap",
        )

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Cidade não encontrada")

    if resp.status_code == 401:
        raise HTTPException(status_code=502, detail="Chave OpenWeatherMap inválida")

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro ao consultar OpenWeatherMap")

    data    = resp.json()
    main    = data.get("main", {})
    weather = data.get("weather", [{}])
    wind    = data.get("wind", {})

    return {
        "cidade":       data.get("name"),
        "temp_celsius": round(main.get("temp",     0), 1),
        "umidade_pct":  main.get("humidity"),
        "descricao":    weather[0].get("description"),
        "icone":        weather[0].get("icon"),
        "vento_mps":    wind.get("speed", 0),
        "sensacao_termica": round(main.get("feels_like", main.get("temp", 0)), 1),
    }