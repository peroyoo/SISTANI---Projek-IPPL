import { API_URL } from "../lib/config.js";

const KUNCI = "sistani.sesi";

// ---------- Penyimpanan sesi ----------
// "Ingat saya" dicentang -> localStorage (bertahan setelah browser ditutup); jika tidak -> sessionStorage.
export function simpanSesi(sesi, ingat = true) {
  hapusSesi();
  try {
    (ingat ? localStorage : sessionStorage).setItem(KUNCI, JSON.stringify(sesi));
  } catch {
    /* penyimpanan browser tidak tersedia */
  }
}

export function ambilSesi() {
  try {
    const mentah = localStorage.getItem(KUNCI) ?? sessionStorage.getItem(KUNCI);
    return mentah ? JSON.parse(mentah) : null;
  } catch {
    return null;
  }
}

export function hapusSesi() {
  try {
    localStorage.removeItem(KUNCI);
    sessionStorage.removeItem(KUNCI);
  } catch {
    /* penyimpanan browser tidak tersedia */
  }
}

// ---------- Galat ----------
export class ApiError extends Error {
  constructor(status, pesan, { kode = null, fields = {} } = {}) {
    super(pesan);
    this.status = status;
    this.kode = kode;
    this.fields = fields; // { nama_field: "pesan" } dari validasi 422
  }
}

// FastAPI mengirim `detail` dalam tiga bentuk: teks, objek {kode, pesan}, atau daftar galat validasi (422).
function bacaGalat(status, body) {
  const d = body?.detail;
  if (typeof d === "string") return new ApiError(status, d);
  if (Array.isArray(d)) {
    const fields = {};
    const pesan = [];
    for (const item of d) {
      const teks = String(item.msg || "Data tidak valid").replace(/^Value error, /, "");
      const nama = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : null;
      if (typeof nama === "string" && !(nama in fields)) fields[nama] = teks;
      pesan.push(teks);
    }
    return new ApiError(status, pesan.join(" "), { fields });
  }
  if (d && typeof d === "object") return new ApiError(status, d.pesan || "Terjadi kesalahan.", { kode: d.kode || null });
  return new ApiError(status, `Permintaan gagal (kode ${status}).`);
}

let kalauTidakSah = null; // dipasang oleh AuthContext
export function pasangPenangani401(fn) {
  kalauTidakSah = fn;
}

// ---------- Permintaan ----------
export async function minta(path, { method = "GET", body, form, auth = true, params } = {}) {
  const headers = {};
  let isi;
  if (form) {
    isi = form; // FormData: biarkan browser mengisi Content-Type + boundary
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    isi = JSON.stringify(body);
  }
  if (auth) {
    const sesi = ambilSesi();
    if (sesi?.token) headers.Authorization = `Bearer ${sesi.token}`;
  }

  let url = API_URL + path;
  if (params) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") q.set(k, v);
    const s = q.toString();
    if (s) url += (url.includes("?") ? "&" : "?") + s;
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: isi });
  } catch {
    throw new ApiError(0, "Tidak dapat terhubung ke server. Periksa koneksi internet atau pastikan backend sudah berjalan.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respons tanpa isi */
  }

  if (!res.ok) {
    const galat = bacaGalat(res.status, data);
    if (res.status === 401 && auth && kalauTidakSah) kalauTidakSah(galat);
    throw galat;
  }
  return data;
}
