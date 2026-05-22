from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import random, string

from database import get_db, Usuario
from dependencies import get_current_user, require_profissional
from services.auth_service import hash_senha

router = APIRouter()



class UsuarioOut(BaseModel):
    id: int
    nome: str
    email: str
    tipo: str
    sexo: Optional[str]
    modalidade: Optional[str]
    codigo_anonimizado: Optional[str]
    profissional_id: Optional[int]

    class Config:
        from_attributes = True


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    modalidade: Optional[str] = None
    sexo: Optional[str] = None


class CadastrarAtletaInput(BaseModel):
    nome: str
    email: EmailStr
    senha: str = Field(min_length=6)
    sexo: Optional[str] = None
    modalidade: Optional[str] = None
    equipe: Optional[str] = None
    peso_base: Optional[float] = None
    altura: Optional[int] = None
    data_nascimento: Optional[str] = None


class VincularAtletaInput(BaseModel):
    atleta_id: int



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


@router.get("/atletas-disponiveis", response_model=List[UsuarioOut])
def listar_atletas_disponiveis(
    busca: Optional[str] = Query(None),
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """
    Lista atletas sem vínculo com nenhum profissional.
    Permite busca por nome ou email.
    """
    query = db.query(Usuario).filter(
        Usuario.tipo == "atleta",
        Usuario.ativo == True,
        Usuario.profissional_id == None,
    )

    if busca and busca.strip():
        termo = f"%{busca.strip().lower()}%"
        query = query.filter(
            (Usuario.nome.ilike(termo)) | (Usuario.email.ilike(termo))
        )

    return query.order_by(Usuario.nome).limit(20).all()


@router.post("/atletas/vincular", response_model=UsuarioOut)
def vincular_atleta_existente(
    body: VincularAtletaInput,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """Vincula um atleta existente (sem profissional) ao profissional logado."""
    atleta = db.query(Usuario).filter(
        Usuario.id == body.atleta_id,
        Usuario.tipo == "atleta",
        Usuario.ativo == True,
    ).first()

    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")

    if atleta.profissional_id is not None and atleta.profissional_id != prof.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este atleta já está vinculado a outro profissional",
        )

    if atleta.profissional_id == prof.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este atleta já está vinculado a você",
        )

    atleta.profissional_id = prof.id
    db.commit()
    db.refresh(atleta)
    return atleta


@router.post("/atletas", response_model=UsuarioOut, status_code=201)
def cadastrar_atleta_vinculado(
    body: CadastrarAtletaInput,
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
    """Profissional cadastra um novo atleta já vinculado a ele."""
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
        profissional_id=prof.id,
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