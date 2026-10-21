"""Melatih model CNN untuk diagnosis kerusakan dari foto (transfer learning MobileNetV2).

Siapkan dataset foto dalam folder, satu subfolder per kelas:

    ml/data/foto/
        Tomato___Late_blight/   gambar1.jpg gambar2.jpg ...
        Tomato___healthy/       ...
        Pepper__bell___Bacterial_spot/ ...

Dataset yang umum dipakai: PlantVillage (Kaggle). Pilih kelas yang relevan dengan sayur
yang didukung SISTANI. Nama folder = nama kelas yang tampil di diagnosis.

Contoh menjalankan (dari folder proyek):
    python -m ml.train_cnn --epoch 5 --maks-per-kelas 300

Hasil: models_ai/model_cnn.pt dan models_ai/kelas_cnn.json
"""
import argparse
import json
import random

from ml.paths import DATA_DIR, KELAS_CNN, MODEL_CNN, MODEL_DIR


def main():
    parser = argparse.ArgumentParser(description="Latih CNN diagnosis foto SISTANI")
    parser.add_argument("--data", default=str(DATA_DIR / "foto"), help="folder dataset foto")
    parser.add_argument("--epoch", type=int, default=5)
    parser.add_argument("--batch", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--maks-per-kelas", type=int, default=300, help="batasi jumlah foto per kelas agar cepat di laptop")
    args = parser.parse_args()

    import torch
    from torch import nn
    from torch.utils.data import DataLoader, Subset
    from torchvision import datasets, models, transforms

    from app.services.cnn import MEAN, STD, UKURAN_GAMBAR

    random.seed(42)
    torch.manual_seed(42)
    perangkat = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Perangkat: {perangkat}")

    tf_latih = transforms.Compose(
        [
            transforms.Resize((UKURAN_GAMBAR, UKURAN_GAMBAR)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(),
            transforms.Normalize(MEAN, STD),
        ]
    )
    tf_uji = transforms.Compose(
        [transforms.Resize((UKURAN_GAMBAR, UKURAN_GAMBAR)), transforms.ToTensor(), transforms.Normalize(MEAN, STD)]
    )

    data_latih_penuh = datasets.ImageFolder(args.data, transform=tf_latih)
    data_uji_penuh = datasets.ImageFolder(args.data, transform=tf_uji)
    kelas = data_latih_penuh.classes
    print(f"{len(kelas)} kelas: {kelas}")

    # Bagi per kelas: 80% latih, 20% uji, dengan batas jumlah per kelas
    idx_per_kelas: dict[int, list[int]] = {}
    for i, (_, label) in enumerate(data_latih_penuh.samples):
        idx_per_kelas.setdefault(label, []).append(i)
    idx_latih, idx_uji = [], []
    for label, daftar in idx_per_kelas.items():
        random.shuffle(daftar)
        daftar = daftar[: args.maks_per_kelas]
        batas = int(len(daftar) * 0.8)
        idx_latih += daftar[:batas]
        idx_uji += daftar[batas:]
    print(f"Foto latih: {len(idx_latih)}  foto uji: {len(idx_uji)}")

    loader_latih = DataLoader(Subset(data_latih_penuh, idx_latih), batch_size=args.batch, shuffle=True)
    loader_uji = DataLoader(Subset(data_uji_penuh, idx_uji), batch_size=args.batch)

    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    for p in model.features.parameters():
        p.requires_grad = False  # bagian pengenal fitur dibekukan, hanya lapisan akhir yang dilatih
    model.classifier[1] = nn.Linear(model.last_channel, len(kelas))
    model.to(perangkat)

    optimizer = torch.optim.Adam(model.classifier.parameters(), lr=args.lr)
    kriteria = nn.CrossEntropyLoss()
    terbaik = 0.0

    for epoch in range(1, args.epoch + 1):
        model.train()
        total_loss = 0.0
        for x, y in loader_latih:
            x, y = x.to(perangkat), y.to(perangkat)
            optimizer.zero_grad()
            loss = kriteria(model(x), y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * x.size(0)

        model.eval()
        benar = total = 0
        with torch.no_grad():
            for x, y in loader_uji:
                x, y = x.to(perangkat), y.to(perangkat)
                benar += (model(x).argmax(1) == y).sum().item()
                total += y.size(0)
        akurasi = benar / max(total, 1)
        print(f"Epoch {epoch}/{args.epoch}  loss={total_loss / max(len(idx_latih), 1):.4f}  akurasi uji={akurasi:.1%}")

        if akurasi >= terbaik:
            terbaik = akurasi
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
            torch.save(model.state_dict(), MODEL_CNN)
            KELAS_CNN.write_text(json.dumps(kelas, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Selesai. Akurasi uji terbaik {terbaik:.1%}. Model disimpan di {MODEL_CNN}")


if __name__ == "__main__":
    main()
