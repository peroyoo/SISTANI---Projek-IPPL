const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function parseTanggal(nilai) {
  if (!nilai) return null;
  // "2026-09-01" harus dibaca sebagai tanggal lokal, bukan UTC (supaya tidak mundur sehari)
  if (typeof nilai === "string" && /^\d{4}-\d{2}-\d{2}$/.test(nilai)) {
    const [y, m, d] = nilai.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = nilai instanceof Date ? nilai : new Date(nilai);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function tanggalPendek(nilai) {
  const d = parseTanggal(nilai);
  return d ? `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}` : "-";
}

export function tanggalPanjang(nilai = new Date()) {
  const d = parseTanggal(nilai);
  return d
    ? d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "-";
}

export function waktuLengkap(nilai) {
  const d = parseTanggal(nilai);
  if (!d) return "-";
  return `${tanggalPendek(d)}, ${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
}

export function rupiah(angka) {
  return "Rp" + Number(angka || 0).toLocaleString("id-ID");
}

export function persen(p) {
  return `${Math.round((p || 0) * 100)}%`;
}

export function sapaan(jam = new Date().getHours()) {
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

export function inisial(nama = "") {
  const bagian = nama.trim().split(/\s+/).filter(Boolean);
  if (!bagian.length) return "?";
  return (bagian[0][0] + (bagian.length > 1 ? bagian[bagian.length - 1][0] : "")).toUpperCase();
}

export function namaDepan(nama = "") {
  return nama.trim().split(/\s+/)[0] || "";
}

export function kodeKebun(id) {
  return `KBN-${String(id).padStart(3, "0")}`;
}

export function hariIniISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const STATUS_PANEN = {
  belum_waktunya: { label: "Belum waktunya", tone: "hijau" },
  siap_panen: { label: "Siap panen", tone: "kuning" },
  terlambat: { label: "Lewat estimasi", tone: "merah" },
};
