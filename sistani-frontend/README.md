# SISTANI Frontend

React + Vite, terhubung ke backend `sistani-backend` (FastAPI).

## Fitur (4)
1. **Masuk / Buat akun** — `POST /auth/login`, `POST /auth/register` ("Ingat saya", sesi bertahan, otomatis keluar saat token habis)
2. **Beranda** — ringkasan tiap kebun: umur, sisa hari panen, rentang panen, status, cuaca hari ini (`GET /kebun/{id}/ringkasan`), simpan prediksi (`POST /kebun/{id}/prediksi`)
3. **Data Kebun** — tambah, ubah, hapus, cari (`/kebun`, `/referensi`)
4. **Laporan Kerusakan (teks)** — diagnosis NLP + penanganan + riwayat (`POST /kerusakan/teks`, `GET /kerusakan/riwayat`)

Belum ada: landing page, Premium, diagnosis foto, riwayat tanam/panen, dashboard admin.
Akun admin yang masuk hanya melihat pesan (gunakan `/docs` backend).

## Menjalankan
```
# 1) Backend (lihat TUTORIAL.md backend), di .env backend isi:
#    CORS_ORIGINS=http://localhost:5173
uvicorn app.main:app --reload

# 2) Frontend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```
Ubah `VITE_API_URL` di `.env` bila backend tidak di `http://127.0.0.1:8000`.

## Struktur
- `src/api/` — klien HTTP + daftar endpoint (satu tempat untuk mengubah alamat/endpoint)
- `src/context/Auth.jsx` — sesi login
- `src/pages/` — Masuk, Beranda, Kebun, Kerusakan
- `src/styles.css` — warna & gaya dari desain Figma
