# SISTANI — Menjalankan dengan Docker

SISTANI terdiri dari:

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **Database:** PostgreSQL
- **Container:** Docker

Dengan Docker, frontend, backend, dan database dapat dijalankan sekaligus tanpa perlu menjalankan Python, PostgreSQL, atau Node.js secara manual.

---

## 1. Persyaratan

Sebelum menjalankan SISTANI, pastikan sudah terinstall:

- Docker Desktop
- Git (jika project diperoleh melalui clone repository)

Pastikan **Docker Desktop sudah dalam keadaan Running**.

---

## 2. Struktur Project

Pastikan struktur folder seperti berikut:

```text
FINAL/
├── sistani-backend/
│   ├── app/
│   ├── ml/
│   ├── models_ai/
│   ├── tests/
│   ├── uploads/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── ...
│
└── sistani-frontend/
    ├── src/
    ├── public/
    ├── Dockerfile
    ├── package.json
    └── ...
```

File `docker-compose.yml` berada di dalam folder:

```text
sistani-backend/
```

---

## 3. Masuk ke Folder Backend

Buka **PowerShell**, kemudian jalankan:

```powershell
cd "C:\Users\ASUS\Documents\IPPL BACKEND FRONTEND\FINAL\sistani-backend"
```

> Jika lokasi project berbeda, sesuaikan alamat folder dengan lokasi project di komputer masing-masing.

Pastikan sudah berada di folder yang benar:

```powershell
Get-ChildItem
```

Pastikan terdapat file:

```text
Dockerfile
docker-compose.yml
requirements.txt
```

---

## 4. Menjalankan SISTANI untuk Pertama Kali

Jika baru pertama kali menjalankan project atau terdapat perubahan kode, gunakan:

```powershell
docker compose up -d --build
```

Perintah tersebut akan:

1. Membuild image backend.
2. Membuild image frontend.
3. Menjalankan PostgreSQL.
4. Menjalankan FastAPI.
5. Menjalankan frontend React.
6. Menghubungkan frontend, backend, dan database.

Build pertama kali dapat membutuhkan waktu beberapa menit.

---

## 5. Mengecek Container

Setelah proses selesai, jalankan:

```powershell
docker compose ps
```

Pastikan container memiliki status:

```text
Up
```

Contohnya:

```text
NAME               STATUS
sistani-api        Up
sistani-db         Up
sistani-frontend   Up
```

Jika ketiganya `Up`, SISTANI sudah berhasil dijalankan.

---

## 6. Membuka SISTANI

### Frontend

Buka browser:

```text
http://localhost:3000
```

### Backend Swagger

Untuk melihat dan menguji API:

```text
http://localhost:8000/docs
```

Frontend digunakan untuk menjalankan aplikasi SISTANI.

Swagger digunakan untuk pengujian endpoint backend.

---

## 7. Menjalankan SISTANI Setelah Komputer Dimatikan

Jika sebelumnya SISTANI sudah pernah di-build dan tidak ada perubahan kode, cukup jalankan:

```powershell
docker compose up -d
```

Tidak perlu menggunakan `--build` setiap kali.

---

## 8. Jika Ada Perubahan Kode

Jika melakukan perubahan pada frontend atau backend, Docker tidak otomatis menggunakan kode terbaru pada setup ini.

Setelah selesai mengubah kode, jalankan:

```powershell
docker compose up -d --build
```

Kemudian refresh browser:

```text
http://localhost:3000
```

### Contoh

Jika mengubah:

```text
sistani-frontend/src/
```

atau:

```text
sistani-backend/app/
```

jalankan:

```powershell
docker compose up -d --build
```

---

## 9. Melihat Log Backend

Jika ingin melihat apakah backend berjalan dengan baik:

```powershell
docker compose logs -f api
```

Tekan:

```text
Ctrl + C
```

untuk berhenti melihat log.

> `Ctrl + C` pada perintah tersebut hanya menghentikan tampilan log dan tidak menghentikan container.

---

## 10. Melihat Semua Log

Untuk melihat log seluruh service:

```powershell
docker compose logs
```

Untuk mengikuti log secara realtime:

```powershell
docker compose logs -f
```

---

## 11. Menghentikan SISTANI

Untuk menghentikan semua container:

```powershell
docker compose down
```

Perintah ini menghentikan dan menghapus container, tetapi volume database tetap dipertahankan.

---

## 12. Jangan Gunakan `-v` Sembarangan

Hindari:

```powershell
docker compose down -v
```

karena `-v` akan menghapus volume database Docker.

Akibatnya, data database SISTANI dapat ikut terhapus.

Gunakan `-v` hanya jika memang ingin menghapus database dan memulai dari awal.

---

## 13. Perintah Penting

| Kebutuhan | Perintah |
|---|---|
| Pertama kali / setelah ubah kode | `docker compose up -d --build` |
| Menjalankan tanpa build | `docker compose up -d` |
| Mengecek container | `docker compose ps` |
| Melihat log backend | `docker compose logs -f api` |
| Melihat semua log | `docker compose logs -f` |
| Menghentikan SISTANI | `docker compose down` |
| Menghapus container + database | `docker compose down -v` ⚠️ |

---

## 14. Alur Singkat

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

## 15. Untuk Teman yang Menjalankan Project

Jika project dibagikan kepada komputer lain:

1. Install Docker Desktop.
2. Clone atau salin project SISTANI.
3. Masuk ke folder `sistani-backend`.
4. Pastikan terdapat `docker-compose.yml`.
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

Tidak perlu menjalankan:

```powershell
uvicorn app.main:app --reload
```

atau:

```powershell
npm run dev
```

karena frontend dan backend sudah dijalankan melalui Docker.