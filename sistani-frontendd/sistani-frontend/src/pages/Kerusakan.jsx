import { useEffect, useState } from "react";
import { kebun, kerusakan, referensi } from "../api/index.js";
import { Alert, Field, Ikon, Judul, Portal } from "../components/ui.jsx";
import { Hasil } from "../components/Diagnosis.jsx";
import { MAKS_GEJALA, MIN_GEJALA } from "../lib/config.js";
import { persen, waktuLengkap } from "../lib/format.js";

export function RiwayatLaporan({ daftar }) {
  if (!daftar.length) return null;
  return (
    <>
      <div className="kepala-bagian"><h2>Riwayat laporan</h2><span>{daftar.length} laporan</span></div>
      <div className="kartu" style={{ padding: "0 1.25rem" }}>
        {daftar.slice(0, 10).map((r) => (
          <details className="siklus" key={r.id}>
            <summary style={{ cursor: "pointer", listStyle: "none" }}>
              <div className="atas">
                <span className="kode">{waktuLengkap(r.dibuat_pada)}</span>
                <span className={`lencana${r.metode === "foto" ? " lime" : " abu"}`}>{r.metode === "foto" ? "Foto" : "Teks"} · {persen(r.confidence)}</span>
              </div>
              <h3>{r.nama_diagnosis}</h3>
            </summary>
            {r.gejala_teks && <p className="kecil" style={{ marginTop: ".6rem" }}>“{r.gejala_teks}”</p>}
            {r.penanganan?.length > 0 && <ol style={{ margin: ".4rem 0 0", paddingLeft: "1.2rem" }}>{r.penanganan.map((t, i) => <li key={i}>{t}</li>)}</ol>}
          </details>
        ))}
      </div>
    </>
  );
}

export default function Kerusakan() {
  const [daftarKebun, setDaftarKebun] = useState([]);
  const [ref_, setRef] = useState(null);
  const [kebunId, setKebunId] = useState("");
  const [gejala, setGejala] = useState("");
  const [sentuh, setSentuh] = useState(false);
  const [kirim, setKirim] = useState(false);
  const [galat, setGalat] = useState("");
  const [hasil, setHasil] = useState(null);
  const [riwayat, setRiwayat] = useState([]);

  const muatRiwayat = () => kerusakan.riwayat().then(setRiwayat).catch(() => {});
  useEffect(() => {
    kebun.daftar().then(setDaftarKebun).catch(() => {});
    referensi().then(setRef).catch(() => {});
    muatRiwayat();
  }, []);

  const k = daftarKebun.find((x) => String(x.id) === kebunId);
  const namaSayur = (kode) => ref_?.jenis_sayur.find((x) => x.kode === kode)?.nama || String(kode).replace(/_/g, " ");
  const panjang = gejala.trim().length;
  const kurang = MIN_GEJALA - panjang;
  const salahGejala = sentuh && kurang > 0 ? `Tambahkan minimal ${kurang} karakter lagi.` : "";

  const submit = async (e) => {
    e.preventDefault();
    setSentuh(true);
    setGalat("");
    if (kurang > 0) return;
    setKirim(true);
    try {
      const d = await kerusakan.teks(gejala.trim(), kebunId ? Number(kebunId) : null);
      setHasil(d);
      muatRiwayat();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setGalat(err.fields?.gejala || err.message);
    } finally {
      setKirim(false);
    }
  };
  const ulang = () => { setHasil(null); setGejala(""); setSentuh(false); setGalat(""); };

  return (
    <Portal aktif="/kerusakan" krumb="Laporan Kerusakan">
      <Judul eyebrow="Layanan pertanian" judul="Laporan kerusakan tanaman"
        sub="Laporkan kondisi tanaman agar tindak lanjut dapat dilakukan dengan informasi yang lengkap. Gratis untuk semua petani." />
      {hasil ? (
        <>
          <Hasil d={hasil} tanaman={k ? `${namaSayur(k.jenis_sayur)} · ${k.nama_kebun}` : null} />
          <button className="btn primer penuh" style={{ marginTop: "1rem" }} onClick={ulang}>Laporkan kerusakan lain</button>
        </>
      ) : (
        <>
          {sentuh && kurang > 0 && (
            <Alert judul="Periksa 1 kolom sebelum mengirim">Deskripsi kerusakan masih terlalu singkat.</Alert>
          )}
          <form className="kartu" onSubmit={submit} noValidate>
            <h2>Detail kejadian</h2>
            <p className="kecil">Tanda * menunjukkan kolom wajib.</p>
            <Alert>{galat}</Alert>
            <Field label="Kebun" hint={k ? `${namaSayur(k.jenis_sayur)} · ${k.lokasi}` : "Pilih kebun yang tanamannya bermasalah (opsional), agar laporan tercatat pada kebun itu."}>
              <select value={kebunId} onChange={(e) => setKebunId(e.target.value)}>
                <option value="">Tidak dikaitkan ke kebun</option>
                {daftarKebun.map((x) => <option key={x.id} value={x.id}>{x.nama_kebun}</option>)}
              </select>
            </Field>
            <Field label="Deskripsi kerusakan" wajib error={salahGejala}
              hint="Jelaskan gejala (warna, bagian tanaman), waktu muncul, dan apakah ada serangga.">
              <textarea rows={6} maxLength={MAKS_GEJALA} value={gejala}
                onChange={(e) => setGejala(e.target.value)} onBlur={() => setSentuh(true)}
                placeholder="Contoh: daun keriting dan ada kutu kecil di bawah daun sejak 3 hari lalu" />
            </Field>
            <div className="ringkas-daftar" style={{ margin: "-.6rem 0 0" }}>
              <span className="kecil">Minimal {MIN_GEJALA} karakter</span>
              <span className="kecil">{gejala.length} / {MAKS_GEJALA}</span>
            </div>
            <button className="btn primer penuh" style={{ marginTop: "1rem" }} disabled={kirim || kurang > 0}>
              {kirim ? "Menganalisis..." : "Kirim laporan"}
            </button>
            {kurang > 0 && <p className="kecil" style={{ margin: ".7rem 0 0" }}>Lengkapi kolom yang ditandai untuk mengaktifkan tombol kirim.</p>}
          </form>
        </>
      )}
      <RiwayatLaporan daftar={riwayat} />
    </Portal>
  );
}
