"""Titik masuk aplikasi SISTANI. Jalankan:  uvicorn app.main:app --reload"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app import models  # noqa: F401  (memastikan semua tabel terdaftar)
from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.konstanta import SAYUR, TANAH
from app.routers import admin, auth, kebun, kerusakan, prediksi, premium
from app.security import hash_password

logger = logging.getLogger("sistani")
settings = get_settings()


def buat_admin_awal() -> None:
    """Membuat akun admin dari .env jika belum ada."""
    with SessionLocal() as db:
        ada = db.scalar(select(models.User).where(models.User.email == settings.admin_email.lower()))
        if ada is None:
            db.add(
                models.User(
                    nama=settings.admin_nama,
                    email=settings.admin_email.lower(),
                    password_hash=hash_password(settings.admin_password),
                    role="admin",
                )
            )
            db.commit()
            logger.info("Akun admin dibuat: %s", settings.admin_email)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)  # buat tabel jika belum ada
    buat_admin_awal()
    yield


app = FastAPI(
    title="SISTANI API",
    description="Sistem Informasi Pertanian Cerdas: prediksi waktu panen dan diagnosis kerusakan tanaman sayur.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=False,  # token dikirim lewat header Authorization, bukan cookie
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth.router, kebun.router, prediksi.router, kerusakan.router, premium.router, admin.router):
    app.include_router(r)


@app.get("/", tags=["Umum"], summary="Cek server hidup")
def beranda():
    return {"aplikasi": "SISTANI API", "status": "berjalan", "dokumentasi": "/docs"}


@app.get("/referensi", tags=["Umum"], summary="Pilihan jenis sayur dan tanah untuk dropdown di frontend")
def referensi():
    return {
        "jenis_sayur": [{"kode": k, "nama": v["nama"]} for k, v in SAYUR.items()],
        "jenis_tanah": [{"kode": k, "nama": v} for k, v in TANAH.items()],
    }
