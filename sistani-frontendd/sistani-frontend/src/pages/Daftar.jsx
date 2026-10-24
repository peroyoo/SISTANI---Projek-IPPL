
import { useState } from "react";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Field, InputSandi, Ikon, Logo } from "../components/ui.jsx";

function FormDaftar() {
  const { daftar, pesan } = useAuth();

  const [f, setF] = useState({
    nama: "",
    email: "",
    password: "",
  });

  const [g, setG] = useState({});
  const [umum, setUmum] = useState("");
  const [kirim, setKirim] = useState(false);

  const ubah = (k) => (e) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    const x = {};

    if (!f.nama.trim()) x.nama = "Nama wajib diisi.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      x.email = "Alamat email tidak valid.";
    }
    if (!f.password) x.password = "Kata sandi wajib diisi.";
    if (f.password && f.password.length < 6) {
      x.password = "Kata sandi minimal 6 karakter.";
    }

    setG(x);
    setUmum("");

    if (Object.keys(x).length) return;

    setKirim(true);

    try {
  const tujuan = await daftar(
    f.nama.trim(),
    f.email.trim(),
    f.password
  );

  if (tujuan) {
    window.location.hash = tujuan;
  }
    } catch (err) {
      setUmum(err.message);
    } finally {
      setKirim(false);
    }
  };

  return (
    <form
      className="kartu auth-kartu"
      onSubmit={submit}
      noValidate
    >
      <p className="eyebrow">Buat akun baru</p>

      <h2>Mulai bersama SISTANI</h2>

      <p className="redup">
        Daftarkan akun Anda untuk mulai mengelola aktivitas pertanian.
      </p>

      <Alert tone="waspada">{pesan}</Alert>
      <Alert>{umum}</Alert>

      <Field label="Nama lengkap" error={g.nama}>
        <div className="input-ikon">
          <Ikon n="pengguna" />
          <input
            type="text"
            value={f.nama}
            onChange={ubah("nama")}
            placeholder="Nama lengkap"
            autoComplete="name"
          />
        </div>
      </Field>

      <Field label="Alamat email" error={g.email}>
        <div className="input-ikon">
          <Ikon n="surel" />
          <input
            type="email"
            value={f.email}
            onChange={ubah("email")}
            placeholder="nama@contoh.com"
            autoComplete="email"
          />
        </div>
      </Field>

      <Field label="Kata sandi" error={g.password}>
        <InputSandi
          value={f.password}
          onChange={ubah("password")}
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
        />
      </Field>

      <button
        className="btn primerpenuh"
        disabled={kirim}
      >
        {kirim ? "Mendaftarkan..." : <>Daftar akun <Ikon n="kanan" /></>}
      </button>
    </form>
  );
}

export default function Daftar() {
  return (
    <div className="publik">
      <header className="pub-atas">
        <Logo href="#/" />

        <a
          className="ikon-tombol"
          href="#/"
          aria-label="Kembali ke beranda"
        >
          <Ikon n="kiri" />
        </a>
      </header>

      <div className="auth-isi">
        <h1>Buat akun SISTANI.</h1>

        <p className="redup">
          Daftarkan diri sebagai petani dan mulai kelola lahan Anda.
        </p>

        <p>
          Sudah punya akun?{" "}
          <a
            href="#/masuk"
            style={{ fontWeight: 600 }}
          >
            Masuk ke akun
          </a>
        </p>

        <FormDaftar />

        <aside className="auth-promo">
          <img src="/tanam.jpg" alt="" />

          <div>
            <p
              className="eyebrow"
              style={{ color: "var(--lime)" }}
            >
              Untuk petani Indonesia
            </p>

            <h2>
              Lahan Anda. Masa depan kita.
            </h2>

            <p>
              Mulai perjalanan pertanian yang lebih terarah,
              dari satu akun yang sederhana.
            </p>

            <ul
              className="daftar-centang"
              style={{
                borderTop: 0,
                padding: 0,
                color: "#fff",
              }}
            >
              <li>
                <Ikon n="centang" /> Catatan lahan dalam satu tempat
              </li>

              <li>
                <Ikon n="centang" /> Informasi cuaca sesuai lokasi
              </li>

              <li>
                <Ikon n="centang" /> Perkiraan panen dan diagnosis kerusakan
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
