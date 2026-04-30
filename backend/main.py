from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, usuarios, sessoes, fluidos, clima, relatorios
from database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nutri-Esportiva",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(usuarios.router, prefix="/usuarios")
app.include_router(sessoes.router, prefix="/sessoes")
app.include_router(fluidos.router, prefix="/fluidos")
app.include_router(clima.router, prefix="/clima")
app.include_router(relatorios.router, prefix="/relatorios")

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok"}