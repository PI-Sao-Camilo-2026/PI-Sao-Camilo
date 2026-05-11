from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from database import get_db, Usuario
from dependencies import get_current_user, require_profissional

router = APIRouter()



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
        current.modalidade = dados.modalidade.strip()
    if dados.sexo is not None:
        current.sexo = dados.sexo

    db.commit()
    db.refresh(current)
    return current



@router.get("/atletas", response_model=List[UsuarioOut])
def listar_atletas(
    prof: Usuario = Depends(require_profissional),
    db: Session = Depends(get_db),
):
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