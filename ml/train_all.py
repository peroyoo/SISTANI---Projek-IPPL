"""Melatih model prediksi panen dan NLP sekaligus (CNN dilatih terpisah: python -m ml.train_cnn)."""
from ml import train_nlp, train_panen

if __name__ == "__main__":
    train_panen.latih(verbose=True)
    train_nlp.latih(verbose=True)
