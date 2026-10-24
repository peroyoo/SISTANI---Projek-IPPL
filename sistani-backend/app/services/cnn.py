"""Diagnosis kerusakan tanaman dari foto (CNN, MobileNetV2 hasil transfer learning).

PyTorch dimuat hanya saat dibutuhkan, jadi server tetap bisa jalan tanpa PyTorch.
Fitur foto baru aktif setelah: (1) PyTorch terpasang, (2) model dilatih (python -m ml.train_cnn).
"""
import json

from app.config import get_settings
from app.services.penanganan import info_dari_label
from ml.paths import KELAS_CNN, MODEL_CNN

UKURAN_GAMBAR = 224
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

_cache: dict = {}


class ModelBelumSiap(Exception):
    """Dilempar jika PyTorch belum terpasang atau model CNN belum dilatih."""


def status_siap() -> tuple[bool, str]:
    try:
        import torch  # noqa: F401
        import torchvision  # noqa: F401
    except ImportError:
        return False, "PyTorch belum terpasang di server (pip install -r requirements-cnn.txt)."
    if not MODEL_CNN.exists() or not KELAS_CNN.exists():
        return False, "Model CNN belum dilatih (jalankan: python -m ml.train_cnn)."
    return True, "siap"


def _muat():
    if "model" in _cache:
        return _cache["model"], _cache["kelas"], _cache["transform"]

    siap, pesan = status_siap()
    if not siap:
        raise ModelBelumSiap(pesan)

    import torch
    from torch import nn
    from torchvision import models, transforms

    kelas = json.loads(KELAS_CNN.read_text(encoding="utf-8"))
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, len(kelas))
    model.load_state_dict(torch.load(MODEL_CNN, map_location="cpu"))
    model.eval()

    transform = transforms.Compose(
        [
            transforms.Resize((UKURAN_GAMBAR, UKURAN_GAMBAR)),
            transforms.ToTensor(),
            transforms.Normalize(MEAN, STD),
        ]
    )
    _cache.update(model=model, kelas=kelas, transform=transform)
    return model, kelas, transform


def diagnosis_foto(path_foto: str) -> dict:
    """Mengembalikan hasil diagnosis dari file foto. Format sama dengan diagnosis teks."""
    import torch
    from PIL import Image

    model, kelas, transform = _muat()
    gambar = Image.open(path_foto).convert("RGB")
    x = transform(gambar).unsqueeze(0)
    with torch.no_grad():
        proba = torch.softmax(model(x), dim=1)[0]

    nilai, indeks = torch.sort(proba, descending=True)
    utama = kelas[int(indeks[0])]
    confidence = float(nilai[0])
    info = info_dari_label(utama)

    alternatif = []
    for n, i in list(zip(nilai.tolist(), indeks.tolist()))[1:3]:
        if n >= 0.10:
            alternatif.append({"nama": info_dari_label(kelas[i])["nama"], "confidence": round(float(n), 4)})

    yakin = confidence >= get_settings().ambang_confidence
    saran = None
    if not yakin:
        saran = (
            "Sistem kurang yakin dengan hasil dari foto ini. Ambil foto ulang dari jarak dekat, "
            "fokus pada bagian yang rusak, dengan cahaya cukup dan latar polos, lalu coba lagi."
        )
    return {
        "kelas": utama,
        "nama_diagnosis": info["nama"],
        "confidence": round(confidence, 4),
        "keyakinan": "yakin" if yakin else "kurang_yakin",
        "penyebab": info["penyebab"],
        "penanganan": info["penanganan"],
        "pencegahan": info["pencegahan"],
        "alternatif": alternatif,
        "saran": saran,
    }
