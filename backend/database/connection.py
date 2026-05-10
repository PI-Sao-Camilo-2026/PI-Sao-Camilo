from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL não definida. "
        "Crie um arquivo .env com: DATABASE_URL=postgresql://user:senha@host:5432/nutri_esportiva"
    )

engine = create_engine(
    DATABASE_URL,
    echo=False,           # True para ver SQL no terminal (só em dev)
    pool_pre_ping=True,   # verifica conexão antes de usar (evita erros de conexão morta)
    pool_size=5,          # conexões permanentes no pool
    max_overflow=10,      # conexões extras permitidas em pico de tráfego
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()