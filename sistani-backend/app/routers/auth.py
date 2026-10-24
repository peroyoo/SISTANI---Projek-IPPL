"""Akun: membuat akun, login, melihat profil, mengatur password (UC petani + admin)."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import LoginIn, PesanOut, RegisterIn, TokenOut, UbahPasswordIn, UserOut
from app.security import buat_token, hash_password, verifikasi_password

router = APIRouter(prefix="/auth", tags=["Akun"])


def _proses_login(db: Session, email: str, password: str) -> TokenOut:
    user = db.scalar(select(User).where(User.email == email.strip().lower()))
    if user is None or not verifikasi_password(password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email atau password salah.")
    if not user.aktif:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Akun Anda dinonaktifkan. Hubungi admin.")
    return TokenOut(access_token=buat_token(user.id, user.role), role=user.role, nama=user.nama)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED,
             summary="Membuat akun petani")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email sudah terdaftar.")
    user = User(nama=data.nama.strip(), email=email, password_hash=hash_password(data.password), role="petani")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut, summary="Login (petani maupun admin), body JSON")
def login(data: LoginIn, db: Session = Depends(get_db)):
    return _proses_login(db, data.email, data.password)


@router.post("/token", response_model=TokenOut, include_in_schema=False)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Dipakai tombol Authorize di halaman /docs (kolom username diisi email)."""
    return _proses_login(db, form.username, form.password)


@router.get("/me", response_model=UserOut, summary="Profil akun yang sedang login")
def saya(user: User = Depends(get_current_user)):
    return user


@router.post("/ubah-password", response_model=PesanOut, summary="Mengatur password")
def ubah_password(data: UbahPasswordIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verifikasi_password(data.password_lama, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Password lama salah.")
    user.password_hash = hash_password(data.password_baru)
    db.commit()
    return PesanOut(pesan="Password berhasil diubah.")
