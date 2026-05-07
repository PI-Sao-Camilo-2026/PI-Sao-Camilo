from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    ForeignKey,
    Text,
    Enum
)

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("configurar .env com nova url")


engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ──────────────────────────────────────────────
# USUÁRIOS
# ──────────────────────────────────────────────

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(120), nullable=False)

    email = Column(
        String(180),
        unique=True,
        nullable=False,
        index=True
    )

    senha_hash = Column(String(256), nullable=False)

    tipo = Column(
        Enum("atleta", "profissional", name="tipo_usuario"),
        nullable=False
    )

    sexo = Column(String(20), nullable=True)

    modalidade = Column(String(80), nullable=True)

    codigo_anonimizado = Column(String(10), nullable=True)

    ativo = Column(Boolean, default=True)

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    profissional_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=True
    )

    profissional = relationship(
        "Usuario",
        remote_side=[id],
        backref="atletas"
    )

    sessoes = relationship(
        "Sessao",
        back_populates="atleta",
        foreign_keys="Sessao.atleta_id"
    )


# ──────────────────────────────────────────────
# SESSÕES
# ──────────────────────────────────────────────

class Sessao(Base):
    __tablename__ = "sessoes"

    id = Column(Integer, primary_key=True, index=True)

    atleta_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    atleta = relationship(
        "Usuario",
        back_populates="sessoes",
        foreign_keys=[atleta_id]
    )

    # ─────────────────────────────
    # PRÉ-TREINO
    # ─────────────────────────────

    peso_pre = Column(Float, nullable=True)

    temp_celsius = Column(Float, nullable=True)

    umidade_pct = Column(Float, nullable=True)

    cor_urina_basal = Column(Integer, nullable=True)

    # clima
    sensacao_termica = Column(Float, nullable=True)

    vento = Column(Float, nullable=True)

    radiacao = Column(Float, nullable=True)

    condicao = Column(String(120), nullable=True)

    sol = Column(String(50), nullable=True)

    # checklist
    bexiga_esvaziada = Column(Boolean, default=False)

    vestimenta_padrao = Column(Boolean, default=False)

    # treino
    modalidade = Column(String(120), nullable=True)

    duracao = Column(Float, nullable=True)

    intensidade = Column(String(50), nullable=True)

    vestimenta = Column(String(120), nullable=True)

    sede = Column(String(50), nullable=True)

    sintomas = Column(Text, nullable=True)

    hidratacao = Column(Text, nullable=True)

    # ─────────────────────────────
    # DURANTE
    # ─────────────────────────────

    ingestao_ml = Column(Float, default=0)

    # quantidade urinada durante sessão
    volume_urina_ml = Column(Float, default=0)

    # tempo total da sessão em segundos
    tempo_total_segundos = Column(Integer, default=0)

    # ─────────────────────────────
    # PÓS-TREINO
    # ─────────────────────────────

    peso_pos = Column(Float, nullable=True)

    condicao_vestimenta = Column(
        String(30),
        nullable=True
    )

    # ─────────────────────────────
    # CALCULADOS
    # ─────────────────────────────

    taxa_sudorese = Column(Float, nullable=True)

    variacao_peso_pct = Column(Float, nullable=True)

    duracao_minutos = Column(Float, nullable=True)

    # ─────────────────────────────
    # STATUS
    # ─────────────────────────────

    status = Column(
        Enum(
            "pre",
            "durante",
            "pos",
            "concluida",
            name="status_sessao"
        ),
        default="pre"
    )

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    atualizado_em = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )

    fluidos = relationship(
        "RegistroFluido",
        back_populates="sessao"
    )


# ──────────────────────────────────────────────
# REGISTRO DE FLUIDOS
# ──────────────────────────────────────────────

class RegistroFluido(Base):
    __tablename__ = "registros_fluido"

    id = Column(Integer, primary_key=True, index=True)

    sessao_id = Column(
        Integer,
        ForeignKey("sessoes.id"),
        nullable=False
    )

    sessao = relationship(
        "Sessao",
        back_populates="fluidos"
    )

    volume_ml = Column(Float, nullable=False)

    registrado_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# ──────────────────────────────────────────────
# RECOMENDAÇÕES IA
# ──────────────────────────────────────────────

class RecomendacaoIA(Base):
    __tablename__ = "recomendacoes_ia"

    id = Column(Integer, primary_key=True, index=True)

    sessao_id = Column(
        Integer,
        ForeignKey("sessoes.id"),
        nullable=False
    )

    texto = Column(Text, nullable=False)

    ingestao_recomendada_ml_h = Column(
        Float,
        nullable=True
    )

    intervalo_minutos = Column(
        Float,
        nullable=True
    )

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# ──────────────────────────────────────────────
# DEPENDENCY
# ──────────────────────────────────────────────

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()