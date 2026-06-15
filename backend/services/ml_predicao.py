"""
services/ml_predicao.py

Módulo de Machine Learning — Random Forest Regressor
RF14: Predição da taxa de sudorese esperada (pré-sessão)
RNF10: Ativado apenas com >= 8 sessões históricas
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)

MIN_SESSOES   = 8
N_ESTIMATORS  = 100
RANDOM_STATE  = 42

INTENSIDADE_MAP: dict[str, int] = {
    "baixa": 1, "leve": 1,
    "moderada": 2, "media": 2, "média": 2,
    "alta": 3, "intensa": 3,
    "maxima": 4, "máxima": 4,
}

MODELS_DIR = Path(os.getenv("ML_MODELS_DIR", "ml_models"))
MODELS_DIR.mkdir(exist_ok=True)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _intensidade_num(intensidade: Optional[str]) -> float:
    if not intensidade:
        return 2.0
    return float(INTENSIDADE_MAP.get(intensidade.lower().strip(), 2))


def _modelo_path(atleta_id: int) -> Path:
    return MODELS_DIR / f"rf_atleta_{atleta_id}.joblib"

def _encoder_path(atleta_id: int) -> Path:
    return MODELS_DIR / f"le_atleta_{atleta_id}.joblib"


def _sessao_para_row(s: dict, le: Optional[LabelEncoder] = None) -> list[float]:
    """Converte um dict de sessão numa lista de floats (sem nomes de colunas)."""
    mod_str = (s.get("modalidade") or "outro").lower().strip()
    if le is not None and mod_str in le.classes_:
        mod_enc = float(le.transform([mod_str])[0])
    else:
        mod_enc = 0.0

    return [
        float(s.get("peso_pre") or 70.0),
        float(s.get("temp_celsius") or 25.0),
        float(s.get("umidade_pct") or 60.0),
        float(s.get("duracao") or s.get("duracao_minutos") or 60.0),
        _intensidade_num(s.get("intensidade")),
        mod_enc,
        float(s.get("cor_urina_basal") or 3.0),
    ]


# ── API pública ───────────────────────────────────────────────────────────────

def treinar_modelo(atleta_id: int, sessoes: list[dict]) -> bool:
    validas = [s for s in sessoes if s.get("taxa_sudorese") is not None]

    if len(validas) < MIN_SESSOES:
        logger.info("Atleta %s: %d sessões — mínimo %d", atleta_id, len(validas), MIN_SESSOES)
        return False

    # Encoder de modalidade
    modalidades = [(s.get("modalidade") or "outro").lower().strip() for s in validas]
    le = LabelEncoder()
    le.fit(modalidades)

    # Monta X e y como numpy arrays puros (sem nomes de colunas)
    X = np.array([_sessao_para_row(s, le) for s in validas], dtype=float)
    y = np.array([float(s["taxa_sudorese"]) for s in validas], dtype=float)

    model = RandomForestRegressor(n_estimators=N_ESTIMATORS, random_state=RANDOM_STATE, n_jobs=-1)
    model.fit(X, y)

    joblib.dump(model, _modelo_path(atleta_id))
    joblib.dump(le,    _encoder_path(atleta_id))

    logger.info("Modelo treinado para atleta %s com %d sessões", atleta_id, len(validas))
    return True


def prever_taxa_sudorese(
    atleta_id: int,
    peso_pre: float,
    temp_celsius: Optional[float] = None,
    umidade_pct: Optional[float] = None,
    duracao: Optional[float] = None,
    intensidade: Optional[str] = None,
    modalidade: Optional[str] = None,
    cor_urina_basal: Optional[int] = None,
) -> Optional[dict]:

    if not modelo_disponivel(atleta_id):
        return None

    try:
        model: RandomForestRegressor = joblib.load(_modelo_path(atleta_id))
        le: LabelEncoder             = joblib.load(_encoder_path(atleta_id))
    except Exception as exc:
        logger.warning("Erro ao carregar modelo atleta %s: %s", atleta_id, exc)
        return None

    # Monta vetor de predição como numpy array puro (sem DataFrame)
    row = _sessao_para_row({
        "peso_pre":       peso_pre,
        "temp_celsius":   temp_celsius,
        "umidade_pct":    umidade_pct,
        "duracao":        duracao,
        "intensidade":    intensidade,
        "modalidade":     modalidade,
        "cor_urina_basal": cor_urina_basal,
    }, le)

    X_novo = np.array([row], dtype=float)

    taxa_prevista = float(model.predict(X_novo)[0])
    taxa_prevista = max(0.1, round(taxa_prevista, 2))

    # Confiança: desvio padrão entre as 100 árvores (numpy arrays — sem warning)
    preds_arvores = np.array([t.predict(X_novo)[0] for t in model.estimators_])
    desvio = float(np.std(preds_arvores))

    confianca = "alta" if desvio < 0.15 else "media" if desvio < 0.30 else "baixa"

    logger.info("Predição atleta %s: %.2f L/h (confiança=%s)", atleta_id, taxa_prevista, confianca)

    return {
        "taxa_prevista":  taxa_prevista,
        "confianca":      confianca,
        "sessoes_usadas": len(model.estimators_),
    }


def modelo_disponivel(atleta_id: int) -> bool:
    return _modelo_path(atleta_id).exists() and _encoder_path(atleta_id).exists()