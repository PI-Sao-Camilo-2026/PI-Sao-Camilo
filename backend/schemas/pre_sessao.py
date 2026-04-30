from pydantic import BaseModel
from typing import Optional

class PreSessao(BaseModel):
    peso: float
    bexiga: bool
    vestimentaPadrao: bool

    temperatura: Optional[float] = None
    umidade: Optional[float] = None
    sensacaoTermica: Optional[float] = None
    vento: Optional[float] = None
    sol: Optional[str] = None

    modalidade: Optional[str] = None
    duracao: Optional[int] = None
    intensidade: Optional[str] = None

    vestimenta: Optional[str] = None

    urina: int
    sede: Optional[str] = None
    sintomas: Optional[str] = None
    hidratacao: Optional[str] = None