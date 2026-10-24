# SISTANI

SISTANI adalah aplikasi berbasis web dengan:

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **Database:** PostgreSQL
- **Containerization:** Docker

## Fitur

1. **Masuk / Buat Akun**
   - `POST /auth/login`
   - `POST /auth/register`
   - Sesi login dan token

2. **Beranda**
   - Ringkasan kebun
   - Umur tanaman
   - Sisa hari panen
   - Rentang panen
   - Status tanaman
   - Cuaca hari ini
   - Prediksi panen

3. **Data Kebun**
   - Tambah kebun
   - Ubah kebun
   - Hapus kebun
   - Cari kebun
   - Referensi tanaman dan tanah

4. **Laporan Kerusakan**
   - Diagnosis berdasarkan teks
   - Penanganan
   - Riwayat diagnosis

## Struktur Project

```text
SISTANI/
├── app/
├── ml/
├── models_ai/
├── tests/
├── uploads/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── requirements.txt
└── TUTORIAL.md
```

Frontend React berada pada project frontend yang digunakan oleh Docker Compose.

---

# Menjalankan SISTANI dengan Docker

## Persyaratan

Pastikan sudah menginstall:

- Docker Desktop
- Git (jika project diperoleh melalui Git)

Pastikan Docker Desktop dalam keadaan **Running**.

Tidak perlu menjalankan Python, PostgreSQL, atau Node.js secara manual.

---

## 1. Masuk ke Folder Backend

Buka PowerShell dan masuk ke folder yang berisi `docker-compose.yml`.

Contoh:

```powershell
cd "C:\Users\ASUS\Documents\IPPL BACKEND FRONTEND\FINAL\sistani-backend"
```

Cek isi folder:

```powershell
Get-ChildItem
```

Pastikan terdapat:

```text
Dockerfile
docker-compose.yml
requirements.txt
```

---

## 2. Menjalankan SISTANI

### Pertama kali atau setelah ada perubahan kode

Gunakan:

```powershell
docker compose up -d --build
```

Docker akan menjalankan:

```text
Frontend
    ↓
Backend FastAPI
    ↓
PostgreSQL
```

Build pertama kali dapat membutuhkan beberapa menit.

### Jika tidak ada perubahan kode

Cukup:

```powershell
docker compose up -d
```

---

## 3. Mengecek Container

Jalankan:

```powershell
docker compose ps
```

Pastikan service memiliki status:

```text
Up
```

Contohnya:

```text
sistani-api        Up
sistani-db        Up
sistani-frontend   Up
```

Jika semuanya `Up`, SISTANI sudah berjalan.

---

## 4. Membuka Aplikasi

### Frontend

Buka:

```text
http://localhost:3000
```

### Backend Swagger

Untuk menguji API:

```text
http://localhost:8000/docs
```

---

# Perubahan Kode

Pada setup Docker saat ini, perubahan kode tidak langsung masuk ke container.

Jika melakukan perubahan pada frontend atau backend, jalankan:

```powershell
docker compose up -d --build
```

Kemudian refresh:

```text
http://localhost:3000
```

---

# Melihat Log Backend

Untuk melihat log backend:

```powershell
docker compose logs -f api
```

Tekan:

```text
Ctrl + C
```

untuk berhenti melihat log.

Perintah tersebut tidak menghentikan container.

---

# Melihat Semua Log

```powershell
docker compose logs -f
```

---

# Menghentikan SISTANI

Untuk menghentikan aplikasi:

```powershell
docker compose down
```

Perintah ini tidak menghapus volume database.

## ⚠️ Menghapus Database

Jangan gunakan perintah berikut kecuali memang ingin menghapus database:

```powershell
docker compose down -v
```

Opsi `-v` akan menghapus volume database Docker sehingga data database dapat hilang.

---

# Perintah Docker Penting

| Tujuan | Perintah |
|---|---|
| Pertama kali / setelah perubahan kode | `docker compose up -d --build` |
| Menjalankan tanpa build | `docker compose up -d` |
| Mengecek container | `docker compose ps` |
| Melihat log backend | `docker compose logs -f api` |
| Melihat semua log | `docker compose logs -f` |
| Menghentikan aplikasi | `docker compose down` |
| Menghapus database | `docker compose down -v` ⚠️ |

---

# Alur Singkat

```text
Buka Docker Desktop
        ↓
Pastikan Docker Running
        ↓
Buka PowerShell
        ↓
Masuk ke folder sistani-backend
        ↓
docker compose up -d --build
        ↓
docker compose ps
        ↓
Pastikan semua container "Up"
        ↓
Buka http://localhost:3000
        ↓
SISTANI siap digunakan
```

---

# Menjalankan di Komputer Lain

1. Clone repository SISTANI.
2. Install Docker Desktop.
3. Buka Docker Desktop.
4. Masuk ke folder yang berisi `docker-compose.yml`.
5. Jalankan:

```powershell
docker compose up -d --build
```

6. Cek:

```powershell
docker compose ps
```

7. Buka:

```text
http://localhost:3000
```

Dengan Docker, pengguna tidak perlu menjalankan:

```powershell
uvicorn app.main:app --reload
```

atau:

```powershell
npm run dev
```

secara manual.