import { useEffect, useState } from "react";
import { auth } from "../api/index.js";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Field, InputSandi, Judul, Memuat, Portal, toast } from "../components/ui.jsx";
import { inisial, tanggalPendek } from "../lib/format.js";

export default function Akun() {
  const { sesi, premium, keluar } = useAuth();
  const [u, setU] = useState(null);
  const [galat, setGalat] = useState("");
  const [f, setF] = useState({ lama: "", baru: "", ulang: "" });
  const [g, setG] = useState({});
  const [umum, setUmum] = useState("");
  const [kirim, setKirim] = useState(false);
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { auth.saya().then(setU).catch((e) => setGalat(e.message)); }, []);

  const simpan = async (e) => {
    e.preventDefault();
    const x = {};
    if (!f.lama) x.lama = "Kata sandi lama wajib diisi.";
    if (f.baru.length < 8) x.baru = "Kata sandi baru minimal 8 karakter.";
    else if (f.baru.length > 72) x.baru = "Kata sandi baru maksimal 72 karakter.";
    if (f.ulang !== f.baru) x.ulang = "Konfirmasi kata sandi tidak sama.";
    setG(x);
    setUmum("");
    if (Object.keys(x).length) return;
    setKirim(true);
    try {
      await auth.ubahPassword(f.lama, f.baru);
      setF({ lama: "", baru: "", ulang: "" });
      toast("Kata sandi berhasil diubah.");
    } catch (err) {
      setUmum(err.message);
    } finally {
      setKirim(false);
    }
  };

  const admin = sesi.role === "admin";
  return (
    <Portal aktif="/akun" krumb="Akun saya">
      <Judul judul="Akun saya" sub="Data akun dan keamanan kata sandi." />
      <Alert>{galat}</Alert>
      {!u && !galat && <Memuat />}
      {u && (
        <section className="kartu">
          <div className="aksi" style={{ alignItems: "center", flexWrap: "nowrap" }}>
            <span className="avatar" style={{ width: 56, height: 56, fontSize: "1.1rem" }}>{inisial(u.nama)}</span>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0 }}>{u.nama}</h3>
              <p className="kecil" style={{ margin: 0, overflowWrap: "anywhere" }}>{u.email}</p>
            </div>
          </div>
          <div className="siklus" style={{ marginTop: "1rem", paddingBottom: 0, borderBottom: 0 }}>
            <div className="tanggal" style={{ marginTop: 0 }}>
              <div><small>Peran</small><b>{admin ? "Admin" : "Petani"}</b></div>
              {!admin && (
                <div><small>Paket</small><b>{premium?.premium_aktif ? `Premium s.d. ${tanggalPendek(premium.premium_sampai)}` : "Dasar (gratis)"}</b></div>
              )}
            </div>
          </div>
        </section>
      )}

      <form className="kartu" onSubmit={simpan} noValidate style={{ marginTop: "1rem" }}>
        <h2>Ubah kata sandi</h2>
        <Alert>{umum}</Alert>
        <Field label="Kata sandi lama" error={g.lama}><InputSandi value={f.lama} onChange={ubah("lama")} placeholder="Kata sandi saat ini" autoComplete="current-password" /></Field>
        <Field label="Kata sandi baru" error={g.baru} hint="Minimal 8 karakter, gabungkan huruf dan angka."><InputSandi value={f.baru} onChange={ubah("baru")} placeholder="Kata sandi baru" autoComplete="new-password" /></Field>
        <Field label="Konfirmasi kata sandi baru" error={g.ulang}><InputSandi value={f.ulang} onChange={ubah("ulang")} placeholder="Ulangi kata sandi baru" autoComplete="new-password" /></Field>
        <button className="btn primer penuh" disabled={kirim}>{kirim ? "Menyimpan..." : "Simpan kata sandi"}</button>
      </form>

      <button className="btn sekunder penuh" style={{ marginTop: "1rem" }} onClick={keluar}>Keluar dari akun</button>
    </Portal>
  );
}
