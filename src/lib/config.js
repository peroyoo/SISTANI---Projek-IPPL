const env = (import.meta.env) || {};

export const API_URL = (env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
export const HARGA_PREMIUM_LANDING = Number(env.VITE_HARGA_PREMIUM || 9000);

// Batas yang sama dengan backend (routers/kerusakan.py)
export const MAKS_FOTO_MB = 5;
export const FORMAT_FOTO = ["image/jpeg", "image/png", "image/webp"];
// Desain meminta minimal 30 karakter untuk deskripsi (backend menerima mulai 10)
export const MIN_GEJALA = 30;
export const MAKS_GEJALA = 1000;
