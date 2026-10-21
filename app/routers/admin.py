"""Fitur admin: kelola petani, verifikasi premium, laporan sistem."""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.deps import get_admin
from app.models import Kebun, LaporanKerusakan, PembayaranPremium, Prediksi, User
from app.schemas import (
    DiagnosisTerbanyakOut,
    KeputusanIn,
    LaporanSistemOut,
    PembayaranAdminOut,
    PesanOut,
    PetaniAdminOut,
    UbahStatusAkunIn,
)
from app.waktu import ke_aware, sekarang

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_admin)])


# ---------- Data petani ----------
@router.get("/petani", response_model=list[PetaniAdminOut], summary="Melihat data petani")
def daftar_petani(
    cari: str | None = Query(default=None, description="Cari nama atau email"),
    aktif: bool | None = Query(default=None),
    halaman: int = Query(default=1, ge=1),
    per_halaman: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = (
        select(User, func.count(Kebun.id))
        .outerjoin(Kebun, Kebun.user_id == User.id)
        .where(User.role == "petani")
        .group_by(User.id)
        .order_by(User.id.desc())
    )
    if cari:
        pola = f"%{cari.strip()}%"
        q = q.where(or_(User.nama.ilike(pola), User.email.ilike(pola)))
    if aktif is not None:
        q = q.where(User.aktif == aktif)
    baris = db.execute(q.offset((halaman - 1) * per_halaman).limit(per_halaman)).all()
    return [
        PetaniAdminOut(
            id=u.id, nama=u.nama, email=u.email, aktif=u.aktif, premium_aktif=u.premium_aktif,
            premium_sampai=u.premium_sampai, jumlah_kebun=jumlah, dibuat_pada=u.dibuat_pada,
        )
        for u, jumlah in baris
    ]


@router.patch("/petani/{user_id}/status", response_model=PesanOut, summary="Menonaktifkan atau mengaktifkan akun petani")
def ubah_status_akun(user_id: int, data: UbahStatusAkunIn, db: Session = Depends(get_db)):
    petani = db.get(User, user_id)
    if petani is None or petani.role != "petani":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Akun petani tidak ditemukan.")
    petani.aktif = data.aktif
    db.commit()
    return PesanOut(pesan=f"Akun {petani.nama} berhasil {'diaktifkan' if data.aktif else 'dinonaktifkan'}.")


# ---------- Verifikasi premium ----------
def _ke_pembayaran_out(p: PembayaranPremium) -> PembayaranAdminOut:
    return PembayaranAdminOut(
        id=p.id, user_id=p.user_id, nominal=p.nominal, metode=p.metode, nomor_referensi=p.nomor_referensi,
        status=p.status, catatan_admin=p.catatan_admin, dibuat_pada=p.dibuat_pada, diproses_pada=p.diproses_pada,
        nama_petani=p.pengguna.nama, email_petani=p.pengguna.email,
    )


@router.get("/pembayaran", response_model=list[PembayaranAdminOut], summary="Daftar pembayaran premium")
def daftar_pembayaran(
    status_bayar: str | None = Query(default="menunggu", alias="status", description="menunggu / disetujui / ditolak"),
    db: Session = Depends(get_db),
):
    q = select(PembayaranPremium).order_by(PembayaranPremium.id.desc())
    if status_bayar:
        q = q.where(PembayaranPremium.status == status_bayar)
    return [_ke_pembayaran_out(p) for p in db.scalars(q).all()]


def _ambil_menunggu(db: Session, pembayaran_id: int) -> PembayaranPremium:
    p = db.get(PembayaranPremium, pembayaran_id)
    if p is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pembayaran tidak ditemukan.")
    if p.status != "menunggu":
        raise HTTPException(status.HTTP_409_CONFLICT, f"Pembayaran ini sudah {p.status}.")
    return p


@router.post("/pembayaran/{pembayaran_id}/setujui", response_model=PembayaranAdminOut, summary="Menyetujui pembayaran premium")
def setujui(pembayaran_id: int, data: KeputusanIn | None = None, admin: User = Depends(get_admin), db: Session = Depends(get_db)):
    p = _ambil_menunggu(db, pembayaran_id)
    petani = p.pengguna
    # Jika premium masih aktif, perpanjang dari tanggal berakhirnya
    mulai = max(sekarang(), ke_aware(petani.premium_sampai) or sekarang())
    petani.premium_sampai = mulai + timedelta(days=get_settings().durasi_premium_hari)
    p.status = "disetujui"
    p.catatan_admin = data.catatan if data else None
    p.diproses_pada = sekarang()
    p.diproses_oleh = admin.id
    db.commit()
    db.refresh(p)
    return _ke_pembayaran_out(p)


@router.post("/pembayaran/{pembayaran_id}/tolak", response_model=PembayaranAdminOut, summary="Menolak pembayaran premium")
def tolak(pembayaran_id: int, data: KeputusanIn | None = None, admin: User = Depends(get_admin), db: Session = Depends(get_db)):
    p = _ambil_menunggu(db, pembayaran_id)
    p.status = "ditolak"
    p.catatan_admin = data.catatan if data else None
    p.diproses_pada = sekarang()
    p.diproses_oleh = admin.id
    db.commit()
    db.refresh(p)
    return _ke_pembayaran_out(p)


# ---------- Laporan sistem ----------
@router.get("/laporan", response_model=LaporanSistemOut, summary="Laporan sistem")
def laporan(db: Session = Depends(get_db)):
    def hitung(q) -> int:
        return int(db.scalar(q) or 0)

    petani = User.role == "petani"
    semua_petani = db.scalars(select(User).where(petani)).all()
    terbanyak = db.execute(
        select(LaporanKerusakan.nama_diagnosis, func.count(LaporanKerusakan.id).label("jumlah"))
        .group_by(LaporanKerusakan.nama_diagnosis)
        .order_by(func.count(LaporanKerusakan.id).desc())
        .limit(5)
    ).all()

    return LaporanSistemOut(
        total_petani=len(semua_petani),
        petani_aktif=sum(1 for u in semua_petani if u.aktif),
        petani_nonaktif=sum(1 for u in semua_petani if not u.aktif),
        premium_aktif=sum(1 for u in semua_petani if u.premium_aktif),
        total_kebun=hitung(select(func.count(Kebun.id))),
        total_prediksi=hitung(select(func.count(Prediksi.id))),
        diagnosis_teks=hitung(select(func.count(LaporanKerusakan.id)).where(LaporanKerusakan.metode == "teks")),
        diagnosis_foto=hitung(select(func.count(LaporanKerusakan.id)).where(LaporanKerusakan.metode == "foto")),
        pembayaran_menunggu=hitung(select(func.count(PembayaranPremium.id)).where(PembayaranPremium.status == "menunggu")),
        pendapatan_total=hitung(select(func.sum(PembayaranPremium.nominal)).where(PembayaranPremium.status == "disetujui")),
        diagnosis_terbanyak=[DiagnosisTerbanyakOut(nama=n, jumlah=j) for n, j in terbanyak],
    )
