"""Layanan cuaca eksternal (Open-Meteo, gratis tanpa API key).

Petani tidak mengisi cuaca. Sistem mengambilnya otomatis berdasarkan koordinat kebun.
Jika layanan tidak bisa dihubungi, fungsi mengembalikan None dan pemanggil memakai
nilai cadangan (alur "API gagal" di activity diagram).
"""
import logging

import httpx

logger = logging.getLogger("sistani.cuaca")

URL_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search"
URL_FORECAST = "https://api.open-meteo.com/v1/forecast"
TIMEOUT = 8.0


def cari_koordinat(nama_lokasi: str) -> tuple[float, float] | None:
    """Ubah nama lokasi (mis. 'Sepinggan, Balikpapan') menjadi (latitude, longitude)."""
    try:
        r = httpx.get(
            URL_GEOCODING,
            params={"name": nama_lokasi, "count": 1, "language": "id", "format": "json"},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        hasil = r.json().get("results") or []
        if hasil:
            return float(hasil[0]["latitude"]), float(hasil[0]["longitude"])
    except Exception as e:  # jaringan putus, timeout, format berubah, dst.
        logger.warning("Geocoding gagal untuk %r: %s", nama_lokasi, e)
    return None


def _rata(daftar: list) -> float | None:
    nilai = [x for x in daftar if x is not None]
    return sum(nilai) / len(nilai) if nilai else None


def ambil_cuaca(lat: float, lon: float, hari_lalu: int = 14) -> dict | None:
    """Ambil rata-rata cuaca harian dari `hari_lalu` hari terakhir sampai 16 hari ke depan,
    ditambah kondisi hari ini. Mengembalikan None jika gagal."""
    hari_lalu = max(0, min(int(hari_lalu), 92))  # batas Open-Meteo
    try:
        r = httpx.get(
            URL_FORECAST,
            params={
                "latitude": lat,
                "longitude": lon,
                "daily": "temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean",
                "past_days": hari_lalu,
                "forecast_days": 16,
                "timezone": "auto",
            },
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        harian = r.json()["daily"]
        suhu = harian["temperature_2m_mean"]
        hujan = harian["precipitation_sum"]
        lembap = harian["relative_humidity_2m_mean"]

        suhu_rata, hujan_rata, lembap_rata = _rata(suhu), _rata(hujan), _rata(lembap)
        if suhu_rata is None or hujan_rata is None or lembap_rata is None:
            return None

        idx_hari_ini = hari_lalu  # urutan data: hari lalu dulu, lalu hari ini, lalu ramalan
        return {
            "suhu_rata": round(suhu_rata, 2),
            "curah_hujan_rata": round(hujan_rata, 2),
            "kelembapan_rata": round(lembap_rata, 2),
            "hari_ini": {
                "suhu": suhu[idx_hari_ini] if idx_hari_ini < len(suhu) else None,
                "curah_hujan_mm": hujan[idx_hari_ini] if idx_hari_ini < len(hujan) else None,
                "kelembapan": lembap[idx_hari_ini] if idx_hari_ini < len(lembap) else None,
            },
            "sumber": "open-meteo",
        }
    except Exception as e:
        logger.warning("Ambil cuaca gagal (%s, %s): %s", lat, lon, e)
        return None
