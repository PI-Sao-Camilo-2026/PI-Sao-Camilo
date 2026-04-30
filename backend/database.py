from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
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
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, nullable=False, index=True)
    senha_hash = Column(String(256), nullable=False)
    tipo = Column(Enum("atleta", "profissional", name="tipo_usuario"), nullable=False)
    sexo = Column(String(20), nullable=True)
    modalidade = Column(String(80), nullable=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    profissional_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    profissional = relationship("Usuario", remote_side=[id], backref="atletas")

    sessoes = relationship("Sessao", back_populates="atleta")


class Sessao(Base):
    __tablename__ = "sessoes"

    id = Column(Integer, primary_key=True)
    atleta_id = Column(Integer, ForeignKey("usuarios.id"))
    atleta = relationship("Usuario", back_populates="sessoes")

    peso_pre = Column(Float)
    temp_celsius = Column(Float)
    umidade_pct = Column(Float)
    cor_urina_basal = Column(Integer)

    ingestao_ml = Column(Float, default=0)

    peso_pos = Column(Float)
    condicao_vestimenta = Column(String(30))

    taxa_sudorese = Column(Float)
    variacao_peso_pct = Column(Float)
    duracao_minutos = Column(Float)

    status = Column(Enum("pre", "durante", "pos", "concluida", name="status_sessao"), default="pre")

    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    fluidos = relationship("RegistroFluido", back_populates="sessao")


class RegistroFluido(Base):
    __tablename__ = "registros_fluido"

    id = Column(Integer, primary_key=True)
    sessao_id = Column(Integer, ForeignKey("sessoes.id"))
    sessao = relationship("Sessao", back_populates="fluidos")
    volume_ml = Column(Float)
    registrado_em = Column(DateTime(timezone=True), server_default=func.now())


class RecomendacaoIA(Base):
    __tablename__ = "recomendacoes_ia"

    id = Column(Integer, primary_key=True)
    sessao_id = Column(Integer, ForeignKey("sessoes.id"))
    texto = Column(Text)
    ingestao_recomendada_ml_h = Column(Float)
    intervalo_minutos = Column(Float)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()