import { useState } from "react";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Field, Logo } from "../components/ui.jsx";

export default function Masuk() {
  const { masuk, daftar, pesan } = useAuth();
  const [mode, setMode] = useState("masuk");
  const [f, setF] = useState({ nama: "", email: "", password: "", ulang: "", setuju: false, ingat: true });
  const [galat, setGalat] = useState({});
  const [umum, setUmum] = useState("");
  const [kirim, setKirim] = useState(false);
  const [lihat, setLihat] = useState(false);
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const validasi = () => {
    const g = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email)) g.email = "Alamat email tidak valid.";
    if (mode === "masuk") {
      if (!f.password) g.password = "Kata sandi wajib diisi.";
    } else {
      if (f.nama.trim().length < 2) g.nama = "Nama minimal 2 karakter.";
      if (f.password.length < 8) g.password = "Kata sandi minimal 8 karakter.";
      else if (f.password.length > 72) g.password = "Kata sandi maksimal 72 karakter.";
      if (f.ulang !== f.password) g.ulang = "Konfirmasi kata sandi tidak sama.";
      if (!f.setuju) g.setuju = "Anda perlu menyetujui syarat dan ketentuan.";
    }
    return g;
  };

  const submit = async (e) => {
    e.preventDefault();
    setUmum("");
    const g = validasi();
    setGalat(g);
    if (Object.keys(g).length) return;
    setKirim(true);
    try {
      const s = mode === "masuk" ? await masuk(f.email, f.password, f.ingat) : await daftar(f.nama.trim(), f.email, f.password);
      window.location.hash = s.role === "admin" ? "/admin" : "/beranda";
    } catch (err) {
      const fl = {};
      if (err.status === 409) fl.email = err.message;
      else if (err.fields && Object.keys(err.fields).length) Object.assign(fl, err.fields);
      else setUmum(err.message);
      setGalat(fl);
    } finally {
      setKirim(false);
    }
  };

  const ganti = (m) => {
    setMode(m);
    setGalat({});
    setUmum("");
  };

  return (
    <div className="tengah">
      <Logo />
      <h1>{mode === "masuk" ? "Selamat datang kembali" : "Satu akun, banyak peluang."}</h1>
      <p className="sub">
        {mode === "masuk" ? "Masuk untuk melanjutkan aktivitas pertanian Anda." : "Daftar gratis dan mulai kelola kebun Anda."}
      </p>
      <Alert tone="kuning">{pesan}</Alert>
      <form className="kartu" onSubmit={submit} noValidate>
        <div className="tab">
          <button type="button" className={mode === "masuk" ? "on" : ""} onClick={() => ganti("masuk")}>Masuk</button>
          <button type="button" className={mode === "daftar" ? "on" : ""} onClick={() => ganti("daftar")}>Buat akun</button>
        </div>
        <Alert>{umum}</Alert>
        {mode === "daftar" && (
          <Field label="Nama lengkap" error={galat.nama}>
            <input value={f.nama} onChange={ubah("nama")} placeholder="Nama sesuai identitas" autoComplete="name" />
          </Field>
        )}
        <Field label="Alamat email" error={galat.email}>
          <input type="email" value={f.email} onChange={ubah("email")} placeholder="nama@contoh.com" autoComplete="email" />
        </Field>
        <Field label="Kata sandi" error={galat.password} hint={mode === "daftar" ? "Minimal 8 karakter, gabungkan huruf dan angka." : null}>
          <div className="pw">
            <input type={lihat ? "text" : "password"} value={f.password} onChange={ubah("password")}
              placeholder={mode === "masuk" ? "Masukkan kata sandi" : "Buat kata sandi"}
              autoComplete={mode === "masuk" ? "current-password" : "new-password"} />
            <button type="button" className="link" onClick={() => setLihat(!lihat)}>{lihat ? "Sembunyikan" : "Lihat"}</button>
          </div>
        </Field>
        {mode === "daftar" && (
          <>
            <Field label="Konfirmasi kata sandi" error={galat.ulang}>
              <input type={lihat ? "text" : "password"} value={f.ulang} onChange={ubah("ulang")} placeholder="Ulangi kata sandi" autoComplete="new-password" />
            </Field>
            <label className="cek"><input type="checkbox" checked={f.setuju} onChange={ubah("setuju")} /> Saya menyetujui Syarat &amp; Ketentuan serta Kebijakan Privasi.</label>
            {galat.setuju && <span className="err">{galat.setuju}</span>}
          </>
        )}
        {mode === "masuk" && (
          <label className="cek"><input type="checkbox" checked={f.ingat} onChange={ubah("ingat")} /> Ingat saya di perangkat ini</label>
        )}
        <button className="btn" disabled={kirim}>
          {kirim ? "Memproses..." : mode === "masuk" ? "Masuk ke akun →" : "Buat akun gratis →"}
        </button>
      </form>
    </div>
  );
}
