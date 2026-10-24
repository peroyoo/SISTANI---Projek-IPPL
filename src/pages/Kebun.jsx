import { useCallback, useEffect, useState } from "react";
import { kebun, referensi } from "../api/index.js";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Field, Kosong, Portal } from "../components/ui.jsx";
import { hariIniISO, kodeKebun, tanggalPendek } from "../lib/format.js";

const KOSONG = { nama_kebun: "", jenis_sayur: "", tanggal_tanam: "", jenis_tanah: "", lokasi: "" };

function Form({ ref_, awal, onSimpan, onBatal }) {
  const [f, setF] = useState(awal || KOSONG);
  const [galat, setGalat] = useState({});
  const [umum, setUmum] = useState("");
  const [kirim, setKirim] = useState(false);
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const g = {};
    if (f.nama_kebun.trim().length < 2) g.nama_kebun = "Nama kebun minimal 2 karakter.";
    if (!f.jenis_sayur) g.jenis_sayur = "Pilih jenis sayur.";
    if (!f.tanggal_tanam) g.tanggal_tanam = "Tanggal tanam wajib diisi.";
    else if (f.tanggal_tanam > hariIniISO()) g.tanggal_tanam = "Tanggal tanam tidak boleh di masa depan.";
    if (!f.jenis_tanah) g.jenis_tanah = "Pilih jenis tanah.";
    if (f.lokasi.trim().length < 2) g.lokasi = "Lokasi wajib diisi (nama desa/kota).";
    setGalat(g);
    setUmum("");
    if (Object.keys(g).length) return;
    setKirim(true);
    try {
      await onSimpan({ ...f, nama_kebun: f.nama_kebun.trim(), lokasi: f.lokasi.trim() });
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) setGalat(err.fields);
      else setUmum(err.message);
      setKirim(false);
    }
  };

  return (
    <form className="kartu" onSubmit={submit} noValidate>
      <h3>{awal ? "Ubah data kebun" : "Tambah data kebun"}</h3>
      <Alert>{umum}</Alert>
      <Field label="Nama kebun" error={galat.nama_kebun}>
        <input value={f.nama_kebun} onChange={ubah("nama_kebun")} placeholder="Contoh: Kebun Sukamaju" />
      </Field>
      <Field label="Jenis sayur" error={galat.jenis_sayur}>
        <select value={f.jenis_sayur} onChange={ubah("jenis_sayur")}>
          <option value="">Pilih jenis sayur</option>
          {ref_.jenis_sayur.map((s) => <option key={s.kode} value={s.kode}>{s.nama}</option>)}
        </select>
      </Field>
      <Field label="Tanggal tanam" error={galat.tanggal_tanam}>
        <input type="date" max={hariIniISO()} value={f.tanggal_tanam} onChange={ubah("tanggal_tanam")} />
      </Field>
      <Field label="Jenis tanah" error={galat.jenis_tanah}>
        <select value={f.jenis_tanah} onChange={ubah("jenis_tanah")}>
          <option value="">Pilih jenis tanah</option>
          {ref_.jenis_tanah.map((s) => <option key={s.kode} value={s.kode}>{s.nama}</option>)}
        </select>
      </Field>
      <Field label="Lokasi" error={galat.lokasi} hint="Nama desa atau kota. Koordinat dicari otomatis untuk data cuaca.">
        <input value={f.lokasi} onChange={ubah("lokasi")} placeholder="Contoh: Samarinda" />
      </Field>
      <div className="baris">
        <button type="button" className="btn ghost" onClick={onBatal}>Batal</button>
        <button className="btn" disabled={kirim}>{kirim ? "Menyimpan..." : "Simpan"}</button>
      </div>
    </form>
  );
}

export default function Kebun() {
  const { sesi } = useAuth();
  const [daftar, setDaftar] = useState(null);
  const [ref_, setRef] = useState(null);
  const [galat, setGalat] = useState("");
  const [form, setForm] = useState(null); // null | "baru" | objek kebun
  const [cari, setCari] = useState("");
  const [info, setInfo] = useState("");

  const muat = useCallback(async () => {
    setGalat("");
    try {
      const [d, r] = await Promise.all([kebun.daftar(), referensi()]);
      setDaftar(d);
      setRef(r);
    } catch (e) {
      setGalat(e.message);
    }
  }, []);
  useEffect(() => { muat(); }, [muat]);

  const simpan = async (data) => {
    if (form === "baru") await kebun.tambah(data);
    else await kebun.ubah(form.id, data);
    setInfo(form === "baru" ? "Kebun berhasil ditambahkan." : "Data kebun diperbarui.");
    setForm(null);
    await muat();
  };

  const hapus = async (k) => {
    if (!window.confirm(`Hapus "${k.nama_kebun}"? Riwayat prediksinya ikut terhapus.`)) return;
    try {
      await kebun.hapus(k.id);
      setInfo("Kebun dihapus.");
      await muat();
    } catch (e) {
      setGalat(e.message);
    }
  };

  const nama = (list, kode) => list?.find((x) => x.kode === kode)?.nama || kode;
  const tampil = (daftar || []).filter((k) => `${k.nama_kebun} ${k.lokasi}`.toLowerCase().includes(cari.toLowerCase()));

  return (
    <Portal aktif="/kebun" judul="Data Kebun" sub={`Kelola kebun milik ${sesi.nama}.`}>
      <Alert>{galat}</Alert>
      <Alert tone="hijau">{info}</Alert>
      {form && ref_ ? (
        <Form ref_={ref_} awal={form === "baru" ? null : {
          nama_kebun: form.nama_kebun, jenis_sayur: form.jenis_sayur, tanggal_tanam: form.tanggal_tanam,
          jenis_tanah: form.jenis_tanah, lokasi: form.lokasi,
        }} onSimpan={simpan} onBatal={() => setForm(null)} />
      ) : (
        <>
          <div className="baris">
            <span>{daftar ? `${daftar.length} kebun terdaftar` : "Memuat..."}</span>
            <button className="btn kecilbtn" disabled={!ref_} onClick={() => { setInfo(""); setForm("baru"); }}>+ Tambah Data</button>
          </div>
          <input className="cari" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama kebun atau lokasi..." />
          {daftar && daftar.length === 0 && <Kosong judul="Belum ada kebun" teks="Klik Tambah Data untuk mencatat kebun pertama Anda." />}
          {daftar && daftar.length > 0 && tampil.length === 0 && <p className="muted">Tidak ada kebun yang cocok.</p>}
          {tampil.map((k) => (
            <div className="kartu" key={k.id}>
              <div className="baris"><small className="muted">{kodeKebun(k.id)}</small><small className="muted">Tanam {tanggalPendek(k.tanggal_tanam)}</small></div>
              <h3>{k.nama_kebun}</h3>
              <p className="muted">{k.lokasi}</p>
              <div className="grid2">
                <div className="mini"><small>Komoditas</small><b>{nama(ref_?.jenis_sayur, k.jenis_sayur)}</b></div>
                <div className="mini"><small>Jenis tanah</small><b>{nama(ref_?.jenis_tanah, k.jenis_tanah)}</b></div>
              </div>
              <div className="baris aksi">
                <button className="link" onClick={() => { setInfo(""); setForm(k); }}>Ubah</button>
                <button className="link bahaya" onClick={() => hapus(k)}>Hapus</button>
              </div>
            </div>
          ))}
        </>
      )}
    </Portal>
  );
}
