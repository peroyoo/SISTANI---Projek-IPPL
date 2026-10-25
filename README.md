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

Struktur project SISTANI saat ini:

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
└── sistani-frontendd/
    └── sistani-frontend/
        ├── src/
        ├── public/
        ├── Dockerfile
        ├── package.json
        ├── package-lock.json
        ├── index.html
        └── ...
```

> **Catatan:** Frontend yang digunakan adalah folder `sistani-frontendd/sistani-frontend/`.

Folder `sistani-frontend/` yang lama sudah tidak digunakan.

File `docker-compose.yml` berada di **folder utama `FINAL/`**.

---

## 3. Isi Utama Frontend

Frontend SISTANI menggunakan React + Vite.

Beberapa bagian utama frontend:

```text
sistani-frontendd/
└── sistani-frontend/
    ├── public/
    │   ├── favicon.png
    │   ├── hero.jpg
    │   ├── logo.png
    │   └── tanam.jpg
    │
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── lib/
        ├── pages/
        ├── App.jsx
        ├── main.jsx
        └── styles.css
```

Halaman utama yang tersedia antara lain:

- Landing Page
- Masuk
- Daftar
- Lupa Password
- Beranda
- Kebun
- Deteksi
- Kerusakan
- Riwayat
- Premium
- Akun
- Admin

Halaman **Masuk** dan **Daftar** sudah dipisahkan menjadi halaman yang berbeda.

---

## 4. Masuk ke Folder Project

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
sistani-frontendd
```

---

## 5. Menjalankan SISTANI untuk Pertama Kali

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

## 6. Mengecek Container

Setelah proses selesai, jalankan:

```powershell
docker compose ps
```

Pastikan container memiliki status:

```text
Up
```

Container SISTANI yang digunakan:

```text
sistani-db
sistani-api
sistani-frontend
```

Contohnya:

```text
NAME                 STATUS
sistani-db           Up
sistani-api          Up
sistani-frontend     Up
```

Jika ketiga container tersebut memiliki status `Up`, SISTANI sudah berhasil dijalankan.

---

## 7. Membuka SISTANI

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

## 8. Database PostgreSQL

PostgreSQL dijalankan melalui Docker menggunakan container:

```text
sistani-db
```

Database yang digunakan:

```text
Database : sistani
User     : postgres
Password : postgres
```

Port PostgreSQL pada komputer:

```text
5433
```

Sedangkan komunikasi antara backend dan database di dalam Docker menggunakan:

```text
db:5432
```

Konfigurasi tersebut sudah diatur pada `docker-compose.yml`.

---

## 9. Menjalankan SISTANI Setelah Komputer Dimatikan

Jika SISTANI sudah pernah di-build dan tidak ada perubahan kode, cukup jalankan:

```powershell
docker compose up -d
```

Tidak perlu menggunakan `--build` setiap kali.

---

## 10. Jika Ada Perubahan Kode

Pada setup Docker saat ini, kode frontend dan backend dimasukkan ke dalam image ketika proses build.

Jika melakukan perubahan pada frontend atau backend, jalankan:

```powershell
docker compose up -d --build
```

Kemudian refresh browser:

```text
http://localhost:3000
```

Contoh perubahan pada frontend:

```text
sistani-frontendd/sistani-frontend/src/
```

Contoh perubahan pada backend:

```text
sistani-backend/app/
```

Setelah melakukan perubahan, jalankan kembali:

```powershell
docker compose up -d --build
```

---

## 11. Melihat Log Backend

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

## 12. Melihat Semua Log

Untuk melihat log seluruh service:

```powershell
docker compose logs
```

Untuk mengikuti log secara realtime:

```powershell
docker compose logs -f
```

---

## 13. Menghentikan SISTANI

Untuk menghentikan semua container:

```powershell
docker compose down
```

Perintah ini menghentikan dan menghapus container, tetapi **volume database tetap dipertahankan**.

Data PostgreSQL tidak ikut dihapus.

---

## 14. Jangan Menggunakan `-v` Sembarangan

Hindari menjalankan:

```powershell
docker compose down -v
```

karena opsi `-v` akan menghapus volume database Docker.

Akibatnya, data database SISTANI dapat ikut terhapus.

Gunakan `-v` hanya jika memang ingin menghapus database dan memulai project dari kondisi awal.

---

## 15. Harga Premium

Fitur Premium SISTANI menggunakan harga:

```text
Rp9.000
```

Nilai harga Premium dikonfigurasi melalui backend.

Pada konfigurasi backend:

```text
HARGA_PREMIUM=9000
```

---

## 16. Fitur Utama SISTANI

SISTANI menyediakan beberapa fitur utama:

### Autentikasi

- Registrasi akun
- Login
- Logout
- Lupa password
- Pengelolaan sesi pengguna

### Pengelolaan Kebun

Pengguna dapat:

- Menambahkan kebun
- Melihat data kebun
- Mengelola informasi tanaman
- Menentukan jenis tanah
- Menyimpan lokasi kebun

### Informasi Cuaca

SISTANI menggunakan informasi cuaca untuk mendukung fitur pertanian dan prediksi.

### Prediksi Panen

SISTANI menyediakan perkiraan waktu panen berdasarkan informasi kebun, tanaman, kondisi lingkungan, dan data pendukung lainnya.

### Diagnosis Kerusakan Tanaman

SISTANI menyediakan diagnosis melalui:

- Diagnosis berdasarkan teks
- Diagnosis berdasarkan foto

Fitur diagnosis foto menggunakan model CNN apabila model sudah tersedia.

### Riwayat

Pengguna dapat melihat riwayat aktivitas dan hasil diagnosis yang telah dilakukan.

### Premium

Fitur Premium menyediakan akses terhadap fitur tertentu yang membutuhkan status Premium.

### Admin

Admin dapat mengelola proses administrasi tertentu, termasuk persetujuan Premium.

---

## 17. Perintah Penting

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

## 18. Alur Singkat

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

## 19. Untuk Teman yang Menjalankan Project

Jika project dibagikan atau di-clone ke komputer lain:

### 1. Install Docker Desktop

Pastikan Docker Desktop sudah terinstall dan sedang Running.

### 2. Clone atau salin project SISTANI

Setelah project tersedia di komputer, buka PowerShell.

### 3. Masuk ke folder utama project

```powershell
cd "lokasi\FINAL"
```

### 4. Pastikan struktur project

Pastikan terdapat:

```text
README.md
docker-compose.yml
sistani-backend/
sistani-frontendd/
    └── sistani-frontend/
```

### 5. Jalankan SISTANI

```powershell
docker compose up -d --build
```

### 6. Cek container

```powershell
docker compose ps
```

Pastikan:

```text
sistani-db
sistani-api
sistani-frontend
```

memiliki status:

```text
Up
```

### 7. Buka aplikasi

```text
http://localhost:3000
```

### 8. Akses Swagger

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

---

## 20. Catatan

Jika terjadi masalah saat menjalankan SISTANI, periksa terlebih dahulu:

```powershell
docker compose ps
```

Kemudian lihat log:

```powershell
docker compose logs
```

Jika melakukan perubahan pada kode, jalankan kembali:

```powershell
docker compose up -d --build
```

Pastikan Docker Desktop tetap dalam keadaan Running selama SISTANI digunakan.