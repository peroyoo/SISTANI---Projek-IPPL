"""Dependency FastAPI: siapa yang sedang login, dan apakah boleh mengakses."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import baca_token

# tokenUrl dipakai tombol "Authorize" di halaman /docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    galat = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa. Silakan login lagi.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    data = baca_token(token)
    if not data or "sub" not in data:
        raise galat
    user = db.get(User, int(data["sub"]))
    if user is None:
        raise galat
    if not user.aktif:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Akun Anda dinonaktifkan. Hubungi admin.")
    return user


def get_petani(user: User = Depends(get_current_user)) -> User:
    if user.role != "petani":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Fitur ini hanya untuk akun petani.")
    return user


def get_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Fitur ini hanya untuk admin.")
    return user
