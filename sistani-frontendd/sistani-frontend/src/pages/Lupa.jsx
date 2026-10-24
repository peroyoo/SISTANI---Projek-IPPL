import { useState } from "react";
import { auth } from "../api/index.js";
import { Alert, Field, Ikon, Logo } from "../components/ui.jsx";

export default function Lupa() {
  const [email, setEmail] = useState("");
  const [g, setG] = useState("");
  const [umum, setUmum] = useState("");
  const [kirim, setKirim] = useState(false);
  const [terkirim, setTerkirim] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setUmum("");
    if (!/^\S+@\S+\.\S+$/.test(email)) { setG("Alamat email tidak valid."); return; }
    setG("");
    setKirim(true);
    try {
      await auth.lupaPassword(email.trim());
      setTerkirim(true);
    } catch (err) {
      // Backend belum menyediakan endpoint ini (lihat README): beri tahu dengan jelas, jangan pura-pura terkirim.
      if (err.status === 404 || err.status === 405) setUmum("Pemulihan kata sandi lewat email belum diaktifkan di server. Hubungi admin SISTANI untuk mengatur ulang kata sandi Anda.");
      else setUmum(err.message);
    } finally {
      setKirim(false);
    }
  };

  return (
    <div className="publik">
      <header className="pub-atas">
        <Logo href="#/" />
        <a className="ikon-tombol" href="#/masuk" aria-label="Kembali ke halaman masuk"><Ikon n="kiri" /></a>
      </header>
      <div className="auth-isi" style={{ textAlign: "center" }}>
        <p className="eyebrow">Pemulihan akun</p>
        <h1>Kembali ke akun Anda.</h1>
        <p className="redup">Langkah sederhana untuk mengakses kembali lahan dan aktivitas pertanian Anda.</p>

        {!terkirim ? (
          <form className="kartu auth-kartu" onSubmit={submit} noValidate style={{ textAlign: "left" }}>
            <span className="avatar" style={{ width: 56, height: 56, borderRadius: 16, marginBottom: "1rem" }}><Ikon n="kunci" /></span>
            <h2>Lupa kata sandi?</h2>
            <p className="redup">Masukkan email yang terdaftar dan kami akan mengirimkan tautan untuk membuat kata sandi baru.</p>
            <Alert>{umum}</Alert>
            <Field label="Alamat email terdaftar" error={g} hint="Gunakan email yang terhubung dengan akun Anda.">
              <div className="input-ikon"><Ikon n="surel" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@contoh.com" autoComplete="email" /></div>
            </Field>
            <button className="btn primer penuh" disabled={kirim}>{kirim ? "Mengirim..." : <>Kirim tautan reset <Ikon n="kanan" /></>}</button>
            <div className="pesan" style={{ background: "var(--latar)", marginTop: "1rem" }}><Ikon n="perisai" /><span>Demi keamanan, tautan hanya dikirim jika email terdaftar di sistem.</span></div>
            <p style={{ textAlign: "center", margin: 0 }}><a href="#/masuk" style={{ fontWeight: 600, textDecoration: "none" }}><Ikon n="kiri" kelas="kecil" /> Kembali ke halaman masuk</a></p>
          </form>
        ) : (
          <div className="kartu auth-kartu">
            <Alert tone="sukses">Permintaan reset berhasil dikirim.</Alert>
            <h2>Periksa kotak masuk Anda</h2>
            <p className="redup">Kami telah mengirimkan petunjuk pemulihan kata sandi ke:</p>
            <p><b>{email}</b></p>
            <p className="kecil">Belum menerima email? Periksa folder spam atau kirim ulang.</p>
            <button className="btn sekunder penuh" onClick={() => setTerkirim(false)}>Kirim ulang tautan</button>
            <p style={{ margin: "1rem 0 0" }}><a href="#/masuk" style={{ fontWeight: 600, textDecoration: "none" }}>Kembali ke halaman masuk</a></p>
          </div>
        )}
      </div>
    </div>
  );
}
