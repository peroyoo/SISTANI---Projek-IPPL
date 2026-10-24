from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Semua pengaturan dibaca dari file .env (lihat .env.example)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/sistani"
    secret_key: str = "ganti-dengan-teks-acak-yang-panjang"
    access_token_expire_minutes: int = 60 * 24

    admin_nama: str = "Admin SISTANI"
    admin_email: str = "admin@sistani.id"
    admin_password: str = "ganti_password_admin_ini"

    harga_premium: int = 9000
    durasi_premium_hari: int = 30

    cors_origins: str = "*"
    ambang_confidence: float = 0.6

    default_lat: float = -1.2379
    default_lon: float = 116.8529

    upload_dir: str = "uploads"
    maks_ukuran_foto_mb: int = 5


@lru_cache
def get_settings() -> Settings:
    return Settings()
