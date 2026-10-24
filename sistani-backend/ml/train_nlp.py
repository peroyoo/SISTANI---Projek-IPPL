"""Melatih model diagnosis kerusakan dari teks gejala (NLP).

Metode: TF-IDF (kata + potongan huruf, supaya tahan salah ketik) lalu Logistic Regression.
Jalankan dari folder proyek:  python -m ml.train_nlp
"""
import random

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.pipeline import FeatureUnion, Pipeline

from ml.data_gejala import GEJALA
from ml.paths import MODEL_DIR, MODEL_NLP

# Lima kalimat (urutan ke-3, 7, 11, 15, 19) tiap kelas disisihkan sebagai data uji yang tidak pernah dilihat model.
INDEKS_UJI = {2, 6, 10, 14, 18}

AWALAN = [
    "",
    "tanaman {s} saya ",
    "di kebun saya ",
    "{s} saya ",
    "sejak beberapa hari ini ",
]
AKHIRAN = ["", " sudah beberapa hari", " dan semakin parah", " mohon bantuannya"]
SAYUR_CONTOH = ["cabai", "tomat", "sawi", "kangkung", "terong", "timun", "kol", "bayam"]


def perbanyak(kalimat: str, rng: random.Random) -> list[str]:
    """Membuat variasi kalimat dengan awalan/akhiran yang umum dipakai petani."""
    hasil = []
    for awal in AWALAN:
        for akhir in AKHIRAN:
            teks = awal.format(s=rng.choice(SAYUR_CONTOH)) + kalimat + akhir
            hasil.append(teks.strip())
    return hasil


def siapkan_data(seed: int = 7):
    rng = random.Random(seed)
    teks_latih, label_latih, teks_uji, label_uji = [], [], [], []
    for kelas, daftar in GEJALA.items():
        for i, kalimat in enumerate(daftar):
            if i in INDEKS_UJI:
                teks_uji.append(kalimat)
                label_uji.append(kelas)
            else:
                for varian in perbanyak(kalimat, rng):
                    teks_latih.append(varian)
                    label_latih.append(kelas)
    return teks_latih, label_latih, teks_uji, label_uji


def buat_pipeline() -> Pipeline:
    fitur = FeatureUnion(
        [
            ("kata", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=1)),
            ("huruf", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), sublinear_tf=True, min_df=2)),
        ]
    )
    return Pipeline([("fitur", fitur), ("lr", LogisticRegression(C=10, max_iter=2000))])


def latih(simpan: bool = True, verbose: bool = False) -> dict:
    teks_latih, label_latih, teks_uji, label_uji = siapkan_data()
    pipeline = buat_pipeline()
    pipeline.fit(teks_latih, label_latih)
    akurasi = accuracy_score(label_uji, pipeline.predict(teks_uji))
    metrik = {
        "jumlah_data_latih": len(teks_latih),
        "jumlah_data_uji": len(teks_uji),
        "akurasi_uji": round(float(akurasi), 4),
    }

    if simpan:
        # Latih ulang dengan semua kalimat (termasuk yang tadi dipakai untuk uji) sebelum disimpan
        rng = random.Random(7)
        semua_teks, semua_label = [], []
        for kelas, daftar in GEJALA.items():
            for kalimat in daftar:
                for varian in perbanyak(kalimat, rng):
                    semua_teks.append(varian)
                    semua_label.append(kelas)
        pipeline.fit(semua_teks, semua_label)
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump({"pipeline": pipeline, "metrik": metrik}, MODEL_NLP)

    if verbose:
        print(
            f"[nlp] latih={metrik['jumlah_data_latih']}  uji={metrik['jumlah_data_uji']}  "
            f"akurasi uji={metrik['akurasi_uji']:.1%}"
        )
        if simpan:
            print(f"[nlp] model disimpan di {MODEL_NLP}")
    return metrik


if __name__ == "__main__":
    latih(verbose=True)
