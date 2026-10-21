"""Diagnosis kerusakan tanaman dari teks gejala (NLP)."""
import joblib

from app.config import get_settings
from app.services.penanganan import info_dari_label
from ml.paths import MODEL_NLP

_model = None


def muat_model():
    global _model
    if _model is None:
        if not MODEL_NLP.exists():
            from ml.train_nlp import latih

            latih(simpan=True)
        _model = joblib.load(MODEL_NLP)["pipeline"]
    return _model


def diagnosis_teks(gejala: str) -> dict:
    """Mengembalikan kelas terbaik, confidence (0-1), alternatif, dan saran penanganan."""
    ambang = get_settings().ambang_confidence
    model = muat_model()
    proba = model.predict_proba([gejala.strip().lower()])[0]
    urut = proba.argsort()[::-1]

    kelas = str(model.classes_[urut[0]])
    confidence = float(proba[urut[0]])
    info = info_dari_label(kelas)

    alternatif = []
    for i in urut[1:3]:
        if proba[i] >= 0.10:
            alternatif.append({"nama": info_dari_label(str(model.classes_[i]))["nama"], "confidence": round(float(proba[i]), 4)})

    yakin = confidence >= ambang
    saran = None
    if not yakin:
        saran = (
            "Sistem kurang yakin dengan hasil ini. Ceritakan gejala lebih rinci (bagian tanaman yang terkena, "
            "warna, ada tidaknya serangga, sejak kapan, cuaca beberapa hari terakhir), atau gunakan diagnosis "
            "lewat foto (premium)."
        )
    return {
        "kelas": kelas,
        "nama_diagnosis": info["nama"],
        "confidence": round(confidence, 4),
        "keyakinan": "yakin" if yakin else "kurang_yakin",
        "penyebab": info["penyebab"],
        "penanganan": info["penanganan"],
        "pencegahan": info["pencegahan"],
        "alternatif": alternatif,
        "saran": saran,
    }
