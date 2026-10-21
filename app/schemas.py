"""Bentuk data yang masuk dan keluar lewat API (Pydantic v2)."""
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.konstanta import SAYUR, TANAH


# ---------- Akun ----------
class RegisterIn(BaseModel):
    nama: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class LoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=150)
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    nama: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nama: str
    email: str
    role: str
    aktif: bool
    premium_aktif: bool
    premium_sampai: datetime | None = None


class UbahPasswordIn(BaseModel):
    password_lama: str
    password_baru: str = Field(min_length=8, max_length=72)


class PesanOut(BaseModel):
    pesan: str


# ---------- Kebun ----------
def _normalisasi(nilai: str) -> str:
    return nilai.strip().lower().replace(" ", "_")


class KebunIn(BaseModel):
    nama_kebun: str = Field(min_length=2, max_length=100)
    jenis_sayur: str
    tanggal_tanam: date
    jenis_tanah: str
    lokasi: str = Field(min_length=2, max_length=150, description="Nama desa/kota, mis. Balikpapan")
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    @field_validator("jenis_sayur")
    @classmethod
    def cek_sayur(cls, v: str) -> str:
        v = _normalisasi(v)
        if v not in SAYUR:
            raise ValueError(f"Jenis sayur tidak dikenal. Pilihan: {', '.join(SAYUR)}")
        return v

    @field_validator("jenis_tanah")
    @classmethod
    def cek_tanah(cls, v: str) -> str:
        v = _normalisasi(v)
        if v not in TANAH:
            raise ValueError(f"Jenis tanah tidak dikenal. Pilihan: {', '.join(TANAH)}")
        return v

    @field_validator("tanggal_tanam")
    @classmethod
    def cek_tanggal(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Tanggal tanam tidak boleh di masa depan")
        return v


class KebunUbahIn(BaseModel):
    """Semua field opsional: kirim hanya yang ingin diubah."""

    nama_kebun: str | None = Field(default=None, min_length=2, max_length=100)
    jenis_sayur: str | None = None
    tanggal_tanam: date | None = None
    jenis_tanah: str | None = None
    lokasi: str | None = Field(default=None, min_length=2, max_length=150)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    @field_validator("jenis_sayur")
    @classmethod
    def cek_sayur(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = _normalisasi(v)
        if v not in SAYUR:
            raise ValueError(f"Jenis sayur tidak dikenal. Pilihan: {', '.join(SAYUR)}")
        return v

    @field_validator("jenis_tanah")
    @classmethod
    def cek_tanah(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = _normalisasi(v)
        if v not in TANAH:
            raise ValueError(f"Jenis tanah tidak dikenal. Pilihan: {', '.join(TANAH)}")
        return v

    @field_validator("tanggal_tanam")
    @classmethod
    def cek_tanggal(cls, v: date | None) -> date | None:
        if v is not None and v > date.today():
            raise ValueError("Tanggal tanam tidak boleh di masa depan")
        return v


class KebunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nama_kebun: str
    jenis_sayur: str
    tanggal_tanam: date
    jenis_tanah: str
    lokasi: str
    latitude: float
    longitude: float
    dibuat_pada: datetime


# ---------- Prediksi panen ----------
class PrediksiHitungOut(BaseModel):
    umur_hari: int
    estimasi_total_hari: int
    sisa_hari: int
    tanggal_panen: date
    tanggal_terawal: date
    tanggal_terlambat: date
    status: str
    suhu_rata: float
    curah_hujan_rata: float
    kelembapan_rata: float
    sumber_cuaca: str
    catatan: list[str]


class PrediksiOut(PrediksiHitungOut):
    model_config = ConfigDict(from_attributes=True)

    id: int
    kebun_id: int
    tanggal_hitung: datetime


class CuacaHariIniOut(BaseModel):
    suhu: float | None = None
    curah_hujan_mm: float | None = None
    kelembapan: float | None = None
    sumber: str


class RingkasanKebunOut(BaseModel):
    kebun: KebunOut
    nama_sayur: str
    nama_tanah: str
    umur_hari: int
    cuaca_hari_ini: CuacaHariIniOut
    prediksi: PrediksiHitungOut


# ---------- Diagnosis kerusakan ----------
class DiagnosisTeksIn(BaseModel):
    gejala: str = Field(min_length=10, max_length=1000, description="Ceritakan gejala yang terlihat")
    kebun_id: int | None = None


class AlternatifOut(BaseModel):
    nama: str
    confidence: float


class DiagnosisOut(BaseModel):
    id: int
    metode: Literal["teks", "foto"]
    kebun_id: int | None
    nama_diagnosis: str
    kelas: str
    confidence: float
    keyakinan: Literal["yakin", "kurang_yakin"]
    penyebab: str
    penanganan: list[str]
    pencegahan: list[str]
    alternatif: list[AlternatifOut]
    saran: str | None = None
    gejala_teks: str | None = None
    dibuat_pada: datetime


# ---------- Premium ----------
class UpgradeIn(BaseModel):
    metode: Literal["transfer_bank", "qris", "e_wallet"]
    nomor_referensi: str = Field(
        min_length=4, max_length=100, description="Nomor referensi/bukti transfer (simulasi)"
    )


class PembayaranOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    nominal: int
    metode: str
    nomor_referensi: str
    status: str
    catatan_admin: str | None = None
    dibuat_pada: datetime
    diproses_pada: datetime | None = None


class StatusPremiumOut(BaseModel):
    premium_aktif: bool
    premium_sampai: datetime | None
    harga: int
    durasi_hari: int
    pembayaran_terakhir: PembayaranOut | None = None


# ---------- Admin ----------
class PetaniAdminOut(BaseModel):
    id: int
    nama: str
    email: str
    aktif: bool
    premium_aktif: bool
    premium_sampai: datetime | None
    jumlah_kebun: int
    dibuat_pada: datetime


class UbahStatusAkunIn(BaseModel):
    aktif: bool


class KeputusanIn(BaseModel):
    catatan: str | None = Field(default=None, max_length=255)


class PembayaranAdminOut(PembayaranOut):
    nama_petani: str
    email_petani: str


class DiagnosisTerbanyakOut(BaseModel):
    nama: str
    jumlah: int


class LaporanSistemOut(BaseModel):
    total_petani: int
    petani_aktif: int
    petani_nonaktif: int
    premium_aktif: int
    total_kebun: int
    total_prediksi: int
    diagnosis_teks: int
    diagnosis_foto: int
    pembayaran_menunggu: int
    pendapatan_total: int
    diagnosis_terbanyak: list[DiagnosisTerbanyakOut]
