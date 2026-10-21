"""Prediksi waktu panen (gratis untuk semua petani)."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_petani
from app.models import Prediksi, User
from app.routers.kebun import ambil_kebun_milik
from app.schemas import PrediksiOut
from app.services import panen

router = APIRouter(prefix="/kebun", tags=["Prediksi Panen"])


@router.post("/{kebun_id}/prediksi", response_model=PrediksiOut, status_code=201,
             summary="Melihat prediksi waktu panen (hitung baru dan simpan ke riwayat)")
def hitung_prediksi(kebun_id: int, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    kebun = ambil_kebun_milik(db, user, kebun_id)
    hasil = panen.hitung(kebun.jenis_sayur, kebun.jenis_tanah, kebun.tanggal_tanam, kebun.latitude, kebun.longitude)
    hasil.pop("cuaca_hari_ini")
    prediksi = Prediksi(kebun_id=kebun.id, **hasil)
    db.add(prediksi)
    db.commit()
    db.refresh(prediksi)
    return prediksi


@router.get("/{kebun_id}/prediksi", response_model=list[PrediksiOut], summary="Riwayat prediksi sebuah kebun")
def riwayat_prediksi(kebun_id: int, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    kebun = ambil_kebun_milik(db, user, kebun_id)
    return db.scalars(
        select(Prediksi).where(Prediksi.kebun_id == kebun.id).order_by(Prediksi.id.desc()).limit(30)
    ).all()
