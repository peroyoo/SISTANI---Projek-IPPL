"""Tes modul AI (prediksi panen, NLP, pemetaan label). Tidak butuh database maupun internet."""
from datetime import date, timedelta

from app.services import cuaca, nlp, panen
from app.services.penanganan import info_dari_label


def _cuaca(hujan, suhu, lembap=78.0):
    return {
        "suhu_rata": suhu,
        "curah_hujan_rata": hujan,
        "kelembapan_rata": lembap,
        "hari_ini": {"suhu": suhu, "curah_hujan_mm": hujan, "kelembapan": lembap},
        "sumber": "open-meteo",
    }


def test_kemarau_membuat_panen_lebih_lama(monkeypatch):
    tanam = date.today() - timedelta(days=30)

    monkeypatch.setattr(cuaca, "ambil_cuaca", lambda lat, lon, hari_lalu=14: _cuaca(8.0, 27.0))
    normal = panen.hitung("cabai_rawit", "berpasir", tanam, -1.2, 116.8)

    monkeypatch.setattr(cuaca, "ambil_cuaca", lambda lat, lon, hari_lalu=14: _cuaca(0.5, 32.0))
    kemarau = panen.hitung("cabai_rawit", "berpasir", tanam, -1.2, 116.8)

    assert kemarau["estimasi_total_hari"] > normal["estimasi_total_hari"]
    assert kemarau["tanggal_terawal"] <= kemarau["tanggal_panen"] <= kemarau["tanggal_terlambat"]


def test_sayur_cepat_panen_lebih_awal_dari_cabai(monkeypatch):
    monkeypatch.setattr(cuaca, "ambil_cuaca", lambda lat, lon, hari_lalu=14: _cuaca(8.0, 27.0))
    tanam = date.today() - timedelta(days=10)
    kangkung = panen.hitung("kangkung", "lempung", tanam, -1.2, 116.8)
    cabai = panen.hitung("cabai_rawit", "lempung", tanam, -1.2, 116.8)
    assert kangkung["estimasi_total_hari"] < 45 < cabai["estimasi_total_hari"]


def test_cadangan_saat_api_cuaca_gagal(monkeypatch):
    monkeypatch.setattr(cuaca, "ambil_cuaca", lambda lat, lon, hari_lalu=14: None)
    hasil = panen.hitung("tomat", "liat", date.today() - timedelta(days=20), -1.2, 116.8)
    assert hasil["sumber_cuaca"] == "default"
    assert hasil["estimasi_total_hari"] > 0 and hasil["catatan"]


def test_status_terlambat_dan_siap(monkeypatch):
    monkeypatch.setattr(cuaca, "ambil_cuaca", lambda lat, lon, hari_lalu=14: _cuaca(8.0, 27.0))
    terlambat = panen.hitung("kangkung", "lempung", date.today() - timedelta(days=200), -1.2, 116.8)
    assert terlambat["status"] == "terlambat" and terlambat["sisa_hari"] == 0

    siap = panen.hitung("kangkung", "lempung", date.today() - timedelta(days=30), -1.2, 116.8)
    assert siap["status"] == "siap_panen"


def test_nlp_mengenali_gejala_jelas():
    hasil = nlp.diagnosis_teks("daun keriting dan ada kutu kecil menempel di bawah daun")
    assert hasil["kelas"] == "kutu_daun" and hasil["keyakinan"] == "yakin"

    hasil = nlp.diagnosis_teks("sudah dua minggu tidak hujan tanah retak dan daun mengering")
    assert hasil["kelas"] == "cekaman_kekeringan"


def test_nlp_teks_tidak_jelas_ditandai_kurang_yakin():
    hasil = nlp.diagnosis_teks("halo apa kabar hari ini")
    assert hasil["keyakinan"] == "kurang_yakin" and hasil["saran"]


def test_label_dataset_foto_dipetakan():
    assert "Bercak daun" in info_dari_label("Tomato___Late_blight")["nama"]
    assert "sehat" in info_dari_label("Tomato___healthy")["nama"].lower()
    assert info_dari_label("label_aneh")["penanganan"]  # selalu ada saran umum
