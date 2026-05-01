from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, usuarios, sessoes, fluidos, clima, relatorios
from database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nutri-Esportiva",
    description="API de hidratação esportiva inteligente",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuários"])
app.include_router(sessoes.router, prefix="/sessoes", tags=["Sessões"])
app.include_router(fluidos.router, prefix="/fluidos", tags=["Fluidos"])
app.include_router(clima.router, prefix="/clima", tags=["Clima"])
app.include_router(relatorios.router, prefix="/relatorios", tags=["Relatórios"])
app.include_router(auth.router, prefix="/api/auth")

@app.get("/")
def root():
    return {"status": "ok", "message": "Nutri-Esportiva API v1.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
