"""Premium: cek status dan upgrade (pembayaran disimulasikan, diverifikasi admin)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.deps import get_petani
from app.models import PembayaranPremium, User
from app.schemas import PembayaranOut, StatusPremiumOut, UpgradeIn

router = APIRouter(prefix="/premium", tags=["Premium"])


def _pembayaran_terakhir(db: Session, user: User) -> PembayaranPremium | None:
    return db.scalar(
        select(PembayaranPremium).where(PembayaranPremium.user_id == user.id).order_by(PembayaranPremium.id.desc()).limit(1)
    )


@router.get("/status", response_model=StatusPremiumOut, summary="Mengecek status premium")
def status_premium(user: User = Depends(get_petani), db: Session = Depends(get_db)):
    s = get_settings()
    return StatusPremiumOut(
        premium_aktif=user.premium_aktif,
        premium_sampai=user.premium_sampai,
        harga=s.harga_premium,
        durasi_hari=s.durasi_premium_hari,
        pembayaran_terakhir=_pembayaran_terakhir(db, user),
    )


@router.post("/upgrade", response_model=PembayaranOut, status_code=status.HTTP_201_CREATED,
             summary="Melakukan upgrade premium (pembayaran simulasi, menunggu verifikasi admin)")
def upgrade(data: UpgradeIn, user: User = Depends(get_petani), db: Session = Depends(get_db)):
    menunggu = db.scalar(
        select(PembayaranPremium).where(PembayaranPremium.user_id == user.id, PembayaranPremium.status == "menunggu")
    )
    if menunggu:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Pembayaran Anda sebelumnya masih menunggu verifikasi admin."
        )
    pembayaran = PembayaranPremium(
        user_id=user.id,
        nominal=get_settings().harga_premium,
        metode=data.metode,
        nomor_referensi=data.nomor_referensi.strip(),
    )
    db.add(pembayaran)
    db.commit()
    db.refresh(pembayaran)
    return pembayaran


@router.get("/riwayat", response_model=list[PembayaranOut], summary="Riwayat pembayaran premium saya")
def riwayat(user: User = Depends(get_petani), db: Session = Depends(get_db)):
    return db.scalars(
        select(PembayaranPremium).where(PembayaranPremium.user_id == user.id).order_by(PembayaranPremium.id.desc())
    ).all()
