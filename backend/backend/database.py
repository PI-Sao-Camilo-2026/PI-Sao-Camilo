from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum
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

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ──────────────────────────────────────────────
# MODELOS
# ──────────────────────────────────────────────

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, nullable=False, index=True)
    senha_hash = Column(String(256), nullable=False)
    tipo = Column(Enum("atleta", "profissional", name="tipo_usuario"), nullable=False)
    sexo = Column(String(20), nullable=True)
    modalidade = Column(String(80), nullable=True)
    
    codigo_anonimizado = Column(String(10), nullable=True) 

    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    profissional_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    profissional = relationship("Usuario", remote_side=[id], backref="atletas")

    sessoes = relationship("Sessao", back_populates="atleta", foreign_keys="Sessao.atleta_id")


class Sessao(Base):
    __tablename__ = "sessoes"

    id = Column(Integer, primary_key=True, index=True)
    atleta_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    atleta = relationship("Usuario", back_populates="sessoes", foreign_keys=[atleta_id])

    # Pré-treino
    peso_pre = Column(Float, nullable=True)
    temp_celsius = Column(Float, nullable=True)
    umidade_pct = Column(Float, nullable=True)
    cor_urina_basal = Column(Integer, nullable=True)  # 0-7

    # Durante
    ingestao_ml = Column(Float, default=0)

    # Pós-treino
    peso_pos = Column(Float, nullable=True)
    condicao_vestimenta = Column(String(30), nullable=True)  # seco | umido | encharcado

    # Calculados
    taxa_sudorese = Column(Float, nullable=True)  # L/h
    variacao_peso_pct = Column(Float, nullable=True)
    duracao_minutos = Column(Float, nullable=True)

    status = Column(
        Enum("pre", "durante", "pos", "concluida", name="status_sessao"),
        default="pre"
    )

    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    fluidos = relationship("RegistroFluido", back_populates="sessao")


class RegistroFluido(Base):
    __tablename__ = "registros_fluido"

    id = Column(Integer, primary_key=True, index=True)
    sessao_id = Column(Integer, ForeignKey("sessoes.id"), nullable=False)
    sessao = relationship("Sessao", back_populates="fluidos")
    volume_ml = Column(Float, nullable=False)
    registrado_em = Column(DateTime(timezone=True), server_default=func.now())


class RecomendacaoIA(Base):
    __tablename__ = "recomendacoes_ia"

    id = Column(Integer, primary_key=True, index=True)
    sessao_id = Column(Integer, ForeignKey("sessoes.id"), nullable=False)
    texto = Column(Text, nullable=False)
    ingestao_recomendada_ml_h = Column(Float, nullable=True)
    intervalo_minutos = Column(Float, nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())


# ──────────────────────────────────────────────
# DEPENDENCY
# ──────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()