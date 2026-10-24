
import { useState } from "react";
import { useAuth } from "../context/Auth.jsx";
import {
  Alert,
  Field,
  InputSandi,
  Ikon,
  Logo
} from "../components/ui.jsx";

function FormMasuk() {
  const { masuk, pesan } = useAuth();

  const [f, setF] = useState({
    email: "",
    password: "",
    ingat: true
  });

  const [g, setG] = useState({});
  const [umum, setUmum] = useState("");
  const [kirim, setKirim] = useState(false);

  const ubah = (k) => (e) =>
    setF({
      ...f,
      [k]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value
    });

  const submit = async (e) => {
    e.preventDefault();

    const x = {};

    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      x.email = "Alamat email tidak valid.";
    }

    if (!f.password) {
      x.password = "Kata sandi wajib diisi.";
    }

    setG(x);
    setUmum("");

    if (Object.keys(x).length) return;

    setKirim(true);

    try {
  const tujuan = await masuk(
    f.email.trim(),
    f.password,
    f.ingat
  );

  window.location.hash = tujuan;
    } catch (err) {
      setUmum(err.message);
    } finally {
      setKirim(false);
    }
  };

  return (
    <form
      className="kartu auth-kartu"
      id="masuk"
      onSubmit={submit}
      noValidate
    >
      <p className="eyebrow">Sudah punya akun?</p>

      <h2>Selamat datang kembali</h2>

      <p className="redup">
        Masuk untuk melanjutkan aktivitas pertanian Anda.
      </p>

      <Alert tone="waspada">{pesan}</Alert>
      <Alert>{umum}</Alert>

      <Field
        label="Alamat email"
        error={g.email}
      >
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

      <Field
        label="Kata sandi"
        error={g.password}
      >
        <InputSandi
          value={f.password}
          onChange={ubah("password")}
          placeholder="Masukkan kata sandi"
          autoComplete="current-password"
        />
      </Field>

      <label className="centang">
        <input
          type="checkbox"
          checked={f.ingat}
          onChange={ubah("ingat")}
        />{" "}
        Ingat saya di perangkat ini
      </label>

      <p style={{ margin: "0 0 1rem" }}>
        <a
          href="#/lupa"
          style={{ fontWeight: 600 }}
        >
          Lupa kata sandi?
        </a>
      </p>

      <button
        className="btn primerpenuh"
        disabled={kirim}
      >
        {kirim ? (
          "Memproses..."
        ) : (
          <>
            Masuk ke akun <Ikon n="kanan" />
          </>
        )}
      </button>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Belum punya akun?{" "}
        <a
          href="#/daftar"
          style={{ fontWeight: 600 }}
        >
          Daftar sekarang
        </a>
      </p>
    </form>
  );
}

export default function Masuk() {
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
        <h1>Satu akun, banyak peluang.</h1>

        <p className="redup">
          Masuk ke akun SISTANI Anda untuk melanjutkan
          aktivitas pertanian.
        </p>

        <FormMasuk />

        <aside className="auth-promo">
          <img src="/tanam.jpg" alt="" />

          <div>
            <p
              className="eyebrow"
              style={{ color: "var(--lime)" }}
            >
              Untuk petani Indonesia
            </p>

            <h2>Lahan Anda. Masa depan kita.</h2>

            <p>
              Mulai perjalanan pertanian yang lebih terarah,
              dari satu akun yang sederhana.
            </p>

            <ul
              className="daftar-centang"
              style={{
                borderTop: 0,
                padding: 0,
                color: "#fff"
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
