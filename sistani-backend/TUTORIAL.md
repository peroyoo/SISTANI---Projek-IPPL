# Tutorial Backend SISTANI dari Nol

Backend ini dibuat dengan **Python + FastAPI + PostgreSQL**. Model AI-nya (prediksi panen, NLP, CNN) dibuat dan dijalankan di dalam sistem itu sendiri, bukan memanggil AI dari luar. Satu-satunya layanan luar adalah API cuaca (Open-Meteo, gratis, tanpa kunci).

Perintah di bawah ditulis untuk **Windows**. Perbedaan untuk Mac/Linux diberi catatan.

---

## 0. Gambaran singkat

```
Frontend (web)  --HTTP/JSON-->  FastAPI  -->  PostgreSQL   (akun, kebun, riwayat, pembayaran)
                                   |-->  Open-Meteo        (cuaca otomatis)
                                   |-->  Model prediksi panen (Random Forest)
                                   |-->  Model NLP (TF-IDF + Logistic Regression)
                                   `-->  Model CNN (MobileNetV2)  [fitur foto, premium]
```

Struktur folder:

```
sistani-backend/
├── app/
│   ├── main.py            titik masuk server, CORS, daftar router, pembuatan admin awal
│   ├── config.py          membaca pengaturan dari file .env
│   ├── database.py        koneksi ke PostgreSQL
│   ├── models.py          definisi tabel (users, kebun, prediksi, laporan_kerusakan, pembayaran_premium)
│   ├── schemas.py         bentuk data masuk/keluar + validasi
│   ├── security.py        hash password (bcrypt) dan token login (JWT)
│   ├── deps.py            "siapa yang login" dan pembatasan akses petani/admin
│   ├── konstanta.py       daftar sayur dan jenis tanah
│   ├── routers/           endpoint: auth, kebun, prediksi, kerusakan, premium, admin
│   └── services/          cuaca.py, panen.py, nlp.py, cnn.py, penanganan.py
├── ml/                    skrip melatih model + data latih
├── models_ai/             hasil latihan model (dibuat otomatis)
├── uploads/               foto yang diunggah petani (dibuat otomatis)
├── tests/                 tes otomatis
├── .env.example           contoh pengaturan
├── requirements.txt       daftar library
└── requirements-cnn.txt   library tambahan khusus fitur foto
```

---

## 1. Pasang alat yang dibutuhkan

1. **Python 3.11 atau 3.12** dari python.org. Saat memasang, **centang "Add python.exe to PATH"**. Cek di terminal: `python --version`.
2. **PostgreSQL** (versi 15 atau 16) dari postgresql.org. Saat memasang:
   - Catat **password** untuk user `postgres`. Kamu akan memakainya nanti.
   - Biarkan port tetap `5432`.
   - Pasang juga **pgAdmin** (ikut dalam installer).
3. **VS Code** (opsional tapi disarankan) untuk membuka folder proyek.

## 2. Buat database

Cara paling mudah lewat pgAdmin:

1. Buka pgAdmin, masukkan password `postgres`.
2. Klik kanan **Databases** → **Create** → **Database...**
3. Isi nama: `sistani`, lalu **Save**.

(Lewat terminal: `psql -U postgres -c "CREATE DATABASE sistani;"`)

Tabel tidak perlu dibuat manual. Server membuatnya sendiri saat pertama dijalankan.

## 3. Siapkan proyek

1. Ekstrak `sistani-backend.zip`, lalu buka foldernya di VS Code.
2. Buka terminal (di VS Code: menu **Terminal → New Terminal**). Pastikan posisinya di dalam folder `sistani-backend`.
3. Buat lingkungan virtual (kotak terisolasi untuk library proyek ini):

   ```
   python -m venv venv
   venv\Scripts\activate
   ```

   Mac/Linux: `source venv/bin/activate`.
   Kalau di Windows muncul galat *"running scripts is disabled"*, jalankan sekali:
   `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, lalu ulangi.
   Jika berhasil, awal baris terminal akan ada tulisan `(venv)`.

4. Pasang library:

   ```
   pip install -r requirements.txt
   ```

## 4. Atur file .env

1. Salin `.env.example` menjadi `.env` (di VS Code: klik kanan → Copy, lalu Paste dan ganti namanya jadi `.env`).
2. Buka `.env` lalu ubah:
   - `DATABASE_URL`: ganti `password_postgres_kamu` dengan password PostgreSQL kamu. Jika password memuat karakter khusus seperti `@` atau `#`, tulis dalam bentuk URL (`@` menjadi `%40`).
   - `SECRET_KEY`: isi teks acak. Untuk membuatnya: `python -c "import secrets; print(secrets.token_hex(32))"`.
   - `ADMIN_EMAIL` dan `ADMIN_PASSWORD`: akun admin yang akan dibuat otomatis.
   - `HARGA_PREMIUM`: tentukan harga yang kamu pakai (di mockup masih Rp49.000; samakan dengan desain webmu).

> File `.env` berisi rahasia. Jangan diunggah ke GitHub. `.gitignore` sudah mengecualikannya.

## 5. Latih model AI

```
python -m ml.train_all
```

Perintah ini melatih dua model (prediksi panen dan NLP) dalam hitungan detik, lalu menyimpannya di `models_ai/`. Contoh keluaran:

```
[panen] data=2400  MAE=1.98 hari  R2=0.9921
[nlp] latih=3000  uji=50  akurasi uji=84.0%
```

Kalau lupa menjalankan langkah ini, server akan melatihnya sendiri saat pertama dipakai. Model CNN (foto) dilatih terpisah, lihat bagian 9.

## 6. Jalankan server

```
uvicorn app.main:app --reload
```

Buka browser: **http://127.0.0.1:8000/docs**. Itu halaman dokumentasi interaktif: semua endpoint bisa dicoba di sana tanpa perlu frontend. Server baru berhenti dengan `Ctrl + C`.

Saat pertama jalan, tabel di PostgreSQL dibuat dan akun admin dari `.env` dibuat otomatis.

## 7. Mencoba alur lengkap di /docs

Lakukan berurutan:

1. **Membuat akun petani**: `POST /auth/register` → *Try it out*, isi nama, email, password (minimal 8 karakter) → *Execute*.
2. **Login**: `POST /auth/login` dengan email dan password tadi. Salin nilai `access_token`.
3. Klik tombol **Authorize** (kanan atas). Isi `username` dengan email, `password` dengan password, lalu Authorize. Sekarang semua permintaan membawa token.
4. **Menambahkan kebun**: `POST /kebun`. Contoh isi:

   ```json
   {
     "nama_kebun": "Kebun Sukamaju",
     "jenis_sayur": "cabai_rawit",
     "tanggal_tanam": "2026-09-01",
     "jenis_tanah": "liat",
     "lokasi": "Balikpapan"
   }
   ```

   Pilihan jenis sayur dan tanah ada di `GET /referensi`. Koordinat dicari otomatis dari nama lokasi.
5. **Melihat prediksi panen**: `POST /kebun/{kebun_id}/prediksi`. Hasilnya: estimasi hari panen, tanggal panen, rentang tanggal, dan catatan (misalnya peringatan kemarau).
6. **Ringkasan kebun untuk dashboard**: `GET /kebun/{kebun_id}/ringkasan` (umur tanaman, cuaca hari ini, estimasi panen).
7. **Laporan kerusakan teks**: `POST /kerusakan/teks`, contoh `{"gejala": "daun keriting dan ada kutu kecil di bawah daun"}`.
8. **Foto (premium)**: `POST /kerusakan/foto` akan ditolak dengan kode `PREMIUM_DIPERLUKAN`. Ini alur "bukan premium" di activity diagram.
9. **Upgrade premium**: `POST /premium/upgrade` (metode `qris`, nomor referensi bebas, ini simulasi). Statusnya `menunggu`.
10. **Admin menyetujui**: klik **Authorize** → *Logout*, login ulang sebagai admin (`POST /auth/login` dengan email admin dari `.env`), lalu `GET /admin/pembayaran` dan `POST /admin/pembayaran/{id}/setujui`.
11. Login lagi sebagai petani: `GET /premium/status` sekarang `premium_aktif: true`.

## 8. Menjalankan tes otomatis

```
pytest -v
```

Ada dua berkas tes:
- `tests/test_ai.py`: prediksi panen (kemarau membuat panen lebih lama, cadangan saat API cuaca gagal), NLP, dan pemetaan label.
- `tests/test_alur.py`: alur lengkap API (akun, kebun, prediksi, diagnosis, premium, admin) memakai database SQLite sementara dan cuaca palsu, jadi tidak menyentuh PostgreSQL. Tes ini bisa kamu pakai sebagai bukti pengujian di laporan.

Kalau ada tes yang gagal, salin pesan galatnya dan kirim ke aku.

## 9. Mengaktifkan diagnosis foto (CNN)

Fitur ini opsional dan baru jalan setelah model dilatih. Server tetap bisa dipakai tanpa ini; endpoint foto hanya menjawab 503 dengan pesan yang jelas.

1. Pasang PyTorch versi CPU:

   ```
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   ```

2. Siapkan dataset foto. Cari dataset **PlantVillage** di Kaggle, lalu letakkan per kelas dalam folder:

   ```
   ml/data/foto/
       Tomato___Late_blight/    (banyak foto .jpg)
       Tomato___healthy/
       Pepper__bell___Bacterial_spot/
       ...
   ```

   Nama folder menjadi nama kelas di hasil diagnosis. Mulailah dengan 5 sampai 10 kelas saja agar latihan cepat di laptop.
3. Latih:

   ```
   python -m ml.train_cnn --epoch 5 --maks-per-kelas 300
   ```

   Hasilnya `models_ai/model_cnn.pt` dan `models_ai/kelas_cnn.json`. Restart server.

Catatan penting: PlantVillage berisi tomat, paprika, dan kentang, **tidak ada cabai rawit, kangkung, dan sayur lain**. Untuk sayur yang tidak ada di dataset, akurasinya tidak terjamin. Cara memperbaikinya: kumpulkan foto sendiri dari kebun ibumu (misalnya 100 foto per kondisi), taruh dalam folder kelas yang sama, lalu latih ulang. Itu juga bahan bagus untuk bab pengujian.

## 10. Menghubungkan ke frontend

Di `.env`, isi `CORS_ORIGINS` dengan alamat frontend (mis. `http://localhost:5173`). Contoh pemakaian dengan JavaScript:

```js
const API = "http://127.0.0.1:8000";

// Login
async function login(email, password) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await r.json()).detail);
  const data = await r.json();           // { access_token, role, nama }
  localStorage.setItem("token", data.access_token);
  return data;
}

// Panggilan yang membutuhkan login
async function ambil(path, opsi = {}) {
  const r = await fetch(`${API}${path}`, {
    ...opsi,
    headers: { ...(opsi.headers || {}), Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return r.json();
}

const kebun = await ambil("/kebun");
const ringkasan = await ambil("/kebun/1/ringkasan");

// Unggah foto (jangan isi Content-Type, biarkan browser yang mengatur)
const form = new FormData();
form.append("file", inputFile.files[0]);
const hasil = await ambil("/kerusakan/foto", { method: "POST", body: form });
```

Penanganan galat yang perlu ada di frontend:
- Status **401**: token habis, arahkan ke halaman login.
- Status **403** dengan `detail.kode == "PREMIUM_DIPERLUKAN"`: tampilkan tawaran upgrade premium.
- Field `keyakinan == "kurang_yakin"`: tampilkan pesan `saran` dan jangan tampilkan hasilnya sebagai kepastian.

## 11. Peta use case ke endpoint (untuk SDD)

| Use case | Endpoint |
|---|---|
| Membuat akun petani | `POST /auth/register` |
| Login | `POST /auth/login` |
| Mengatur password | `POST /auth/ubah-password` |
| Menambahkan data kebun | `POST /kebun` |
| Melihat data kebun | `GET /kebun`, `GET /kebun/{id}`, `GET /kebun/{id}/ringkasan` |
| Mengubah data kebun | `PUT /kebun/{id}` |
| Menghapus data kebun | `DELETE /kebun/{id}` |
| Melihat prediksi waktu panen | `POST /kebun/{id}/prediksi`, `GET /kebun/{id}/prediksi` (riwayat) |
| Mengirimkan data cuaca (sistem cuaca eksternal) | otomatis di `app/services/cuaca.py` |
| Mengirimkan kerusakan tanaman (teks) | `POST /kerusakan/teks` |
| Mendiagnosis kerusakan (foto) + mengecek status premium | `POST /kerusakan/foto` |
| Melakukan upgrade premium | `POST /premium/upgrade`, `GET /premium/status` |
| Melihat riwayat | `GET /kerusakan/riwayat`, `GET /premium/riwayat` |
| Admin: melihat data petani | `GET /admin/petani` |
| Admin: menonaktifkan akun | `PATCH /admin/petani/{id}/status` |
| Admin: verifikasi premium | `GET /admin/pembayaran`, `POST /admin/pembayaran/{id}/setujui`, `POST /admin/pembayaran/{id}/tolak` |
| Admin: laporan sistem | `GET /admin/laporan` |

Sesuaikan nama baris dengan daftar use case di dokumenmu.

## 12. Cara kerja AI (untuk dokumen dan presentasi)

**Prediksi waktu panen (machine learning regresi).**
Algoritma: Random Forest Regressor. Input: jenis sayur, jenis tanah, suhu rata-rata, curah hujan rata-rata, kelembapan rata-rata. Output: perkiraan lama tanam sampai panen dalam hari. Cuaca diambil dari Open-Meteo berdasarkan koordinat kebun (rata-rata dari hari-hari yang sudah lewat sampai 16 hari ke depan). Rentang tanggal panen dihitung dari sebaran prediksi 200 pohon dalam model. Jika API cuaca gagal, sistem memakai rata-rata cuaca tropis dan memberi catatan kepada petani.

**Diagnosis teks (NLP).**
Teks gejala diubah menjadi vektor TF-IDF (kata dan potongan huruf, supaya tahan salah ketik), lalu diklasifikasikan oleh Logistic Regression ke 10 kelas kerusakan. Keluarannya kelas dan *confidence*. Di bawah `AMBANG_CONFIDENCE` (default 0,6) hasil ditandai "kurang yakin" dan petani diminta memberi detail lebih.

**Diagnosis foto (CNN).**
MobileNetV2 yang sudah terlatih pada ImageNet, lalu lapisan akhirnya dilatih ulang (transfer learning) pada foto penyakit tanaman. Keluarannya kelas dan *confidence*, dengan aturan ambang yang sama. Fitur ini hanya untuk pengguna premium.

**Catatan jujur soal data (tulis di bab keterbatasan).**
- Data latih prediksi panen **dibuat sintetis** dari aturan agronomi sederhana (lama panen dasar tiap sayur, penyesuaian suhu, hujan, dan tanah), karena belum ada data panen nyata. Angka R2 yang tinggi (0,99) hanya berarti model berhasil mempelajari aturan itu, **bukan** bukti akurat terhadap kebun sungguhan. Perbaikannya: catat tanggal tanam dan tanggal panen nyata dari kebun ibumu dan petani lain, tambahkan ke data latih (ubah `ml/train_panen.py` agar membaca file CSV), lalu latih ulang.
- Data latih NLP adalah 200 kalimat gejala yang ditulis tangan (20 per kelas). Akurasi sekitar 84% diukur pada 50 kalimat yang disisihkan dan tidak dipakai melatih. Makin banyak kalimat nyata dari petani yang ditambahkan ke `ml/data_gejala.py`, makin baik hasilnya.
- Hasil diagnosis adalah **saran awal**, bukan pengganti penyuluh pertanian.

## 13. Masalah yang sering muncul

| Gejala | Penyebab dan solusi |
|---|---|
| `password authentication failed` | Password di `DATABASE_URL` salah. |
| `database "sistani" does not exist` | Database belum dibuat (bagian 2). |
| `connection refused` ke port 5432 | Layanan PostgreSQL belum jalan. Buka *Services* di Windows, nyalakan `postgresql-x64-...`. |
| `No module named 'app'` | Terminal tidak berada di folder `sistani-backend`, atau perintah `python -m ...` dijalankan dari folder lain. |
| `No module named 'fastapi'` | `venv` belum aktif (tidak ada `(venv)`), atau `pip install -r requirements.txt` belum dijalankan. |
| Galat saat memasang `psycopg2-binary` | Pakai Python 3.11 atau 3.12. |
| Endpoint foto menjawab 503 | PyTorch belum terpasang atau model CNN belum dilatih (bagian 9). |
| Prediksi selalu bersumber `default` | Komputer tidak bisa mengakses internet atau Open-Meteo sedang gangguan. Cuaca cadangan dipakai otomatis. |
| Frontend kena galat CORS | Isi `CORS_ORIGINS` di `.env` dengan alamat frontend, lalu restart server. |

## 14. Menaruhnya di internet (opsional, setelah semuanya jalan di laptop)

Garis besarnya: sewa layanan hosting yang mendukung Python dan PostgreSQL, isi variabel `.env` sebagai *environment variables* di layanan itu, jalankan `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, ganti `SECRET_KEY` dan `ADMIN_PASSWORD` dengan yang kuat, dan isi `CORS_ORIGINS` hanya dengan alamat frontendmu. Pasang PyTorch hanya jika fitur foto dipakai, karena ukurannya besar.

## 15. Yang sengaja belum ada

- Migrasi database (Alembic). Tabel dibuat otomatis; jika kamu mengubah `models.py` setelah ada data, tabel lama tidak ikut berubah. Untuk tugas ini cukup hapus dan buat ulang database, atau pelajari Alembic belakangan.
- Verifikasi email dan lupa password lewat email.
- Pembayaran sungguhan. Sesuai catatan dosen, pembayaran disimulasikan dan diverifikasi admin.
