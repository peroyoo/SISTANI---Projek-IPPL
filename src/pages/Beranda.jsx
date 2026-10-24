import { useCallback, useEffect, useState } from "react";
import { kebun } from "../api/index.js";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Kosong, Portal, go } from "../components/ui.jsx";
import { STATUS_PANEN, namaDepan, sapaan, tanggalPanjang, tanggalPendek } from "../lib/format.js";

const angka = (n, s = "") => (n === null || n === undefined ? "-" : `${Math.round(n * 10) / 10}${s}`);

function Kartu({ item, onHitung, sibuk }) {
  const { k, r } = item;
  if (!r) {
    return (
      <div className="kartu">
        <h3>{k.nama_kebun}</h3>
        <Alert tone="kuning">Ringkasan kebun ini belum bisa dimuat.</Alert>
      </div>
    );
  }
  const p = r.prediksi;
  const st = STATUS_PANEN[p.status] || STATUS_PANEN.belum_waktunya;
  const pct = Math.min(100, Math.round((p.umur_hari / Math.max(1, p.estimasi_total_hari)) * 100));
  const c = r.cuaca_hari_ini;
  return (
    <div className="kartu">
      <div className="baris">
        <div>
          <h3>{k.nama_kebun}</h3>
          <p className="muted">{r.nama_sayur} · {r.nama_tanah} · {k.lokasi}</p>
        </div>
        <span className={`pil ${st.tone}`}>{st.label}</span>
      </div>
      <div className="bar" aria-label={`Umur tanaman ${pct}% dari estimasi`}><i style={{ width: `${pct}%` }} /></div>
      <div className="baris kecil">
        <span>Tanam {tanggalPendek(k.tanggal_tanam)}</span>
        <span>Panen ±{tanggalPendek(p.tanggal_panen)}</span>
      </div>
      <div className="grid3">
        <div className="mini"><small>Umur</small><b>{r.umur_hari} hari</b></div>
        <div className="mini"><small>Sisa</small><b>{p.sisa_hari} hari</b></div>
        <div className="mini"><small>Rentang</small><b>{tanggalPendek(p.tanggal_terawal).slice(0, -5)}–{tanggalPendek(p.tanggal_terlambat).slice(0, -5)}</b></div>
      </div>
      <div className="grid3">
        <div className="mini"><small>Suhu</small><b>{angka(c.suhu, "°C")}</b></div>
        <div className="mini"><small>Hujan</small><b>{angka(c.curah_hujan_mm, " mm")}</b></div>
        <div className="mini"><small>Lembap</small><b>{angka(c.kelembapan, "%")}</b></div>
      </div>
      {p.catatan.length > 0 && <ul className="catatan">{p.catatan.map((t, i) => <li key={i}>{t}</li>)}</ul>}
      <button className="btn ghost" onClick={() => onHitung(k.id)} disabled={sibuk}>
        {sibuk ? "Menyimpan..." : "Simpan prediksi ke riwayat"}
      </button>
    </div>
  );
}

export default function Beranda() {
  const { sesi } = useAuth();
  const [st, setSt] = useState({ memuat: true, galat: "", total: 0, data: [] });
  const [sibuk, setSibuk] = useState(null);
  const [info, setInfo] = useState("");

  const muat = useCallback(async () => {
    setSt((s) => ({ ...s, memuat: true, galat: "" }));
    try {
      const daftar = await kebun.daftar();
      const hasil = await Promise.allSettled(daftar.slice(0, 6).map((k) => kebun.ringkasan(k.id)));
      setSt({
        memuat: false, galat: "", total: daftar.length,
        data: hasil.map((h, i) => ({ k: daftar[i], r: h.status === "fulfilled" ? h.value : null })),
      });
    } catch (e) {
      setSt({ memuat: false, galat: e.message, total: 0, data: [] });
    }
  }, []);
  useEffect(() => { muat(); }, [muat]);

  const hitung = async (id) => {
    setSibuk(id);
    setInfo("");
    try {
      await kebun.hitungPrediksi(id);
      setInfo("Prediksi tersimpan ke riwayat kebun.");
    } catch (e) {
      setInfo(e.message);
    } finally {
      setSibuk(null);
    }
  };

  const terdekat = st.data.filter((d) => d.r).sort((a, b) => a.r.prediksi.sisa_hari - b.r.prediksi.sisa_hari)[0];

  return (
    <Portal aktif="/beranda" judul="Ringkasan kebun Anda" sub={`${sapaan()}, ${namaDepan(sesi.nama)}. ${tanggalPanjang()}`}>
      {st.memuat && <p className="muted" role="status">Memuat data kebun dan cuaca...</p>}
      {st.galat && (
        <Alert>{st.galat} <button className="link" onClick={muat}>Coba lagi</button></Alert>
      )}
      {!st.memuat && !st.galat && st.total === 0 && (
        <Kosong judul="Belum ada kebun" teks="Tambahkan kebun pertama Anda untuk melihat estimasi waktu panen."
          aksi={<button className="btn" onClick={() => go("/kebun")}>Tambah kebun</button>} />
      )}
      {!st.memuat && st.total > 0 && (
        <>
          <div className="grid2">
            <div className="kartu stat"><b>{st.total}</b><span>kebun terdaftar</span></div>
            <div className="kartu stat">
              <b>{terdekat ? `${terdekat.r.prediksi.sisa_hari} hari` : "-"}</b>
              <span>{terdekat ? `panen terdekat · ${terdekat.k.nama_kebun}` : "panen terdekat"}</span>
            </div>
          </div>
          <Alert tone="hijau">{info}</Alert>
          {st.data.map((d) => <Kartu key={d.k.id} item={d} onHitung={hitung} sibuk={sibuk === d.k.id} />)}
          {st.total > 6 && <p className="muted">Menampilkan 6 dari {st.total} kebun. Lihat semuanya di Data Kebun.</p>}
        </>
      )}
    </Portal>
  );
}
