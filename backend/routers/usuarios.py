"""
routers/usuarios.py
Perfil do usuário + gestão de atletas pelo profissional.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import random, string

from database import get_db, Usuario
from dependencies import get_current_user, require_profissional
from services.auth_service import hash_senha

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class UsuarioOut(BaseModel):
    id: int
    nome: str
    email: str
    tipo: str
    sexo: Optional[str]
    modalidade: Optional[str]
    codigo_anonimizado: Optional[str]

    class Config:
        from_attributes = True


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    modalidade: Optional[str] = None
    sexo: Optional[str] = None


class CadastrarAtletaInput(BaseModel):
    """Usado pelo profissional para cadastrar um atleta já vinculado a ele."""
    nome: str
    email: EmailStr
    senha: str = Field(min_length=6)
    sexo: Optional[str] = None
    modalidade: Optional[str] = None
    equipe: Optional[str] = None
    peso_base: Optional[float] = None
    altura: Optional[int] = None
    data_nascimento: Optional[str] = None


# ── Perfil do usuário logado ──────────────────────────────────────────────────

@router.get("/me", response_model=UsuarioOut)
def meu_perfil(current: Usuario = Depends(get_current_user)):
    return current


@router.put("/me", response_model=UsuarioOut)
def atualizar_perfil(
    dados: UsuarioUpdate,
    current: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if dados.nome is not None:
        current.nome = dados.nome.strip()
    if dados.modalidade is not None:
        current.modalidade = dados.modalidade.strip() or None
    if dados.sexo is not None:
        current.sexo = dados.sexo or None
    db.commit()
    db.refresh(current)
    return current


# ── Gestão de atletas (profissional) ─────────────────────────────────────────

@router.get("/atletas", response_model=List[UsuarioOut])
def listar_atletas(
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """Lista atletas vinculados ao profissional logado."""
    return (
        db.query(Usuario)
        .filter(
            Usuario.profissional_id == prof.id,
            Usuario.tipo == "atleta",
            Usuario.ativo == True,
        )
        .order_by(Usuario.nome)
        .all()
    )


@router.post("/atletas", response_model=UsuarioOut, status_code=201)
def cadastrar_atleta_vinculado(
    body: CadastrarAtletaInput,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """
    Profissional cadastra um novo atleta já vinculado a ele.
    Usa o token do profissional para determinar o profissional_id automaticamente.
    """
    # Verifica se e-mail já existe
    if db.query(Usuario).filter(Usuario.email == body.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado",
        )

    codigo = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

    atleta = Usuario(
        nome=body.nome.strip(),
        email=body.email.strip().lower(),
        senha_hash=hash_senha(body.senha),
        tipo="atleta",
        sexo=body.sexo or None,
        modalidade=body.modalidade.strip() if body.modalidade else None,
        profissional_id=prof.id,  # ✅ vincula automaticamente ao profissional logado
        codigo_anonimizado=codigo,
        ativo=True,
    )
    db.add(atleta)
    db.commit()
    db.refresh(atleta)
    return atleta


@router.get("/atletas/{atleta_id}", response_model=UsuarioOut)
def detalhe_atleta(
    atleta_id: int,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    atleta = db.query(Usuario).filter(
        Usuario.id == atleta_id,
        Usuario.profissional_id == prof.id,
        Usuario.tipo == "atleta",
    ).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")
    return atleta


@router.put("/atletas/{atleta_id}", response_model=UsuarioOut)
def atualizar_atleta(
    atleta_id: int,
    dados: UsuarioUpdate,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """Profissional atualiza dados de um atleta vinculado."""
    atleta = db.query(Usuario).filter(
        Usuario.id == atleta_id,
        Usuario.profissional_id == prof.id,
        Usuario.tipo == "atleta",
    ).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")

    if dados.nome is not None:
        atleta.nome = dados.nome.strip()
    if dados.modalidade is not None:
        atleta.modalidade = dados.modalidade.strip() or None
    if dados.sexo is not None:
        atleta.sexo = dados.sexo or None

    db.commit()
    db.refresh(atleta)
    return atleta


@router.post("/atletas/{atleta_id}/desvincular")
def desvincular_atleta(
    atleta_id: int,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """Remove o vínculo entre o profissional e o atleta (não deleta o usuário)."""
    atleta = db.query(Usuario).filter(
        Usuario.id == atleta_id,
        Usuario.profissional_id == prof.id,
        Usuario.tipo == "atleta",
    ).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado ou não vinculado")

    atleta.profissional_id = None
    db.commit()
    return {"mensagem": f"Atleta {atleta.nome} desvinculado com sucesso"}