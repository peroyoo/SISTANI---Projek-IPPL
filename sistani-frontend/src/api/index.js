import { minta } from "./client.js";

// Seluruh endpoint mengikuti app/routers/*.py di backend.

export const auth = {
  daftar: (d) => minta("/auth/register", { method: "POST", body: d, auth: false }),
  masuk: (email, password) => minta("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  saya: () => minta("/auth/me"),
  ubahPassword: (password_lama, password_baru) =>
    minta("/auth/ubah-password", { method: "POST", body: { password_lama, password_baru } }),
  // Belum ada di backend (TUTORIAL.md bagian 15). Dipanggil supaya otomatis berfungsi saat endpoint ditambahkan.
  lupaPassword: (email) => minta("/auth/lupa-password", { method: "POST", body: { email }, auth: false }),
};

export const referensi = () => minta("/referensi", { auth: false });

export const kebun = {
  daftar: () => minta("/kebun"),
  detail: (id) => minta(`/kebun/${id}`),
  tambah: (d) => minta("/kebun", { method: "POST", body: d }),
  ubah: (id, d) => minta(`/kebun/${id}`, { method: "PUT", body: d }),
  hapus: (id) => minta(`/kebun/${id}`, { method: "DELETE" }),
  ringkasan: (id) => minta(`/kebun/${id}/ringkasan`),
  hitungPrediksi: (id) => minta(`/kebun/${id}/prediksi`, { method: "POST" }),
  riwayatPrediksi: (id) => minta(`/kebun/${id}/prediksi`),
};

export const kerusakan = {
  teks: (gejala, kebun_id) =>
    minta("/kerusakan/teks", { method: "POST", body: { gejala, kebun_id: kebun_id || null } }),
  foto: (file, kebun_id) => {
    const form = new FormData();
    form.append("file", file);
    if (kebun_id) form.append("kebun_id", String(kebun_id));
    return minta("/kerusakan/foto", { method: "POST", form });
  },
  riwayat: () => minta("/kerusakan/riwayat"),
  detail: (id) => minta(`/kerusakan/${id}`),
};

export const premium = {
  status: () => minta("/premium/status"),
  upgrade: (metode, nomor_referensi) => minta("/premium/upgrade", { method: "POST", body: { metode, nomor_referensi } }),
  riwayat: () => minta("/premium/riwayat"),
};

export const admin = {
  laporan: () => minta("/admin/laporan"),
  petani: (params) => minta("/admin/petani", { params }),
  ubahStatusPetani: (id, aktif) => minta(`/admin/petani/${id}/status`, { method: "PATCH", body: { aktif } }),
  pembayaran: (status) => minta("/admin/pembayaran", { params: { status } }),
  setujui: (id, catatan) => minta(`/admin/pembayaran/${id}/setujui`, { method: "POST", body: { catatan: catatan || null } }),
  tolak: (id, catatan) => minta(`/admin/pembayaran/${id}/tolak`, { method: "POST", body: { catatan: catatan || null } }),
};
