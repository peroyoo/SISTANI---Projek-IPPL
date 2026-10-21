"""Melatih model prediksi waktu panen (Random Forest Regressor).

Target  : estimasi total hari dari tanam sampai panen pertama.
Fitur   : jenis sayur, jenis tanah, suhu rata-rata, curah hujan rata-rata, kelembapan rata-rata.

PENTING: belum ada dataset panen nyata, jadi data latih dibuat secara sintetis dari
aturan agronomi sederhana (lihat buat_dataset). Ini cukup untuk membangun dan
mendemokan sistem, tetapi untuk hasil yang bisa dipertanggungjawabkan, ganti dengan
data panen asli (mis. catatan kebun ibu dan teman petani) lalu latih ulang.

Jalankan dari folder proyek:  python -m ml.train_panen
"""
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from app.konstanta import SAYUR, TANAH
from ml.paths import MODEL_DIR, MODEL_PANEN

FITUR_KATEGORI = ["jenis_sayur", "jenis_tanah"]
FITUR_ANGKA = ["suhu_rata", "curah_hujan_rata", "kelembapan_rata"]

# Efek tanah terhadap lamanya panen (proporsi tambahan) dan kemampuan menahan air
EFEK_TANAH = {"lempung": 0.00, "liat": 0.03, "berpasir": 0.05, "gambut": 0.04, "podsolik": 0.04}
TAMBAHAN_DEFISIT_AIR = {"lempung": 0.0, "liat": 0.001, "berpasir": 0.006, "gambut": 0.002, "podsolik": 0.004}


def hst_aturan(sayur: str, tanah: str, suhu: float, hujan: float, lembap: float) -> float:
    """Aturan agronomi sederhana untuk menyusun data latih.

    - suhu menjauhi suhu optimum -> panen lebih lama (kemarau panas sangat memperlambat)
    - curah hujan di bawah kebutuhan air -> panen mundur (cerita utama SISTANI)
    - hujan berlebihan -> sedikit mundur
    - tanah berpasir menahan air buruk -> kekeringan lebih terasa
    """
    info = SAYUR[sayur]
    faktor = 0.0

    selisih = suhu - info["suhu_opt"]
    faktor += 0.012 * selisih if selisih > 0 else 0.02 * (-selisih)

    defisit = max(0.0, info["air_opt"] - hujan)
    faktor += (0.012 + TAMBAHAN_DEFISIT_AIR[tanah]) * defisit
    if hujan > 18:
        faktor += 0.006 * (hujan - 18)

    faktor += EFEK_TANAH[tanah]
    if lembap < 65:
        faktor += 0.003 * (65 - lembap)

    return info["hst"] * (1 + faktor)


def buat_dataset(n_per_kombinasi: int = 40, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    baris = []
    for sayur in SAYUR:
        for tanah in TANAH:
            suhu = np.clip(rng.normal(27.5, 2.2, n_per_kombinasi), 20, 36)
            hujan = np.clip(rng.gamma(2.0, 4.0, n_per_kombinasi), 0, 30)
            lembap = np.clip(
                78 + 0.7 * hujan - 1.2 * (suhu - 27.5) + rng.normal(0, 5, n_per_kombinasi), 45, 98
            )
            for s, h, l in zip(suhu, hujan, lembap):
                hst = hst_aturan(sayur, tanah, s, h, l)
                hst += rng.normal(0, 0.03 * SAYUR[sayur]["hst"])  # variasi alami di lapangan
                baris.append(
                    {
                        "jenis_sayur": sayur,
                        "jenis_tanah": tanah,
                        "suhu_rata": round(float(s), 2),
                        "curah_hujan_rata": round(float(h), 2),
                        "kelembapan_rata": round(float(l), 2),
                        "hst": max(10.0, float(hst)),
                    }
                )
    return pd.DataFrame(baris)


def buat_pipeline() -> Pipeline:
    pra = ColumnTransformer(
        [
            ("kategori", OneHotEncoder(handle_unknown="ignore"), FITUR_KATEGORI),
            ("angka", "passthrough", FITUR_ANGKA),
        ]
    )
    rf = RandomForestRegressor(n_estimators=200, min_samples_leaf=2, random_state=42, n_jobs=-1)
    return Pipeline([("pra", pra), ("rf", rf)])


def latih(simpan: bool = True, verbose: bool = False) -> dict:
    df = buat_dataset()
    X = df[FITUR_KATEGORI + FITUR_ANGKA]
    y = df["hst"]
    X_latih, X_uji, y_latih, y_uji = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = buat_pipeline()
    pipeline.fit(X_latih, y_latih)
    pred = pipeline.predict(X_uji)
    metrik = {
        "jumlah_data": int(len(df)),
        "mae_hari": round(float(mean_absolute_error(y_uji, pred)), 2),
        "r2": round(float(r2_score(y_uji, pred)), 4),
    }

    # Latih ulang dengan seluruh data sebelum disimpan
    pipeline.fit(X, y)
    if simpan:
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump({"pipeline": pipeline, "metrik": metrik}, MODEL_PANEN)
    if verbose:
        print(f"[panen] data={metrik['jumlah_data']}  MAE={metrik['mae_hari']} hari  R2={metrik['r2']}")
        if simpan:
            print(f"[panen] model disimpan di {MODEL_PANEN}")
    return metrik


if __name__ == "__main__":
    latih(verbose=True)
