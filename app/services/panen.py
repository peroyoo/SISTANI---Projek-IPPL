"""Prediksi waktu panen: memakai model Random Forest + data cuaca otomatis."""
from datetime import date, timedelta

import joblib
import numpy as np
import pandas as pd

from app.konstanta import CUACA_DEFAULT, SAYUR
from app.services import cuaca
from ml.paths import MODEL_PANEN

_model = None


def muat_model():
    """Muat model dari disk. Jika belum ada, latih otomatis (hanya sekitar beberapa detik)."""
    global _model
    if _model is None:
        if not MODEL_PANEN.exists():
            from ml.train_panen import latih

            latih(simpan=True)
        _model = joblib.load(MODEL_PANEN)["pipeline"]
    return _model


def prediksi_hari(sayur: str, tanah: str, suhu: float, hujan: float, lembap: float) -> tuple[float, float, float]:
    """Mengembalikan (perkiraan, batas_cepat, batas_lambat) lama tanam sampai panen dalam hari.

    Batas dihitung dari sebaran prediksi 200 pohon dalam model (persentil 10 dan 90).
    """
    pipeline = muat_model()
    X = pd.DataFrame(
        [{
            "jenis_sayur": sayur,
            "jenis_tanah": tanah,
            "suhu_rata": suhu,
            "curah_hujan_rata": hujan,
            "kelembapan_rata": lembap,
        }]
    )
    pra = pipeline.named_steps["pra"]
    rf = pipeline.named_steps["rf"]
    fitur = pra.transform(X)
    per_pohon = np.array([pohon.predict(fitur)[0] for pohon in rf.estimators_])
    return float(per_pohon.mean()), float(np.percentile(per_pohon, 10)), float(np.percentile(per_pohon, 90))


def _catatan(sayur: str, suhu: float, hujan: float, lembap: float, sumber: str) -> list[str]:
    info = SAYUR[sayur]
    catatan = []
    if hujan < info["air_opt"] - 2:
        catatan.append(
            "Curah hujan rata-rata rendah (kemarau), pertumbuhan bisa melambat sehingga panen mundur. "
            "Pastikan penyiraman cukup."
        )
    elif hujan > 18:
        catatan.append("Curah hujan sangat tinggi, waspadai genangan air dan penyakit akibat lembap.")
    if suhu > info["suhu_opt"] + 3:
        catatan.append("Suhu rata-rata lebih panas dari kondisi ideal, yang dapat memperlambat panen.")
    elif suhu < info["suhu_opt"] - 3:
        catatan.append("Suhu rata-rata lebih dingin dari kondisi ideal, pertumbuhan bisa lebih lambat.")
    if lembap < 65:
        catatan.append("Udara cukup kering, pantau kelembapan tanah.")
    if sumber == "default":
        catatan.append(
            "Data cuaca terbaru tidak dapat diambil, jadi perkiraan memakai rata-rata cuaca daerah tropis. "
            "Coba hitung ulang beberapa saat lagi."
        )
    if not catatan:
        catatan.append("Kondisi cuaca mendukung, perkiraan panen sesuai umur normal tanaman.")
    return catatan


def hitung(sayur: str, tanah: str, tanggal_tanam: date, lat: float, lon: float, hari_ini: date | None = None) -> dict:
    """Menghitung prediksi panen lengkap untuk satu kebun."""
    hari_ini = hari_ini or date.today()
    umur = max(0, (hari_ini - tanggal_tanam).days)

    data_cuaca = cuaca.ambil_cuaca(lat, lon, hari_lalu=min(umur, 30))
    if data_cuaca is None:
        data_cuaca = {**CUACA_DEFAULT, "hari_ini": {"suhu": None, "curah_hujan_mm": None, "kelembapan": None}, "sumber": "default"}

    total, cepat, lambat = prediksi_hari(
        sayur, tanah, data_cuaca["suhu_rata"], data_cuaca["curah_hujan_rata"], data_cuaca["kelembapan_rata"]
    )
    total_i, cepat_i, lambat_i = round(total), round(cepat), round(lambat)
    sisa = total_i - umur

    if sisa > 0:
        status = "belum_waktunya"
    elif sisa > -14:
        status = "siap_panen"
    else:
        status = "terlambat"

    return {
        "umur_hari": umur,
        "estimasi_total_hari": total_i,
        "sisa_hari": max(0, sisa),
        "tanggal_panen": tanggal_tanam + timedelta(days=total_i),
        "tanggal_terawal": tanggal_tanam + timedelta(days=min(cepat_i, total_i)),
        "tanggal_terlambat": tanggal_tanam + timedelta(days=max(lambat_i, total_i)),
        "status": status,
        "suhu_rata": data_cuaca["suhu_rata"],
        "curah_hujan_rata": data_cuaca["curah_hujan_rata"],
        "kelembapan_rata": data_cuaca["kelembapan_rata"],
        "sumber_cuaca": data_cuaca["sumber"],
        "catatan": _catatan(
            sayur, data_cuaca["suhu_rata"], data_cuaca["curah_hujan_rata"], data_cuaca["kelembapan_rata"], data_cuaca["sumber"]
        ),
        "cuaca_hari_ini": {**data_cuaca["hari_ini"], "sumber": data_cuaca["sumber"]},
    }
