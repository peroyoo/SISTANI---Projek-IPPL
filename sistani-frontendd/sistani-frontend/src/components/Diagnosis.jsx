import { Alert, Ikon } from "./ui.jsx";
import { persen } from "../lib/format.js";

const Nomor = ({ daftar }) => (
  <ol className="langkah-nomor">{(daftar || []).map((x, i) => <li key={i}><span>{x}</span></li>)}</ol>
);

export function Hasil({ d, tanaman }) {
  const ragu = d.keyakinan === "kurang_yakin";
  const p = Math.round((d.confidence || 0) * 100);
  return (
    <section className="kartu hasil">
      <div className={`kepala-hasil${ragu ? " ragu" : ""}`}>
        <p className="eyebrow">Hasil {d.metode === "foto" ? "deteksi foto" : "pengecekan teks"} · indikasi awal</p>
        <h2>{d.nama_diagnosis}</h2>
        {tanaman && <p className="kecil" style={{ margin: "0 0 .6rem" }}>Tanaman: {tanaman}</p>}
        <div className="aksi" style={{ alignItems: "center" }}>
          <span className="persen">{p}%</span>
          <span className={`lencana${ragu ? " kuning" : ""}`}>{ragu ? "Kurang yakin" : "Cukup yakin"}</span>
        </div>
        <div className="meter" role="img" aria-label={`Tingkat keyakinan ${p} persen`}><span style={{ width: `${p}%` }} /></div>
        <p className="kecil" style={{ margin: 0 }}>Tingkat keyakinan sistem terhadap hasil ini.</p>
      </div>
      <div className="badan-hasil">
        {d.saran && <Alert tone="waspada">{d.saran}</Alert>}
        {d.gejala_teks && (<><h3>Laporan Anda</h3><p>“{d.gejala_teks}”</p></>)}
        {d.penyebab && (<><h3>Kemungkinan penyebab</h3><p>{d.penyebab}</p></>)}
        {d.penanganan?.length > 0 && (<><h3>Penanganan awal</h3><Nomor daftar={d.penanganan} /></>)}
        {d.pencegahan?.length > 0 && (<><h3>Pencegahan</h3><Nomor daftar={d.pencegahan} /></>)}
        {d.alternatif?.length > 0 && (
          <p className="kecil"><b>Kemungkinan lain:</b> {d.alternatif.map((a) => `${a.nama} (${persen(a.confidence)})`).join(", ")}</p>
        )}
        <div className="pesan waspada peringatan-ai">
          <Ikon n="segitiga" />
          <div><b>Bukan diagnosis definitif</b>Hasil ini adalah saran awal dan dapat keliru. Konsultasikan dengan penyuluh pertanian sebelum menentukan tindakan atau memakai pestisida.</div>
        </div>
      </div>
    </section>
  );
}
