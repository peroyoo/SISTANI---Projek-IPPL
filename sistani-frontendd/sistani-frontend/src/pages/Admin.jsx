import { useCallback, useEffect, useRef, useState } from "react";
import { admin } from "../api/index.js";
import { Alert, Dialog, Ikon, Judul, Konfirmasi, Kosong, Memuat, Portal, toast } from "../components/ui.jsx";
import { rupiah, tanggalPendek, waktuLengkap } from "../lib/format.js";

const n = (x) => Number(x || 0).toLocaleString("id-ID");
const Kotak = ({ nilai, label, children }) => <div><div className="nilai">{nilai}</div><div className="label">{label}</div>{children}</div>;

export function AdminLaporan() {
  const [l, setL] = useState(null);
  const [galat, setGalat] = useState("");
  const muat = useCallback(() => {
    setGalat("");
    admin.laporan().then(setL).catch((e) => setGalat(e.message));
  }, []);
  useEffect(() => { muat(); }, [muat]);

  const maks = l ? Math.max(1, ...l.diagnosis_terbanyak.map((d) => d.jumlah)) : 1;
  return (
    <Portal aktif="/admin" krumb="Laporan sistem">
      <Judul judul="Laporan sistem" sub="Ringkasan pemakaian SISTANI." />
      <div className="aksi" style={{ marginBottom: "1rem" }}><button className="btn sekunder kecil" onClick={muat}>Segarkan</button></div>
      <Alert>{galat}</Alert>
      {!l && !galat && <Memuat />}
      {l && (
        <>
          <div className="kepala-bagian"><h2>Petani</h2></div>
          <div className="statistik">
            <Kotak nilai={n(l.total_petani)} label="Total petani terdaftar" />
            <Kotak nilai={n(l.petani_aktif)} label="Akun aktif" />
            <Kotak nilai={n(l.petani_nonaktif)} label="Akun dinonaktifkan" />
            <Kotak nilai={n(l.premium_aktif)} label="Petani Premium aktif" />
          </div>
          <div className="kepala-bagian"><h2>Pemakaian fitur</h2></div>
          <div className="statistik">
            <Kotak nilai={n(l.total_kebun)} label="Kebun tercatat" />
            <Kotak nilai={n(l.total_prediksi)} label="Perkiraan panen tersimpan" />
            <Kotak nilai={n(l.diagnosis_teks)} label="Diagnosis lewat teks" />
            <Kotak nilai={n(l.diagnosis_foto)} label="Diagnosis lewat foto" />
          </div>
          <div className="kepala-bagian"><h2>Premium</h2></div>
          <div className="statistik n2">
            <Kotak nilai={n(l.pembayaran_menunggu)} label="Pembayaran menunggu verifikasi">
              {l.pembayaran_menunggu > 0 && <a href="#/admin/pembayaran">Buka verifikasi</a>}
            </Kotak>
            <Kotak nilai={rupiah(l.pendapatan_total)} label="Total pembayaran disetujui" />
          </div>
          <div className="kepala-bagian"><h2>Diagnosis yang paling sering</h2></div>
          <section className="kartu">
            {l.diagnosis_terbanyak.length === 0 && <p className="kecil" style={{ margin: 0 }}>Belum ada diagnosis yang dilakukan.</p>}
            {l.diagnosis_terbanyak.map((d) => (
              <div className="batang" key={d.nama}>
                <span>{d.nama}</span>
                <span className="jalur"><span style={{ width: `${(d.jumlah / maks) * 100}%` }} /></span>
                <span className="jml">{n(d.jumlah)}</span>
              </div>
            ))}
          </section>
        </>
      )}
    </Portal>
  );
}

const PER = 20;
export function AdminPetani() {
  const [data, setData] = useState(null);
  const [galat, setGalat] = useState("");
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState("");
  const [hal, setHal] = useState(1);
  const [tanya, setTanya] = useState(null);
  const tunda = useRef(null);
  const [q, setQ] = useState("");

  const muat = useCallback(async () => {
    setGalat("");
    try { setData(await admin.petani({ halaman: hal, per_halaman: PER, cari: q, aktif: status })); }
    catch (e) { setGalat(e.message); setData([]); }
  }, [hal, q, status]);
  useEffect(() => { muat(); }, [muat]);

  const ketik = (v) => {
    setCari(v);
    clearTimeout(tunda.current);
    tunda.current = setTimeout(() => { setHal(1); setQ(v.trim()); }, 350);
  };

  const ubahStatus = async () => {
    const p = tanya;
    setTanya(null);
    try {
      const r = await admin.ubahStatusPetani(p.id, !p.aktif);
      toast(r?.pesan || "Status akun diperbarui.");
      muat();
    } catch (e) { toast(e.message, "galat"); }
  };

  return (
    <Portal aktif="/admin/petani" krumb="Data petani">
      <Judul judul="Data petani" sub="Cari petani dan kelola status akunnya." />
      <div className="filter-baris" style={{ gridTemplateColumns: "1fr 180px" }}>
        <label className="cari" style={{ margin: 0 }}><Ikon n="cari" /><input value={cari} onChange={(e) => ketik(e.target.value)} placeholder="Cari nama atau email..." aria-label="Cari petani" /></label>
        <select aria-label="Status akun" value={status} onChange={(e) => { setHal(1); setStatus(e.target.value); }}>
          <option value="">Semua status</option><option value="true">Aktif</option><option value="false">Dinonaktifkan</option>
        </select>
      </div>
      <Alert>{galat}</Alert>
      {data === null && <Memuat />}
      {data && data.length === 0 && !galat && <Kosong judul="Tidak ada petani yang cocok" teks="Ubah kata pencarian atau filter status." />}
      {data && data.length > 0 && (
        <div className="tabel-bungkus">
          <table>
            <thead><tr><th>Nama</th><th>Email</th><th className="angka">Kebun</th><th>Paket</th><th>Status</th><th>Terdaftar</th><th>Aksi</th></tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td><b>{p.nama}</b></td><td>{p.email}</td><td className="angka">{p.jumlah_kebun}</td>
                  <td>{p.premium_aktif ? <><span className="lencana lime">Premium</span><div className="kecil">sampai {tanggalPendek(p.premium_sampai)}</div></> : <span className="lencana abu">Dasar</span>}</td>
                  <td>{p.aktif ? <span className="lencana">Aktif</span> : <span className="lencana merah">Dinonaktifkan</span>}</td>
                  <td>{tanggalPendek(p.dibuat_pada)}</td>
                  <td><button className={`btn kecil ${p.aktif ? "bahaya" : "sekunder"}`} onClick={() => setTanya(p)}>{p.aktif ? "Nonaktifkan" : "Aktifkan"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="halaman-nav">
        <button className="btn teks kecil" disabled={hal <= 1} onClick={() => setHal(hal - 1)}>← Sebelumnya</button>
        <span className="no">Halaman {hal}</span>
        <button className="btn teks kecil" disabled={!data || data.length < PER} onClick={() => setHal(hal + 1)}>Berikutnya →</button>
      </div>
      <Konfirmasi buka={!!tanya} bahaya={!!tanya?.aktif} tombol={tanya?.aktif ? "Nonaktifkan" : "Aktifkan"}
        judul={tanya?.aktif ? "Nonaktifkan akun ini?" : "Aktifkan akun ini?"}
        isi={tanya ? (tanya.aktif ? `${tanya.nama} tidak akan bisa masuk sampai akunnya diaktifkan kembali.` : `${tanya.nama} akan bisa masuk kembali.`) : ""}
        onYa={ubahStatus} onBatal={() => setTanya(null)} />
    </Portal>
  );
}

const METODE = { transfer_bank: "Transfer bank", qris: "QRIS", e_wallet: "E-wallet" };
const KOSONG_TEKS = { menunggu: "Tidak ada pembayaran yang menunggu verifikasi.", disetujui: "Belum ada pembayaran yang disetujui.", ditolak: "Belum ada pembayaran yang ditolak." };

export function AdminPembayaran() {
  const [status, setStatus] = useState("menunggu");
  const [data, setData] = useState(null);
  const [galat, setGalat] = useState("");
  const [aksi, setAksi] = useState(null); // { p, jenis }
  const [catatan, setCatatan] = useState("");
  const [kirim, setKirim] = useState(false);

  const muat = useCallback(async () => {
    setGalat("");
    setData(null);
    try { setData(await admin.pembayaran(status)); } catch (e) { setGalat(e.message); setData([]); }
  }, [status]);
  useEffect(() => { muat(); }, [muat]);

  const proses = async (e) => {
    e.preventDefault();
    setKirim(true);
    try {
      await (aksi.jenis === "setujui" ? admin.setujui : admin.tolak)(aksi.p.id, catatan.trim());
      toast(aksi.jenis === "setujui" ? "Pembayaran disetujui." : "Pembayaran ditolak.");
    } catch (err) { toast(err.message, "galat"); }
    setKirim(false);
    setAksi(null);
    setCatatan("");
    muat();
  };

  const setuju = aksi?.jenis === "setujui";
  return (
    <Portal aktif="/admin/pembayaran" krumb="Verifikasi premium">
      <Judul judul="Verifikasi pembayaran premium" sub="Periksa pembayaran petani, lalu setujui atau tolak." />
      <div className="tab-baris" role="tablist">
        {[["menunggu", "Menunggu"], ["disetujui", "Disetujui"], ["ditolak", "Ditolak"]].map(([k, t]) => (
          <button key={k} role="tab" className="tab" aria-selected={status === k} onClick={() => setStatus(k)}>{t}</button>
        ))}
      </div>
      <Alert>{galat}</Alert>
      {data === null && <Memuat />}
      {data && data.length === 0 && !galat && <Kosong judul={KOSONG_TEKS[status]} teks="" />}
      {data && data.length > 0 && (
        <div className="tabel-bungkus">
          <table>
            <thead><tr><th>Tanggal</th><th>Petani</th><th>Metode</th><th>Referensi</th><th className="angka">Nominal</th><th>{status === "menunggu" ? "Aksi" : "Diproses"}</th></tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>{waktuLengkap(p.dibuat_pada)}</td>
                  <td><b>{p.nama_petani}</b><div className="kecil">{p.email_petani}</div></td>
                  <td>{METODE[p.metode] || p.metode}</td>
                  <td>{p.nomor_referensi}</td>
                  <td className="angka">{rupiah(p.nominal)}</td>
                  <td>
                    {status === "menunggu" ? (
                      <div className="aksi">
                        <button className="btn primer kecil" onClick={() => setAksi({ p, jenis: "setujui" })}>Setujui</button>
                        <button className="btn sekunder kecil" onClick={() => setAksi({ p, jenis: "tolak" })}>Tolak</button>
                      </div>
                    ) : <>{waktuLengkap(p.diproses_pada)}{p.catatan_admin && <div className="kecil">{p.catatan_admin}</div>}</>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog buka={!!aksi} onTutup={() => setAksi(null)} label="Proses pembayaran">
        {aksi && (
          <form onSubmit={proses}>
            <h2>{setuju ? "Setujui pembayaran?" : "Tolak pembayaran?"}</h2>
            <p>{setuju
              ? `Premium ${aksi.p.nama_petani} akan aktif sesuai durasi paket, sebesar ${rupiah(aksi.p.nominal)} (referensi ${aksi.p.nomor_referensi}).`
              : `Pembayaran ${aksi.p.nama_petani} akan ditolak. Petani bisa mengirim pembayaran baru.`}</p>
            <div className="field"><label htmlFor="cat">Catatan untuk petani (opsional)</label>
              <input id="cat" value={catatan} onChange={(e) => setCatatan(e.target.value)} maxLength={255} /></div>
            <div className="dialog-aksi">
              <button type="button" className="btn sekunder" onClick={() => setAksi(null)}>Batal</button>
              <button className={`btn ${setuju ? "primer" : "bahaya"}`} disabled={kirim}>{kirim ? "Memproses..." : setuju ? "Setujui" : "Tolak"}</button>
            </div>
          </form>
        )}
      </Dialog>
    </Portal>
  );
}
