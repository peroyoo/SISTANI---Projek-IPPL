import { useEffect, useMemo, useState } from "react";
import { kebun, referensi } from "../api/index.js";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Ikon, Judul, Kosong, Memuat, Portal } from "../components/ui.jsx";
import { STATUS_PANEN, tanggalPendek, waktuLengkap } from "../lib/format.js";

const PER_HALAMAN = 4;

export default function Riwayat() {
  const { sesi } = useAuth();
  const [st, setSt] = useState({ memuat: true, galat: "", daftar: [], ref_: null, pred: {} });
  const [filterKebun, setFilterKebun] = useState("");
  const [tahun, setTahun] = useState("");
  const [terbaru, setTerbaru] = useState(true);
  const [hal, setHal] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const [daftar, ref_] = await Promise.all([kebun.daftar(), referensi()]);
        const hasil = await Promise.allSettled(daftar.map((k) => kebun.riwayatPrediksi(k.id)));
        const pred = {};
        hasil.forEach((h, i) => { pred[daftar[i].id] = h.status === "fulfilled" ? h.value : []; });
        setSt({ memuat: false, galat: "", daftar, ref_, pred });
      } catch (e) {
        setSt((s) => ({ ...s, memuat: false, galat: e.message }));
      }
    })();
  }, []);

  const nama = (kode) => st.ref_?.jenis_sayur.find((x) => x.kode === kode)?.nama || String(kode).replace(/_/g, " ");
  const tahunTersedia = useMemo(() => [...new Set(st.daftar.map((k) => k.tanggal_tanam.slice(0, 4)))].sort().reverse(), [st.daftar]);

  const baris = useMemo(() => {
    const out = st.daftar
      .filter((k) => (!filterKebun || String(k.id) === filterKebun) && (!tahun || k.tanggal_tanam.startsWith(tahun)))
      .map((k) => {
        const riw = st.pred[k.id] || [];
        const terakhir = [...riw].sort((a, b) => String(b.tanggal_hitung).localeCompare(String(a.tanggal_hitung)))[0];
        return { k, terakhir, jumlah: riw.length };
      });
    out.sort((a, b) => (terbaru ? -1 : 1) * a.k.tanggal_tanam.localeCompare(b.k.tanggal_tanam));
    return out;
  }, [st, filterKebun, tahun, terbaru]);

  const jml = baris.length;
  const maks = Math.max(1, Math.ceil(jml / PER_HALAMAN));
  const halaman = Math.min(hal, maks);
  const potong = baris.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN);
  useEffect(() => { setHal(1); }, [filterKebun, tahun, terbaru]);

  return (
    <Portal aktif="/riwayat" krumb="Riwayat Tanam & Panen">
      <Judul judul="Riwayat Tanam & Panen" sub="Telusuri setiap kebun yang Anda tanam beserta perkiraan panennya." />
      <Alert>{st.galat}</Alert>
      {st.memuat && <Memuat teks="Memuat riwayat" />}
      {!st.memuat && !st.galat && (
        <>
          <div className="pesan info" style={{ alignItems: "center" }}>
            <Ikon n="laporan" />
            <div><b>{st.daftar.length} siklus tercatat</b>Dari {st.daftar.length} kebun milik {sesi.nama}</div>
          </div>
          {st.daftar.length === 0 ? (
            <Kosong judul="Belum ada catatan" teks="Tambahkan kebun di menu Data Kebun, lalu simpan perkiraan panen dari Beranda." />
          ) : (
            <>
              <div className="filter-baris" style={{ gridTemplateColumns: "1fr 120px" }}>
                <select aria-label="Filter kebun" value={filterKebun} onChange={(e) => setFilterKebun(e.target.value)}>
                  <option value="">Semua kebun</option>
                  {st.daftar.map((k) => <option key={k.id} value={k.id}>{k.nama_kebun}</option>)}
                </select>
                <select aria-label="Filter tahun tanam" value={tahun} onChange={(e) => setTahun(e.target.value)}>
                  <option value="">Semua</option>
                  {tahunTersedia.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <section className="kartu">
                <div className="judul-kartu">
                  <h3>Catatan musim tanam</h3>
                  <button className="btn teks kecil" onClick={() => setTerbaru(!terbaru)}>{terbaru ? "Terbaru ↓" : "Terlama ↑"}</button>
                </div>
                {potong.length === 0 && <p className="kecil">Tidak ada catatan untuk filter ini.</p>}
                {potong.map(({ k, terakhir, jumlah }) => {
                  const s = terakhir ? STATUS_PANEN[terakhir.status] : null;
                  return (
                    <div className="siklus" key={k.id}>
                      <div className="atas">
                        <span className="kode">TANAM {k.tanggal_tanam.slice(0, 4)}</span>
                        {s ? <span className={`lencana ${s.tone === "hijau" ? "" : s.tone}`}>{s.label}</span> : <span className="lencana abu">Belum dihitung</span>}
                      </div>
                      <h3>{k.nama_kebun}</h3>
                      <p className="kecil" style={{ margin: 0 }}>{nama(k.jenis_sayur)} · {k.lokasi}</p>
                      <div className="tanggal">
                        <div><small>Tanggal tanam</small><b>{tanggalPendek(k.tanggal_tanam)}</b></div>
                        <div><small>Perkiraan panen</small><b>{terakhir ? tanggalPendek(terakhir.tanggal_panen) : "-"}</b></div>
                      </div>
                      <p className="kecil" style={{ margin: ".7rem 0 0" }}>
                        {jumlah ? `${jumlah} perkiraan tersimpan, terakhir ${waktuLengkap(terakhir.tanggal_hitung)}` : "Belum ada perkiraan yang disimpan dari Beranda."}
                      </p>
                    </div>
                  );
                })}
                <div className="halaman-nav" style={{ justifyContent: "center", color: "var(--teks-redup)" }}>
                  Menampilkan {jml ? (halaman - 1) * PER_HALAMAN + 1 : 0}–{Math.min(halaman * PER_HALAMAN, jml)} dari {jml} catatan
                </div>
                <div className="halaman-nav" style={{ borderTop: 0, paddingTop: 0 }}>
                  <button className="btn teks kecil" disabled={halaman <= 1} onClick={() => setHal(halaman - 1)}>← Sebelumnya</button>
                  <span className="no">{halaman} / {maks}</span>
                  <button className="btn teks kecil" disabled={halaman >= maks} onClick={() => setHal(halaman + 1)}>Berikutnya →</button>
                </div>
              </section>
              <div className="baris-info"><Ikon n="info" /><span>Tanggal panen adalah perkiraan sistem dari perkiraan yang terakhir disimpan, bukan hasil panen aktual.</span></div>
            </>
          )}
        </>
      )}
    </Portal>
  );
}
