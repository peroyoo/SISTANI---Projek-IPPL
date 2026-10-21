from datetime import timedelta

import bcrypt
import jwt

from app.config import get_settings
from app.waktu import sekarang

settings = get_settings()
ALGORITMA = "HS256"


def hash_password(password: str) -> str:
    # bcrypt hanya membaca 72 byte pertama
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verifikasi_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], password_hash.encode("utf-8"))
    except ValueError:
        return False


def buat_token(user_id: int, role: str) -> str:
    kedaluwarsa = sekarang() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "role": role, "exp": kedaluwarsa}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITMA)


def baca_token(token: str) -> dict | None:
    """Mengembalikan isi token, atau None jika token salah/kedaluwarsa."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITMA])
    except jwt.PyJWTError:
        return None
