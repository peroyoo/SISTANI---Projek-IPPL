# SISTANI Frontend

React + Vite, tampilan mengikuti desain Figma, seluruh data dari backend `sistani-backend` (FastAPI). Tidak ada data contoh di dalam kode.

## Halaman

| Alamat | Untuk | Isi | Endpoint |
|---|---|---|---|
| `#/` | Umum | Landing page | - |
| `#/masuk` | Umum | Buat akun dan masuk (admin juga masuk di sini) | `/auth/register`, `/auth/login` |
| `#/lupa` | Umum | Lupa kata sandi | `/auth/lupa-password` (belum ada di backend) |
| `#/beranda` | Petani | Ringkasan kebun, cuaca hari ini, hitung mundur panen | `/kebun`, `/kebun/{id}/ringkasan`, `/kebun/{id}/prediksi` |
| `#/kebun` | Petani | Tambah, ubah, hapus, cari kebun | `/kebun`, `/referensi` |
| `#/riwayat` | Petani | Riwayat tanam dan perkiraan panen per kebun | `/kebun`, `/kebun/{id}/prediksi` |
| `#/kerusakan` | Petani | Laporan kerusakan lewat teks (gratis) + riwayat | `/kerusakan/teks`, `/kerusakan/riwayat` |
| `#/deteksi` | Petani Premium | Deteksi penyakit dari foto | `/kerusakan/foto` |
| `#/premium` | Petani | Status paket, upgrade, riwayat pembayaran | `/premium/*` |
| `#/akun` | Semua | Profil, ubah kata sandi, keluar | `/auth/me`, `/auth/ubah-password` |
| `#/admin`, `#/admin/petani`, `#/admin/pembayaran` | Admin | Laporan sistem, kelola petani, verifikasi premium | `/admin/*` |

## Menjalankan

```
# 1) Backend: di .env backend isi
#    CORS_ORIGINS=http://localhost:5173
#    HARGA_PREMIUM=9000        (samakan dengan harga di desain)
uvicorn app.main:app --reload

# 2) Frontend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

`VITE_API_URL` di `.env` diubah bila backend tidak di `http://127.0.0.1:8000`.
`VITE_HARGA_PREMIUM` hanya untuk tulisan harga di landing page. Harga di halaman Premium diambil dari backend.

## Struktur

- `src/api/` klien HTTP dan daftar endpoint
- `src/context/Auth.jsx` sesi login dan status Premium
- `src/components/ui.jsx` kerangka portal (menu samping di laptop, menu bawah di HP), ikon, footer, dialog, toast
- `src/components/Diagnosis.jsx` tampilan hasil diagnosis (teks dan foto)
- `src/pages/` satu berkas per halaman
- `src/styles.css` warna dan gaya dari desain Figma (warna di `:root`)

## Bagian desain yang tidak dibuat, dan alasannya

Bagian ini ada di Figma tetapi belum didukung backend atau di luar use case. Kodenya sengaja tidak menampilkan data palsu sebagai gantinya.

- Luas lahan dan hasil panen (ton): backend belum menyimpan keduanya. Kartu kebun menampilkan jenis tanah, Riwayat menampilkan perkiraan panen terakhir.
- Nomor WhatsApp dan kabupaten saat daftar, ikon lonceng notifikasi, simpan draf laporan, ekspor PDF, akses pasar dan belajar.
- Unggah bukti transfer: backend hanya menerima metode dan nomor referensi pembayaran.
- Reset kata sandi lewat email: halaman sudah ada dan memanggil `POST /auth/lupa-password`. Selama endpoint itu belum dibuat di backend, halaman menampilkan pesan bahwa fitur belum aktif.
- Prakiraan cuaca 5 hari: backend baru mengirim cuaca hari ini.
