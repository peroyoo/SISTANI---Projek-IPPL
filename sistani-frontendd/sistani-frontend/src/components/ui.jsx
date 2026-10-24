import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/Auth.jsx";
import { inisial } from "../lib/format.js";

export const go = (path) => {
  window.location.hash = path;
};

// ---------- Ikon (garis) ----------
const IKON = {
    beranda: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
    peta: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20Z"/><path d="M9 4v13.5M15 6.5V20"/>',
    riwayat: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M12 7.5V12l3 2"/>',
    laporan: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H16v18H6.5A1.5 1.5 0 0 1 5 19.5Z"/><path d="M9 8h3M9 12h3"/><path d="m19 6 1.800 1.800L15.500 13l-2.700.9.9-2.700Z"/>',
    gandum: '<path d="M12 22V10"/><path d="M12 10c-2.500 0-4-1.600-4-4.500 2.500 0 4 1.600 4 4.500Zm0 0c2.500 0 4-1.600 4-4.500-2.500 0-4 1.600-4 4.500Z"/><path d="M12 16c-2.500 0-4-1.600-4-4.500 2.500 0 4 1.600 4 4.500Zm0 0c2.500 0 4-1.600 4-4.500-2.500 0-4 1.600-4 4.500Z"/><path d="M12 4V2"/>',
    lonceng: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.500 2 6.500H4S6 14 6 9Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    pin: '<path d="M12 21s7-6.200 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21Z"/><circle cx="12" cy="9.500" r="2.500"/>',
    centang: '<circle cx="12" cy="12" r="9"/><path d="m8 12.500 2.800 2.800L16 9.500"/>',
    seru: '<circle cx="12" cy="12" r="9"/><path d="M12 7.500v5M12 16.500h.01"/>',
    segitiga: '<path d="M12 4 2.800 19.500h18.400Z"/><path d="M12 10v4.500M12 17.500h.01"/>',
    kanan: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    kiri: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    miring: '<path d="M7 17 17 7M8 7h9v9"/>',
    unggah: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3.500h16V16"/>',
    cari: '<circle cx="11" cy="11" r="6.500"/><path d="m20 20-4.200-4.200"/>',
    pensil: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.500 6.500 4 4"/>',
    sampah: '<path d="M4 7h16M9 7V4.500h6V7M6.500 7l1 13h9l1-13M10 11v6M14 11v6"/>',
    perisai: '<path d="M12 3 5 6v5.500c0 4.500 3 7.800 7 9.500 4-1.700 7-5 7-9.500V6Z"/><path d="m9 12 2.200 2.200L15.500 10"/>',
    gambar: '<rect x="3.500" y="4.500" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.500"/><path d="m4 18 5-5 3.500 3.500L15.500 14 20 18.500"/>',
    tunas: '<path d="M12 21v-8"/><path d="M12 13c0-3.500-2.500-5.500-6-5.500 0 3.500 2.500 5.500 6 5.500Z"/><path d="M12 11c0-3 2.200-5 5.500-5 0 3-2 5-5.500 5Z"/>',
    awan: '<path d="M8 19h9a4 4 0 0 0 .5-8 5.500 5.500 0 0 0-10.500 1.500A3.300 3.300 0 0 0 8 19Z"/>',
    tetes: '<path d="M12 3.500s6 6 6 10.500a6 6 0 0 1-12 0C6 9.500 12 3.500 12 3.500Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.500h.01"/>',
    user: '<circle cx="12" cy="8" r="3.800"/><path d="M4.500 20c.8-3.600 3.600-5.500 7.500-5.500s6.700 1.900 7.500 5.500"/>',
    surel: '<rect x="3" y="5.500" width="18" height="13" rx="2"/><path d="m3.500 7 8.500 6 8.500-6"/>',
    kunci: '<rect x="5" y="10.500" width="14" height="9.500" rx="2"/><path d="M8 10.500V8a4 4 0 0 1 8 0v2.500"/>',
    mata: '<path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12Z"/><circle cx="12" cy="12" r="3"/>',
    mataCoret: '<path d="M3 3l18 18"/><path d="M10.500 6a9 9 0 0 1 1.500-.5c6 0 9.500 6.500 9.500 6.500a15 15 0 0 1-3 3.800M6.500 7.500A15 15 0 0 0 2.500 12S6 18.500 12 18.500a9 9 0 0 0 4-1"/><path d="M9.800 9.800a3 3 0 0 0 4.400 4.400"/>',
    grafik: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    petani: '<circle cx="9" cy="8.500" r="3.300"/><path d="M2.800 19.500c.6-3.200 3-4.900 6.200-4.900s5.600 1.700 6.200 4.900"/><path d="M16 5.500a3.200 3.200 0 0 1 0 6M18 14.800c2 .6 3.200 2.200 3.500 4.700"/>',
    kartuBayar: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10.500h18M7 15h3"/>',
    instagram: '<rect x="3.500" y="3.500" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
    facebook: '<path d="M14 21v-8h2.800l.5-3.400H14V7.500c0-1 .4-1.700 1.800-1.700h1.600V3a19 19 0 0 0-2.400-.1c-2.500 0-4.200 1.500-4.200 4.300v2.400H8V13h2.800v8Z"/>',
    youtube: '<rect x="2.500" y="5.500" width="19" height="13" rx="4"/><path d="m10 9.500 4.500 2.500-4.500 2.500Z"/>',
    tambah: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};

export function Ikon({ n, kelas = "", ...rest }) {
  return (
    <svg className={`ikon ${kelas}`} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: IKON[n] || "" }} {...rest} />
  );
}

export function Logo({ sub, href = "#/" }) {
  return (
    <a className="merek" href={href}>
      <img src="/logo.png" alt="" />
      <span>
        <span className="nama">SISTANI</span>
        {sub && <span className="sub">{sub}</span>}
      </span>
    </a>
  );
}

export function Field({ label, error, hint, wajib, children }) {
  return (
    <div className={`field${error ? " salah" : ""}`}>
      <label>{label}{wajib && <span className="wajib"> *</span>}</label>
      {children}
      {error && <span className="galat-teks"><Ikon n="seru" kelas="kecil" /> {error}</span>}
      {hint && <span className="bantu">{hint}</span>}
    </div>
  );
}

export function Alert({ tone = "galat", judul, children }) {
  if (!children) return null;
  const ikon = tone === "galat" ? "seru" : tone === "waspada" ? "segitiga" : tone === "sukses" ? "centang" : "info";
  return (
    <div className={`pesan ${tone}`} role={tone === "galat" ? "alert" : "status"}>
      <Ikon n={ikon} />
      <div>{judul && <b>{judul}</b>}{children}</div>
    </div>
  );
}

export function Kosong({ judul, teks, aksi }) {
  return (
    <div className="kosong">
      <h3>{judul}</h3>
      <p>{teks}</p>
      {aksi}
    </div>
  );
}

export function Memuat({ teks = "Memuat data" }) {
  return <p className="kecil" role="status"><span className="muat hijau" /> {teks}</p>;
}

// Input kata sandi dengan tombol mata
export function InputSandi({ value, onChange, placeholder, autoComplete, id }) {
  const [lihat, setLihat] = useState(false);
  return (
    <div className="input-ikon">
      <Ikon n="kunci" />
      <input id={id} type={lihat ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" className="mata" onClick={() => setLihat(!lihat)} aria-label={lihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}>
        <Ikon n={lihat ? "mata" : "mataCoret"} />
      </button>
    </div>
  );
}

// ---------- Toast & konfirmasi ----------
let tampilToast = () => {};
export const toast = (teks, jenis) => tampilToast(teks, jenis);

export function ToastArea() {
  const [daftar, setDaftar] = useState([]);
  useEffect(() => {
    tampilToast = (teks, jenis) => {
      const id = Math.random();
      setDaftar((d) => [...d, { id, teks, jenis }]);
      setTimeout(() => setDaftar((d) => d.filter((x) => x.id !== id)), jenis === "galat" ? 6000 : 3500);
    };
    return () => { tampilToast = () => {}; };
  }, []);
  return (
    <div id="toast-area" role="status" aria-live="polite">
      {daftar.map((t) => <div key={t.id} className={`toast${t.jenis === "galat" ? " galat" : ""}`}>{t.teks}</div>)}
    </div>
  );
}

export function Dialog({ buka, onTutup, children, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (buka && !d.open) d.showModal();
    if (!buka && d.open) d.close();
  }, [buka]);
  return (
    <dialog ref={ref} aria-label={label} onClose={onTutup} onCancel={(e) => { e.preventDefault(); onTutup(); }}>
      {buka && children}
    </dialog>
  );
}

export function Konfirmasi({ buka, judul, isi, tombol = "Ya, lanjutkan", bahaya, onYa, onBatal }) {
  return (
    <Dialog buka={buka} onTutup={onBatal} label={judul}>
      <div className="isi-dialog">
        <h2>{judul}</h2>
        <p>{isi}</p>
        <div className="dialog-aksi">
          <button className="btn sekunder" type="button" onClick={onBatal}>Batal</button>
          <button className={`btn ${bahaya ? "bahaya" : "primer"}`} type="button" onClick={onYa}>{tombol}</button>
        </div>
      </div>
    </Dialog>
  );
}

// ---------- Footer & ajakan ----------
export function Footer() {
  return (
    <footer className="footer">
      <div className="dalam">
        <Logo href="#/" />
        <p className="tentang">Mendampingi petani Indonesia dengan informasi yang tepat, dari tanam hingga panen.</p>
        <div className="sosial" aria-label="Media sosial"><Ikon n="instagram" /><Ikon n="facebook" /><Ikon n="youtube" /></div>
        <div className="kolom-tautan">
          <div><h4>Platform</h4><ul><li><a href="#/">Fitur</a></li><li><a href="#/premium">Premium</a></li></ul></div>
          <div><h4>Bantuan</h4><ul><li>Panduan petani</li><li>Hubungi kami</li><li>Pertanyaan umum</li></ul></div>
        </div>
        <p className="surel">halo@pertaniancerdas.id</p>
        <div className="bawah"><span>Kebijakan privasi</span><span>Syarat &amp; ketentuan</span></div>
      </div>
    </footer>
  );
}

export function Cta({ premiumAktif }) {
  return (
    <section className="cta">
      <div className="dalam">
        <h2>Lebih baik dimulai hari ini.</h2>
        <p>SISTANI hadir untuk pertanian yang lebih maju. Kami tumbuh bersama Anda.</p>
        {premiumAktif
          ? <a className="btn primer" href="#/deteksi">Deteksi penyakit dengan foto <Ikon n="miring" /></a>
          : <a className="btn primer" href="#/premium">Upgrade ke Premium <Ikon n="miring" /></a>}
      </div>
    </section>
  );
}

// ---------- Kerangka portal ----------
const MENU_PETANI = [
  ["/beranda", "Beranda", "Beranda", "beranda"],
  ["/kebun", "Data Kebun", "Data Kebun", "peta"],
  ["/riwayat", "Riwayat", "Riwayat", "riwayat"],
  ["/kerusakan", "Kerusakan", "Kerusakan", "laporan"],
  ["/deteksi", "Deteksi", "Deteksi", "gandum"],
  ["/premium", "Premium", "Premium", "lonceng"],
];
const MENU_ADMIN = [
  ["/admin", "Laporan sistem", "Laporan", "grafik"],
  ["/admin/petani", "Data petani", "Petani", "petani"],
  ["/admin/pembayaran", "Verifikasi premium", "Premium", "kartuBayar"],
  ["/akun", "Akun", "Akun", "user"],
];

export function Portal({ aktif, krumb, children }) {
  const { sesi, premium, keluar } = useAuth();
  const admin = sesi.role === "admin";
  const menu = admin ? MENU_ADMIN : MENU_PETANI;
  const rumah = admin ? "#/admin" : "#/beranda";
  const sub = admin ? "PANEL ADMIN" : "PORTAL PETANI";
  const link = ([p, teks, pendek, ikon], panjang) => (
    <a key={p} href={`#${p}`} className={p === "/premium" ? "premium" : ""} aria-current={aktif === p ? "page" : undefined}>
      <Ikon n={ikon} /><span>{panjang ? teks : pendek}</span>
    </a>
  );
  return (
    <div className="app">
      <aside className="samping">
        <Logo sub={sub} href={rumah} />
        <nav aria-label="Menu utama">{menu.map((m) => link(m, true))}</nav>
        <div className="profil">
          <div className="nama">{sesi.nama}</div>
          <div className="peran">{admin ? "Admin" : premium?.premium_aktif ? "Petani Premium" : "Petani"}</div>
          {!admin && <a className="btn kecil penuh" href="#/akun" style={{ marginBottom: ".5rem" }}>Akun saya</a>}
          <button className="btn kecil penuh" type="button" onClick={keluar}>Keluar</button>
        </div>
      </aside>
      <div className="kolom">
        <header className="app-header">
          <Logo sub={sub} href={rumah} />
          <a className="avatar" href="#/akun" aria-label="Akun saya" aria-current={aktif === "/akun" ? "page" : undefined}>{inisial(sesi.nama)}</a>
        </header>
        <main className={`isi${admin ? " lebar" : ""}`}>
          <div className="krumb">{admin ? "Admin" : "Portal petani"} / <b>{krumb}</b></div>
          {children}
        </main>
        {!admin && <Cta premiumAktif={!!premium?.premium_aktif} />}
        {!admin && <Footer />}
      </div>
      <nav className="nav-bawah" aria-label="Menu utama">{menu.map((m) => link(m, false))}</nav>
      <ToastArea />
    </div>
  );
}

export function Judul({ eyebrow, judul, sub }) {
  return (
    <div className="judul-halaman">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{judul}</h1>
      {sub && <p>{sub}</p>}
    </div>
  );
}
