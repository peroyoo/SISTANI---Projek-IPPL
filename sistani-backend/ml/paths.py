"""Lokasi folder yang dipakai bersama oleh aplikasi dan skrip training."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "models_ai"
DATA_DIR = BASE_DIR / "ml" / "data"

MODEL_PANEN = MODEL_DIR / "model_panen.joblib"
MODEL_NLP = MODEL_DIR / "model_nlp.joblib"
MODEL_CNN = MODEL_DIR / "model_cnn.pt"
KELAS_CNN = MODEL_DIR / "kelas_cnn.json"
