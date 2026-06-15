from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth, usuarios, sessoes, fluidos, clima, relatorios
from routers import predicao   # ← novo


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    print("Banco de dados conectado e tabelas verificadas.")
    yield
    print("API encerrada.")


app = FastAPI(
    title="Nutri-Esportiva",
    description="API de hidratação esportiva inteligente — Instituto Mauá de Tecnologia",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://192.168.0.119:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/auth",       tags=["Autenticação"])
app.include_router(usuarios.router,   prefix="/usuarios",   tags=["Usuários"])
app.include_router(sessoes.router,    prefix="/sessoes",    tags=["Sessões"])
app.include_router(fluidos.router,    prefix="/fluidos",    tags=["Fluidos"])
app.include_router(clima.router)
app.include_router(relatorios.router, prefix="/relatorios", tags=["Relatórios"])
app.include_router(predicao.router,   prefix="/predicao",   tags=["Machine Learning"])  


@app.get("/", tags=["Status"])
def root():
    return {"status": "ok", "message": "Nutri-Esportiva API v1.0"}


@app.get("/health", tags=["Status"])
def health():
    return {"status": "ok"}