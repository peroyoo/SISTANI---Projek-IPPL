"""Laporan kerusakan tanaman: diagnosis teks (gratis, NLP) dan foto (premium, CNN)."""
import io
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from PIL import Image
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.deps import get_petani
from app.models import LaporanKerusakan, User
from app.routers.kebun import ambil_kebun_milik
from app.schemas import DiagnosisOut, DiagnosisTeksIn
from app.services import cnn, nlp

router = APIRouter(prefix="/kerusakan", tags=["Diagnosis Kerusakan Tanaman"])

JENIS_FOTO = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def _simpan(db: Session, user: User, metode: str, hasil: dict, kebun_id: int | None,
            gejala: str | None = None, foto_path: str | None = None) -> LaporanKerusakan:
    laporan = LaporanKerusakan(
        user_id=user.id,
        kebun_id=kebun_id,
        metode=metode,
        gejala_teks=gejala,
        foto_path=foto_path,
        kelas=hasil["kelas"],
        nama_diagnosis=hasil["nama_diagnosis"],
        confidence=hasil["confidence"],
        keyakinan=hasil["keyakinan"],
        detail={k: hasil[k] for k in ("penyebab", "penanganan", "pencegahan", "alternatif", "saran")},
    )
    db.add(laporan)
    db.commit()
    db.refresh(laporan)
    return laporan


def _ke_out(lap: LaporanKerusakan) -> DiagnosisOut:
    d = lap.detail or {}
    return DiagnosisOut(
        id=lap.id,
        metode=lap.metode,
        kebun_id=lap.kebun_id,
        nama_diagnosis=lap.nama_diagnosis,
        kelas=lap.kelas,
        confidence=lap.confidence,
        keyakinan=lap.keyakinan,
        penyebab=d.get("penyebab", ""),
        penanganan=d.get("penanganan", []),
        pencegahan=d.get("pencegahan", []),
        alternatif=d.get("alternatif", []),
        saran=d.get("saran"),
        gejala_teks=lap.gejala_teks,
        dibuat_pada=lap.dibuat_pada,
    )


@router.post("/teks", response_model=DiagnosisOut, status_code=status.HTTP_201_CREATED,
             summary="Mengirimkan laporan kerusakan tanaman (teks) - gratis")
def diagnosis_teks(data: DiagnosisTeksIn, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    if data.kebun_id is not None:
        ambil_kebun_milik(db, user, data.kebun_id)
    hasil = nlp.diagnosis_teks(data.gejala)
    return _ke_out(_simpan(db, user, "teks", hasil, data.kebun_id, gejala=data.gejala.strip()))


@router.post("/foto", response_model=DiagnosisOut, status_code=status.HTTP_201_CREATED,
             summary="Mendiagnosis kerusakan tanaman lewat foto - khusus premium")
def diagnosis_foto(
    file: UploadFile = File(..., description="Foto JPG/PNG/WEBP, maksimal 5 MB"),
    kebun_id: int | None = Form(default=None),
    user: User = Depends(get_petani),
    db: Session = Depends(get_db),
):
    settings = get_settings()

    # 1) Cek status premium (alur "bukan premium" -> tawarkan upgrade)
    if not user.premium_aktif:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail={
                "kode": "PREMIUM_DIPERLUKAN",
                "pesan": "Diagnosis lewat foto khusus pengguna premium. Silakan upgrade premium terlebih dahulu.",
            },
        )

    if kebun_id is not None:
        ambil_kebun_milik(db, user, kebun_id)

    # 2) Model CNN harus siap sebelum foto disimpan
    siap, pesan = cnn.status_siap()
    if not siap:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, f"Layanan diagnosis foto belum siap: {pesan}")

    # 3) Validasi file
    ekstensi = JENIS_FOTO.get(file.content_type or "")
    if ekstensi is None:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Format foto harus JPG, PNG, atau WEBP.")
    maks = settings.maks_ukuran_foto_mb * 1024 * 1024
    isi = file.file.read(maks + 1)
    if len(isi) > maks:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, f"Ukuran foto maksimal {settings.maks_ukuran_foto_mb} MB.")
    try:
        Image.open(io.BytesIO(isi)).verify()
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File bukan foto yang valid.")

    # 4) Simpan foto lalu diagnosis
    folder = Path(settings.upload_dir) / str(user.id)
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / f"{uuid.uuid4().hex}.{ekstensi}"
    path.write_bytes(isi)

    try:
        hasil = cnn.diagnosis_foto(str(path))
    except cnn.ModelBelumSiap as e:
        path.unlink(missing_ok=True)
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, f"Layanan diagnosis foto belum siap: {e}")

    return _ke_out(_simpan(db, user, "foto", hasil, kebun_id, foto_path=str(path)))


@router.get("/riwayat", response_model=list[DiagnosisOut], summary="Riwayat laporan kerusakan saya")
def riwayat(user: User = Depends(get_petani), db: Session = Depends(get_db)):
    laporan = db.scalars(
        select(LaporanKerusakan).where(LaporanKerusakan.user_id == user.id).order_by(LaporanKerusakan.id.desc()).limit(100)
    ).all()
    return [_ke_out(x) for x in laporan]


@router.get("/{laporan_id}", response_model=DiagnosisOut, summary="Detail satu laporan kerusakan")
def detail(laporan_id: int, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    lap = db.scalar(select(LaporanKerusakan).where(LaporanKerusakan.id == laporan_id, LaporanKerusakan.user_id == user.id))
    if lap is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Laporan tidak ditemukan.")
    return _ke_out(lap)
