# SISTANI — Menjalankan dengan Docker

SISTANI merupakan sistem yang terdiri dari:

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **Database:** PostgreSQL
- **Container:** Docker

Dengan Docker, frontend, backend, dan database dapat dijalankan secara bersamaan tanpa perlu menjalankan Python, PostgreSQL, atau Node.js secara manual.

---

## 1. Persyaratan

Sebelum menjalankan SISTANI, pastikan sudah terinstall:

- Docker Desktop
- Git (jika project diperoleh melalui clone repository)

Pastikan **Docker Desktop sudah dalam keadaan Running**.

---

## 2. Struktur Project

Struktur project SISTANI:

```text
FINAL/
├── README.md
├── docker-compose.yml
│
├── sistani-backend/
│   ├── app/
│   ├── ml/
│   ├── models_ai/
│   ├── tests/
│   ├── uploads/
│   ├── Dockerfile
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

File `docker-compose.yml` berada di **folder utama `FINAL/`**.

---

## 3. Masuk ke Folder Project

Buka **PowerShell**, kemudian masuk ke folder utama project:

```powershell
cd "C:\Users\ASUS\Documents\IPPL BACKEND FRONTEND\FINAL"
```

> Jika lokasi project berbeda, sesuaikan alamat folder dengan lokasi project di komputer masing-masing.

Pastikan berada di folder yang benar:

```powershell
Get-ChildItem
```

Pastikan terdapat:

```text
README.md
docker-compose.yml
sistani-backend
sistani-frontend
```

---

## 4. Menjalankan SISTANI untuk Pertama Kali

Jika baru pertama kali menjalankan project atau terdapat perubahan kode, gunakan:

```powershell
docker compose up -d --build
```

Perintah tersebut akan:

1. Membuat image backend.
2. Membuat image frontend.
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
NAME                 STATUS
sistani-api          Up
sistani-db           Up
sistani-frontend     Up
```

Jika ketiga container tersebut memiliki status `Up`, SISTANI sudah berhasil dijalankan.

---

## 6. Membuka SISTANI

### Frontend

Buka browser:

```text
http://localhost:3000
```

Frontend digunakan untuk menjalankan aplikasi SISTANI.

### Backend Swagger

Untuk melihat dan menguji endpoint API:

```text
http://localhost:8000/docs
```

Swagger digunakan untuk pengujian endpoint backend.

---

## 7. Menjalankan SISTANI Setelah Komputer Dimatikan

Jika SISTANI sudah pernah di-build dan tidak ada perubahan kode, cukup jalankan:

```powershell
docker compose up -d
```

Tidak perlu menggunakan `--build` setiap kali.

---

## 8. Jika Ada Perubahan Kode

Pada setup Docker saat ini, kode frontend dan backend dimasukkan ke dalam image ketika proses build.

Jika melakukan perubahan pada frontend atau backend, jalankan:

```powershell
docker compose up -d --build
```

Kemudian refresh browser:

```text
http://localhost:3000
```

Contoh perubahan:

```text
sistani-frontend/src/
```

atau:

```text
sistani-backend/app/
```

Setelah melakukan perubahan, jalankan kembali:

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

Perintah ini menghentikan dan menghapus container, tetapi **volume database tetap dipertahankan**.

Data PostgreSQL tidak ikut dihapus.

---

## 12. Jangan Menggunakan `-v` Sembarangan

Hindari menjalankan:

```powershell
docker compose down -v
```

karena opsi `-v` akan menghapus volume database Docker.

Akibatnya, data database SISTANI dapat ikut terhapus.

Gunakan `-v` hanya jika memang ingin menghapus database dan memulai project dari kondisi awal.

---

## 13. Perintah Penting

| Kebutuhan | Perintah |
|---|---|
| Pertama kali / setelah mengubah kode | `docker compose up -d --build` |
| Menjalankan tanpa build | `docker compose up -d` |
| Mengecek container | `docker compose ps` |
| Melihat log backend | `docker compose logs -f api` |
| Melihat semua log | `docker compose logs -f` |
| Menghentikan SISTANI | `docker compose down` |
| Menghapus container + volume database | `docker compose down -v` ⚠️ |

---

## 14. Alur Singkat

```text
Buka Docker Desktop
        ↓
Pastikan Docker Running
        ↓
Buka PowerShell
        ↓
Masuk ke folder FINAL
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

Jika project dibagikan atau di-clone ke komputer lain:

1. Install Docker Desktop.
2. Clone atau salin project SISTANI.
3. Buka PowerShell.
4. Masuk ke folder utama project:

```powershell
cd "lokasi\FINAL"
```

5. Pastikan terdapat:

```text
README.md
docker-compose.yml
sistani-backend/
sistani-frontend/
```

6. Jalankan:

```powershell
docker compose up -d --build
```

7. Cek container:

```powershell
docker compose ps
```

8. Pastikan container memiliki status `Up`.

9. Buka aplikasi:

```text
http://localhost:3000
```

10. Untuk mengakses Swagger:

```text
http://localhost:8000/docs
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