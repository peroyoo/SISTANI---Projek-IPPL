import { useEffect, useState } from "react";
import { kebun, kerusakan } from "../api/index.js";
import { Alert, Field, Portal } from "../components/ui.jsx";
import { MAKS_GEJALA, MIN_GEJALA } from "../lib/config.js";
import { persen, waktuLengkap } from "../lib/format.js";

function Hasil({ d }) {
  const yakin = d.keyakinan === "yakin";
  return (
    <div className="kartu hasil">
      <small className="eyebrow">{yakin ? "Hasil diagnosis · indikasi awal" : "Hasil kurang pasti"}</small>
      <h2>{d.nama_diagnosis}</h2>
      <p className="muted">Tingkat keyakinan sistem: {persen(d.confidence)}</p>
      {!yakin && d.saran && <Alert tone="kuning">{d.saran}</Alert>}
      {d.penyebab && (<><h4>Kemungkinan penyebab</h4><p>{d.penyebab}</p></>)}
      {d.penanganan?.length > 0 && (<><h4>Penanganan awal</h4><ol>{d.penanganan.map((t, i) => <li key={i}>{t}</li>)}</ol></>)}
      {d.pencegahan?.length > 0 && (<><h4>Pencegahan</h4><ul>{d.pencegahan.map((t, i) => <li key={i}>{t}</li>)}</ul></>)}
      {d.alternatif?.length > 0 && (
        <>
          <h4>Kemungkinan lain</h4>
          <ul>{d.alternatif.map((a, i) => <li key={i}>{a.nama} ({persen(a.confidence)})</li>)}</ul>
        </>
      )}
      <Alert tone="kuning"><b>Bukan diagnosis definitif.</b> Hasil dapat keliru. Konsultasikan dengan penyuluh pertanian sebelum menentukan tindakan atau menggunakan pestisida.</Alert>
    </div>
  );
}

export default function Kerusakan() {
  const [daftarKebun, setDaftarKebun] = useState([]);
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
    muatRiwayat();
  }, []);

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

  const ulang = () => { setHasil(null); setGejala(""); setSentuh(false); };

  return (
    <Portal aktif="/kerusakan" judul="Laporan kerusakan tanaman" sub="Ceritakan kondisi tanaman Anda, sistem akan menganalisis kemungkinan penyebab dan penanganannya. Gratis untuk semua petani.">
      {hasil ? (
        <>
          <Hasil d={hasil} />
          <button className="btn" onClick={ulang}>Laporkan kerusakan lain</button>
        </>
      ) : (
        <form className="kartu" onSubmit={submit} noValidate>
          <Alert>{galat}</Alert>
          <Field label="Kebun (opsional)" hint="Mengaitkan laporan ini dengan kebun Anda.">
            <select value={kebunId} onChange={(e) => setKebunId(e.target.value)}>
              <option value="">Tidak dikaitkan ke kebun</option>
              {daftarKebun.map((k) => <option key={k.id} value={k.id}>{k.nama_kebun}</option>)}
            </select>
          </Field>
          <Field label="Deskripsi kerusakan *" error={salahGejala}
            hint="Jelaskan gejala (warna, bagian tanaman), sejak kapan muncul, ada serangga atau tidak.">
            <textarea rows={6} maxLength={MAKS_GEJALA} value={gejala} className={salahGejala ? "salah" : ""}
              onChange={(e) => setGejala(e.target.value)} onBlur={() => setSentuh(true)}
              placeholder="Contoh: daun keriting dan ada kutu kecil di bawah daun sejak 3 hari lalu" />
          </Field>
          <div className="baris kecil"><span>Minimal {MIN_GEJALA} karakter</span><span>{gejala.length} / {MAKS_GEJALA}</span></div>
          <button className="btn" disabled={kirim || kurang > 0}>{kirim ? "Menganalisis..." : "Kirim laporan"}</button>
        </form>
      )}
      {riwayat.length > 0 && (
        <>
          <h3 className="seksi">Riwayat laporan</h3>
          {riwayat.slice(0, 10).map((r) => (
            <details className="kartu riw" key={r.id}>
              <summary>
                <b>{r.nama_diagnosis}</b>
                <small className="muted">{waktuLengkap(r.dibuat_pada)} · {r.metode === "foto" ? "foto" : "teks"} · {persen(r.confidence)}</small>
              </summary>
              {r.gejala_teks && <p className="muted">“{r.gejala_teks}”</p>}
              {r.penanganan?.length > 0 && <ol>{r.penanganan.map((t, i) => <li key={i}>{t}</li>)}</ol>}
            </details>
          ))}
        </>
      )}
    </Portal>
  );
}
