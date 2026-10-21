"""Tes alur lengkap SISTANI. Jalankan dari folder proyek:  pytest -v

Tes memakai database SQLite sementara dan cuaca palsu, jadi tidak menyentuh PostgreSQL
dan tidak butuh internet.
"""
import io
import os
import shutil
import uuid
from datetime import date, timedelta
from pathlib import Path

import pytest

# Harus diatur SEBELUM aplikasi diimpor
os.environ["DATABASE_URL"] = "sqlite:///./test_sistani.db"
os.environ["ADMIN_EMAIL"] = "admin@sistani-test.com"
os.environ["ADMIN_PASSWORD"] = "admin-test-123"
os.environ["UPLOAD_DIR"] = "uploads_test"

from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app  # noqa: E402
from app.services import cnn, cuaca  # noqa: E402

CUACA_PALSU = {
    "suhu_rata": 27.0,
    "curah_hujan_rata": 8.0,
    "kelembapan_rata": 80.0,
    "hari_ini": {"suhu": 28.0, "curah_hujan_mm": 0.2, "kelembapan": 78.0},
    "sumber": "open-meteo",
}


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

    from app.database import engine

    engine.dispose()

    Path("test_sistani.db").unlink(missing_ok=True)
    shutil.rmtree("uploads_test", ignore_errors=True)


@pytest.fixture(autouse=True)
def cuaca_palsu(monkeypatch):
    monkeypatch.setattr(cuaca, "cari_koordinat", lambda nama: (-1.2379, 116.8529))
    monkeypatch.setattr(cuaca, "ambil_cuaca", lambda lat, lon, hari_lalu=14: dict(CUACA_PALSU))


def daftar_dan_login(client, nama="Bu Tani"):
    email = f"{uuid.uuid4().hex[:8]}@sistani-test.com"
    r = client.post("/auth/register", json={"nama": nama, "email": email, "password": "rahasia123"})
    assert r.status_code == 201, r.text
    r = client.post("/auth/login", json={"email": email, "password": "rahasia123"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}, r.json(), email


def login_admin(client):
    r = client.post("/auth/login", json={"email": "admin@sistani-test.com", "password": "admin-test-123"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def data_kebun(**ubah):
    d = {
        "nama_kebun": "Kebun Sukamaju",
        "jenis_sayur": "cabai_rawit",
        "tanggal_tanam": (date.today() - timedelta(days=45)).isoformat(),
        "jenis_tanah": "liat",
        "lokasi": "Balikpapan",
    }
    d.update(ubah)
    return d


def foto_png():
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), (20, 120, 30)).save(buf, "PNG")
    buf.seek(0)
    return buf


def test_akun_dan_password(client):
    h, token, email = daftar_dan_login(client)
    assert token["role"] == "petani"

    # email dobel ditolak, password salah ditolak
    r = client.post("/auth/register", json={"nama": "Dobel", "email": email, "password": "rahasia123"})
    assert r.status_code == 409
    r = client.post("/auth/login", json={"email": email, "password": "salah-salah"})
    assert r.status_code == 401

    assert client.get("/auth/me", headers=h).json()["email"] == email
    assert client.get("/auth/me").status_code == 401  # tanpa token

    r = client.post("/auth/ubah-password", headers=h, json={"password_lama": "rahasia123", "password_baru": "baru-12345"})
    assert r.status_code == 200
    assert client.post("/auth/login", json={"email": email, "password": "baru-12345"}).status_code == 200


def test_kebun_dan_prediksi(client):
    h, _, _ = daftar_dan_login(client)

    r = client.post("/kebun", headers=h, json=data_kebun())
    assert r.status_code == 201, r.text
    kebun = r.json()
    assert kebun["latitude"] == pytest.approx(-1.2379)

    # validasi: sayur tidak dikenal dan tanggal masa depan
    assert client.post("/kebun", headers=h, json=data_kebun(jenis_sayur="durian")).status_code == 422
    besok = (date.today() + timedelta(days=1)).isoformat()
    assert client.post("/kebun", headers=h, json=data_kebun(tanggal_tanam=besok)).status_code == 422

    assert len(client.get("/kebun", headers=h).json()) == 1
    r = client.put(f"/kebun/{kebun['id']}", headers=h, json={"jenis_tanah": "berpasir"})
    assert r.status_code == 200 and r.json()["jenis_tanah"] == "berpasir"

    r = client.post(f"/kebun/{kebun['id']}/prediksi", headers=h)
    assert r.status_code == 201, r.text
    p = r.json()
    assert p["umur_hari"] == 45 and p["sisa_hari"] > 0
    assert p["sumber_cuaca"] == "open-meteo" and p["catatan"]
    assert len(client.get(f"/kebun/{kebun['id']}/prediksi", headers=h).json()) == 1

    r = client.get(f"/kebun/{kebun['id']}/ringkasan", headers=h)
    assert r.status_code == 200, r.text
    assert r.json()["nama_sayur"] == "Cabai rawit" and r.json()["cuaca_hari_ini"]["suhu"] == 28.0

    # kebun milik orang lain tidak bisa diakses
    h2, _, _ = daftar_dan_login(client, "Orang Lain")
    assert client.get(f"/kebun/{kebun['id']}", headers=h2).status_code == 404

    assert client.delete(f"/kebun/{kebun['id']}", headers=h).status_code == 200
    assert client.get("/kebun", headers=h).json() == []


def test_diagnosis_teks(client):
    h, _, _ = daftar_dan_login(client)
    r = client.post("/kerusakan/teks", headers=h, json={"gejala": "daun keriting dan ada kutu kecil di bawah daun"})
    assert r.status_code == 201, r.text
    hasil = r.json()
    assert 0 <= hasil["confidence"] <= 1 and hasil["penanganan"]
    assert hasil["keyakinan"] in ("yakin", "kurang_yakin")

    assert client.post("/kerusakan/teks", headers=h, json={"gejala": "pendek"}).status_code == 422
    assert len(client.get("/kerusakan/riwayat", headers=h).json()) == 1


def test_premium_foto_dan_admin(client, monkeypatch):
    h, _, _ = daftar_dan_login(client)
    admin = login_admin(client)

    # belum premium -> ditolak dengan tawaran upgrade
    r = client.post("/kerusakan/foto", headers=h, files={"file": ("a.png", foto_png(), "image/png")})
    assert r.status_code == 403 and r.json()["detail"]["kode"] == "PREMIUM_DIPERLUKAN"
    assert client.get("/premium/status", headers=h).json()["premium_aktif"] is False

    # upgrade (simulasi) lalu admin menyetujui
    r = client.post("/premium/upgrade", headers=h, json={"metode": "qris", "nomor_referensi": "REF-0001"})
    assert r.status_code == 201, r.text
    bayar_id = r.json()["id"]
    assert client.post("/premium/upgrade", headers=h, json={"metode": "qris", "nomor_referensi": "REF-0002"}).status_code == 409

    # petani tidak boleh membuka fitur admin
    assert client.get("/admin/pembayaran", headers=h).status_code == 403

    daftar = client.get("/admin/pembayaran", headers=admin).json()
    assert any(p["id"] == bayar_id for p in daftar)
    r = client.post(f"/admin/pembayaran/{bayar_id}/setujui", headers=admin, json={"catatan": "ok"})
    assert r.status_code == 200 and r.json()["status"] == "disetujui"
    assert client.post(f"/admin/pembayaran/{bayar_id}/setujui", headers=admin).status_code == 409

    st = client.get("/premium/status", headers=h).json()
    assert st["premium_aktif"] is True and st["premium_sampai"]

    # model CNN belum dilatih di lingkungan tes -> 503 yang jelas
    r = client.post("/kerusakan/foto", headers=h, files={"file": ("a.png", foto_png(), "image/png")})
    assert r.status_code == 503

    # dengan CNN palsu, alur foto berhasil
    monkeypatch.setattr(cnn, "status_siap", lambda: (True, "siap"))
    monkeypatch.setattr(
        cnn,
        "diagnosis_foto",
        lambda path: {
            "kelas": "bercak_daun", "nama_diagnosis": "Bercak daun (jamur atau bakteri)", "confidence": 0.91,
            "keyakinan": "yakin", "penyebab": "x", "penanganan": ["a"], "pencegahan": ["b"], "alternatif": [], "saran": None,
        },
    )
    r = client.post("/kerusakan/foto", headers=h, files={"file": ("a.png", foto_png(), "image/png")})
    assert r.status_code == 201, r.text
    assert r.json()["metode"] == "foto" and r.json()["confidence"] == 0.91

    r = client.post("/kerusakan/foto", headers=h, files={"file": ("a.txt", io.BytesIO(b"bukan foto"), "text/plain")})
    assert r.status_code == 415

    lap = client.get("/admin/laporan", headers=admin).json()
    assert lap["diagnosis_foto"] >= 1 and lap["pendapatan_total"] >= 49000 and lap["premium_aktif"] >= 1


def test_admin_nonaktifkan_akun(client):
    h, _, email = daftar_dan_login(client, "Akan Dinonaktifkan")
    admin = login_admin(client)
    petani_id = client.get("/auth/me", headers=h).json()["id"]

    assert any(p["id"] == petani_id for p in client.get("/admin/petani", headers=admin, params={"cari": email}).json())
    r = client.patch(f"/admin/petani/{petani_id}/status", headers=admin, json={"aktif": False})
    assert r.status_code == 200

    assert client.post("/auth/login", json={"email": email, "password": "rahasia123"}).status_code == 403
    assert client.get("/auth/me", headers=h).status_code == 403  # token lama pun tidak berlaku

    client.patch(f"/admin/petani/{petani_id}/status", headers=admin, json={"aktif": True})
    assert client.post("/auth/login", json={"email": email, "password": "rahasia123"}).status_code == 200


def test_referensi(client):
    r = client.get("/referensi")
    assert r.status_code == 200 and len(r.json()["jenis_sayur"]) >= 10
