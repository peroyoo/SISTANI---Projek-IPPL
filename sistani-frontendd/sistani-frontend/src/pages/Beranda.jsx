import { useCallback, useEffect, useState } from "react";
import { kebun } from "../api/index.js";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Ikon, Judul, Kosong, Memuat, Portal, go, toast } from "../components/ui.jsx";
import { namaDepan, sapaan, tanggalPanjang, tanggalPendek } from "../lib/format.js";

const LABEL = { belum_waktunya: "Belum waktunya panen", siap_panen: "Siap dipanen", terlambat: "Lewat waktu panen" };
const n1 = (n, d = 1) => (n == null ? "-" : Number(n).toLocaleString("id-ID", { maximumFractionDigits: d }));
const kecilKata = (s) => String(s || "").replace(/_/g, " ");

function GarisTumbuh({ k, p }) {
  const total = Math.max(p.estimasi_total_hari, 1);
  const pers = Math.min(100, Math.max(0, (p.umur_hari / total) * 100));
  return (
    <div className="langkah-tumbuh">
      <div><b>Tanam</b>{tanggalPendek(k.tanggal_tanam).slice(0, -5)}</div>
      <div className={pers < 50 ? "belum" : ""}><b>Hari ini</b>Umur {p.umur_hari} hari</div>
      <div><b>Panen</b>{tanggalPendek(p.tanggal_panen).slice(0, -5)}</div>
      <span className="terisi" style={{ width: `calc((100% - 16px) * ${pers / 100})` }} />
    </div>
  );
}

export default function Beranda() {
  const { sesi } = useAuth();
  const [st, setSt] = useState({ memuat: true, galat: "", daftar: [], ringkas: {} });
  const [pilih, setPilih] = useState(null);
  const [sibuk, setSibuk] = useState(false);

  const muat = useCallback(async () => {
    setSt((s) => ({ ...s, memuat: true, galat: "" }));
    try {
      const daftar = await kebun.daftar();
      const hasil = await Promise.allSettled(daftar.map((k) => kebun.ringkasan(k.id)));
      const ringkas = {};
      hasil.forEach((h, i) => { if (h.status === "fulfilled") ringkas[daftar[i].id] = h.value; });
      setSt({ memuat: false, galat: "", daftar, ringkas });
      // kebun yang paling dekat panen jadi pilihan awal
      const urut = daftar.filter((k) => ringkas[k.id]).sort((a, b) => ringkas[a.id].prediksi.sisa_hari - ringkas[b.id].prediksi.sisa_hari);
      setPilih((lama) => lama ?? (urut[0] || daftar[0] || {}).id ?? null);
    } catch (e) {
      setSt({ memuat: false, galat: e.message, daftar: [], ringkas: {} });
    }
  }, []);
  useEffect(() => { muat(); }, [muat]);

  const simpan = async () => {
    setSibuk(true);
    try {
      await kebun.hitungPrediksi(pilih);
      toast("Perkiraan disimpan ke riwayat.");
    } catch (e) {
      toast(e.message, "galat");
    } finally {
      setSibuk(false);
    }
  };

  const { daftar, ringkas } = st;
  const r = pilih != null ? ringkas[pilih] : null;
  const k = daftar.find((x) => x.id === pilih);
  const siap = Object.values(ringkas).filter((x) => x.prediksi.status !== "belum_waktunya").length;
  const sayur = [...new Set(daftar.map((x) => kecilKata(x.jenis_sayur)))];

  return (
    <Portal aktif="/beranda" krumb="Beranda">
      <div className="judul-halaman">
        <p className="eyebrow" style={{ textTransform: "none", fontSize: "1rem", letterSpacing: 0 }}>
          {sapaan()}, {namaDepan(sesi.nama)}
        </p>
        <h1>Ringkasan kebun Anda</h1>
        <p>Pantau kebun, cuaca, dan jadwal panen dalam satu tempat.</p>
      </div>

      {st.memuat && <Memuat teks="Memuat data kebun dan cuaca" />}
      {st.galat && <Alert>{st.galat} <button className="btn teks" onClick={muat}>Coba lagi</button></Alert>}

      {!st.memuat && !st.galat && daftar.length === 0 && (
        <Kosong judul="Belum ada kebun" teks="Catat kebun pertama Anda untuk melihat perkiraan waktu panen dan cuaca di lokasinya."
          aksi={<button className="btn primer" onClick={() => go("/kebun")}>Tambah kebun</button>} />
      )}

      {!st.memuat && daftar.length > 0 && (
        <>
          <div className="kepala-bagian"><h2>Kebun aktif</h2><span>{tanggalPanjang()}</span></div>
          <div className="stat-dua">
            <div className="stat"><Ikon n="peta" /><div className="nilai">{daftar.length}<small>kebun</small></div><div className="label">Sedang ditanami</div></div>
            <div className="stat"><Ikon n="tunas" /><div className="nilai">{siap}<small>kebun</small></div><div className="label">Siap panen atau lewat waktu</div></div>
          </div>
          <div className="pesan info"><Ikon n="tunas" /><span>Sedang tumbuh: {sayur.join(", ")}.</span></div>

          {r && k && (
            <>
              <div className="kepala-bagian"><h2>Cuaca hari ini</h2><span>Open-Meteo</span></div>
              <div className="cuaca-kartu">
                <div className="lokasi"><Ikon n="pin" /> {k.lokasi}</div>
                <div className="cuaca-baris">
                  <div><div className="nilai">{r.cuaca_hari_ini.suhu == null ? "-" : `${n1(r.cuaca_hari_ini.suhu, 0)}°C`}</div><div className="label">Suhu</div></div>
                  <div><div className="nilai">{r.cuaca_hari_ini.curah_hujan_mm == null ? "-" : `${n1(r.cuaca_hari_ini.curah_hujan_mm)} mm`}</div><div className="label">Curah hujan</div></div>
                  <div><div className="nilai">{r.cuaca_hari_ini.kelembapan == null ? "-" : `${n1(r.cuaca_hari_ini.kelembapan, 0)}%`}</div><div className="label">Kelembapan</div></div>
                </div>
              </div>
              <p className="kecil" style={{ marginTop: ".6rem" }}>
                {r.cuaca_hari_ini.sumber === "default"
                  ? "Data cuaca terbaru tidak tersedia, sistem memakai rata-rata daerah."
                  : "Data cuaca diambil untuk lokasi kebun."}
              </p>
            </>
          )}

          <div className="kepala-bagian"><h2>Menuju panen berikutnya</h2></div>
          {daftar.length > 1 && (
            <div className="field" style={{ maxWidth: 340 }}>
              <select aria-label="Pilih kebun" value={pilih ?? ""} onChange={(e) => setPilih(Number(e.target.value))}>
                {daftar.map((x) => <option key={x.id} value={x.id}>{x.nama_kebun}</option>)}
              </select>
            </div>
          )}
          {k && !r && <Alert tone="waspada">Ringkasan kebun ini belum bisa dimuat.</Alert>}
          {k && r && (
            <div className="panen-kartu">
              <div className="panen-atas">
                <div><h3>{k.nama_kebun}</h3><p className="kecil" style={{ margin: 0 }}>{r.nama_sayur} · {r.nama_tanah}</p></div>
                <span className={`hari-lagi${r.prediksi.status === "belum_waktunya" ? "" : " siap"}`}>
                  {r.prediksi.status === "belum_waktunya" ? `${r.prediksi.sisa_hari} hari lagi` : LABEL[r.prediksi.status]}
                </span>
              </div>
              <GarisTumbuh k={k} p={r.prediksi} />
              <p className="rentang-info">
                Perkiraan panen {tanggalPendek(r.prediksi.tanggal_panen)} (paling cepat {tanggalPendek(r.prediksi.tanggal_terawal).slice(0, -5)},
                paling lambat {tanggalPendek(r.prediksi.tanggal_terlambat).slice(0, -5)}).
              </p>
              {(r.prediksi.catatan || []).map((t, i) => (
                <div key={i} className={`pesan ${r.prediksi.sumber_cuaca === "default" ? "waspada" : "info"}`} style={{ marginTop: ".8rem", marginBottom: 0 }}>{t}</div>
              ))}
              <div className="aksi" style={{ marginTop: "1rem" }}>
                <button className="btn primer kecil" onClick={simpan} disabled={sibuk}>{sibuk ? "Menyimpan..." : "Simpan perkiraan ke riwayat"}</button>
                <a className="btn sekunder kecil" href="#/riwayat">Lihat riwayat</a>
              </div>
            </div>
          )}
        </>
      )}
    </Portal>
  );
}
