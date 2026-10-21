"""Tabel-tabel database SISTANI (SQLAlchemy 2.0).

users --< kebun --< prediksi
users --< laporan_kerusakan >-- kebun (boleh kosong)
users --< pembayaran_premium
"""
from datetime import date, datetime

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.waktu import ke_aware, sekarang


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    nama: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(10), default="petani")  # "petani" atau "admin"
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)
    premium_sampai: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    dibuat_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=sekarang)

    kebun: Mapped[list["Kebun"]] = relationship(back_populates="pemilik", cascade="all, delete-orphan")

    @property
    def premium_aktif(self) -> bool:
        return self.premium_sampai is not None and ke_aware(self.premium_sampai) > sekarang()


class Kebun(Base):
    __tablename__ = "kebun"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    nama_kebun: Mapped[str] = mapped_column(String(100))
    jenis_sayur: Mapped[str] = mapped_column(String(30))
    tanggal_tanam: Mapped[date] = mapped_column(Date)
    jenis_tanah: Mapped[str] = mapped_column(String(20))
    lokasi: Mapped[str] = mapped_column(String(150))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    dibuat_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=sekarang)

    pemilik: Mapped["User"] = relationship(back_populates="kebun")
    prediksi: Mapped[list["Prediksi"]] = relationship(
        back_populates="kebun", cascade="all, delete-orphan", order_by="Prediksi.id.desc()"
    )


class Prediksi(Base):
    __tablename__ = "prediksi"

    id: Mapped[int] = mapped_column(primary_key=True)
    kebun_id: Mapped[int] = mapped_column(ForeignKey("kebun.id"), index=True)
    tanggal_hitung: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=sekarang)
    umur_hari: Mapped[int] = mapped_column(Integer)
    estimasi_total_hari: Mapped[int] = mapped_column(Integer)
    sisa_hari: Mapped[int] = mapped_column(Integer)
    tanggal_panen: Mapped[date] = mapped_column(Date)
    tanggal_terawal: Mapped[date] = mapped_column(Date)
    tanggal_terlambat: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20))
    suhu_rata: Mapped[float] = mapped_column(Float)
    curah_hujan_rata: Mapped[float] = mapped_column(Float)
    kelembapan_rata: Mapped[float] = mapped_column(Float)
    sumber_cuaca: Mapped[str] = mapped_column(String(20))  # "open-meteo" atau "default"
    catatan: Mapped[list] = mapped_column(JSON, default=list)

    kebun: Mapped["Kebun"] = relationship(back_populates="prediksi")


class LaporanKerusakan(Base):
    __tablename__ = "laporan_kerusakan"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    kebun_id: Mapped[int | None] = mapped_column(ForeignKey("kebun.id"), nullable=True)
    metode: Mapped[str] = mapped_column(String(10))  # "teks" atau "foto"
    gejala_teks: Mapped[str | None] = mapped_column(Text, nullable=True)
    foto_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    kelas: Mapped[str] = mapped_column(String(80))
    nama_diagnosis: Mapped[str] = mapped_column(String(150))
    confidence: Mapped[float] = mapped_column(Float)
    keyakinan: Mapped[str] = mapped_column(String(15))  # "yakin" atau "kurang_yakin"
    detail: Mapped[dict] = mapped_column(JSON, default=dict)
    dibuat_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=sekarang)


class PembayaranPremium(Base):
    __tablename__ = "pembayaran_premium"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    nominal: Mapped[int] = mapped_column(Integer)
    metode: Mapped[str] = mapped_column(String(30))
    nomor_referensi: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(15), default="menunggu")  # menunggu/disetujui/ditolak
    catatan_admin: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dibuat_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=sekarang)
    diproses_pada: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    diproses_oleh: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    pengguna: Mapped["User"] = relationship(foreign_keys=[user_id])
