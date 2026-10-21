"""Data kebun: menambah, melihat, mengubah, menghapus, dan ringkasan kebun (UC petani)."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.deps import get_petani
from app.konstanta import SAYUR, TANAH
from app.models import Kebun, LaporanKerusakan, User
from app.schemas import CuacaHariIniOut, KebunIn, KebunOut, KebunUbahIn, PesanOut, RingkasanKebunOut
from app.services import cuaca, panen

router = APIRouter(prefix="/kebun", tags=["Data Kebun"])


def ambil_kebun_milik(db: Session, user: User, kebun_id: int) -> Kebun:
    """Ambil kebun milik petani yang login; 404 jika tidak ada atau milik orang lain."""
    kebun = db.scalar(select(Kebun).where(Kebun.id == kebun_id, Kebun.user_id == user.id))
    if kebun is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kebun tidak ditemukan.")
    return kebun


def _tentukan_koordinat(lokasi: str, lat: float | None, lon: float | None) -> tuple[float, float]:
    """Pakai koordinat dari petani jika ada; jika tidak, cari dari nama lokasi; jika gagal, pakai lokasi cadangan."""
    if lat is not None and lon is not None:
        return lat, lon
    hasil = cuaca.cari_koordinat(lokasi)
    if hasil:
        return hasil
    s = get_settings()
    return s.default_lat, s.default_lon


@router.post("", response_model=KebunOut, status_code=status.HTTP_201_CREATED, summary="Menambahkan data kebun")
def tambah_kebun(data: KebunIn, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    lat, lon = _tentukan_koordinat(data.lokasi, data.latitude, data.longitude)
    kebun = Kebun(
        user_id=user.id,
        nama_kebun=data.nama_kebun.strip(),
        jenis_sayur=data.jenis_sayur,
        tanggal_tanam=data.tanggal_tanam,
        jenis_tanah=data.jenis_tanah,
        lokasi=data.lokasi.strip(),
        latitude=lat,
        longitude=lon,
    )
    db.add(kebun)
    db.commit()
    db.refresh(kebun)
    return kebun


@router.get("", response_model=list[KebunOut], summary="Melihat daftar kebun")
def daftar_kebun(user: User = Depends(get_petani), db: Session = Depends(get_db)):
    return db.scalars(select(Kebun).where(Kebun.user_id == user.id).order_by(Kebun.id.desc())).all()


@router.get("/{kebun_id}", response_model=KebunOut, summary="Melihat satu kebun")
def detail_kebun(kebun_id: int, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    return ambil_kebun_milik(db, user, kebun_id)


@router.put("/{kebun_id}", response_model=KebunOut, summary="Mengubah data kebun")
def ubah_kebun(kebun_id: int, data: KebunUbahIn, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    kebun = ambil_kebun_milik(db, user, kebun_id)
    perubahan = data.model_dump(exclude_unset=True, exclude={"latitude", "longitude"})
    for kolom, nilai in perubahan.items():
        if nilai is not None:
            setattr(kebun, kolom, nilai.strip() if isinstance(nilai, str) else nilai)

    # Koordinat dihitung ulang hanya jika lokasi atau koordinat diubah
    if data.latitude is not None and data.longitude is not None:
        kebun.latitude, kebun.longitude = data.latitude, data.longitude
    elif data.lokasi is not None:
        kebun.latitude, kebun.longitude = _tentukan_koordinat(kebun.lokasi, None, None)

    db.commit()
    db.refresh(kebun)
    return kebun


@router.delete("/{kebun_id}", response_model=PesanOut, summary="Menghapus data kebun")
def hapus_kebun(kebun_id: int, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    kebun = ambil_kebun_milik(db, user, kebun_id)
    # Riwayat diagnosis tetap disimpan (untuk laporan admin), hanya dilepas dari kebun ini
    db.execute(update(LaporanKerusakan).where(LaporanKerusakan.kebun_id == kebun.id).values(kebun_id=None))
    db.delete(kebun)  # prediksi ikut terhapus
    db.commit()
    return PesanOut(pesan="Kebun berhasil dihapus.")


@router.get("/{kebun_id}/ringkasan", response_model=RingkasanKebunOut,
            summary="Ringkasan kebun untuk dashboard (umur, cuaca hari ini, estimasi panen)")
def ringkasan_kebun(kebun_id: int, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    kebun = ambil_kebun_milik(db, user, kebun_id)
    hasil = panen.hitung(kebun.jenis_sayur, kebun.jenis_tanah, kebun.tanggal_tanam, kebun.latitude, kebun.longitude)
    return RingkasanKebunOut(
        kebun=KebunOut.model_validate(kebun),
        nama_sayur=SAYUR[kebun.jenis_sayur]["nama"],
        nama_tanah=TANAH[kebun.jenis_tanah],
        umur_hari=max(0, (date.today() - kebun.tanggal_tanam).days),
        cuaca_hari_ini=CuacaHariIniOut(**hasil["cuaca_hari_ini"]),
        prediksi=hasil,
    )
