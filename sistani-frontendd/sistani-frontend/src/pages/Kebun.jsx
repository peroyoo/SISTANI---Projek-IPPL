import { useCallback, useEffect, useState } from "react";
import { kebun, referensi } from "../api/index.js";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Dialog, Field, Ikon, Judul, Konfirmasi, Kosong, Memuat, Portal, toast } from "../components/ui.jsx";
import { hariIniISO, kodeKebun, tanggalPendek } from "../lib/format.js";

const KOSONG = { nama_kebun: "", jenis_sayur: "", tanggal_tanam: "", jenis_tanah: "", lokasi: "" };

function Form({ ref_, awal, onSimpan, onBatal }) {
  const [f, setF] = useState(awal || { ...KOSONG, jenis_sayur: ref_.jenis_sayur[0]?.kode || "", jenis_tanah: ref_.jenis_tanah[0]?.kode || "" });
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
    if (f.lokasi.trim().length < 2) g.lokasi = "Lokasi wajib diisi (nama desa atau kota).";
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
    <form onSubmit={submit} noValidate>
      <h2>{awal ? "Ubah data kebun" : "Tambah data kebun"}</h2>
      <Alert>{umum}</Alert>
      <Field label="Nama kebun" wajib error={galat.nama_kebun}>
        <input value={f.nama_kebun} onChange={ubah("nama_kebun")} placeholder="Contoh: Kebun Sukamaju" maxLength={100} />
      </Field>
      <div className="dua-kolom">
        <Field label="Jenis sayur" wajib error={galat.jenis_sayur}>
          <select value={f.jenis_sayur} onChange={ubah("jenis_sayur")}>
            {ref_.jenis_sayur.map((s) => <option key={s.kode} value={s.kode}>{s.nama}</option>)}
          </select>
        </Field>
        <Field label="Jenis tanah" wajib error={galat.jenis_tanah}>
          <select value={f.jenis_tanah} onChange={ubah("jenis_tanah")}>
            {ref_.jenis_tanah.map((s) => <option key={s.kode} value={s.kode}>{s.nama}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Tanggal tanam" wajib error={galat.tanggal_tanam}>
        <input type="date" max={hariIniISO()} value={f.tanggal_tanam} onChange={ubah("tanggal_tanam")} />
      </Field>
      <Field label="Lokasi kebun" wajib error={galat.lokasi} hint="Tulis nama desa atau kota. Sistem mencari koordinatnya untuk mengambil data cuaca.">
        <input value={f.lokasi} onChange={ubah("lokasi")} placeholder="Contoh: Mlati, Sleman" maxLength={150} />
      </Field>
      <div className="dialog-aksi">
        <button type="button" className="btn sekunder" onClick={onBatal}>Batal</button>
        <button className="btn primer" disabled={kirim}>{kirim ? "Menyimpan..." : "Simpan"}</button>
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
  const [hapus, setHapus] = useState(null);
  const [cari, setCari] = useState("");
  const [naik, setNaik] = useState(true);

  const muat = useCallback(async () => {
    setGalat("");
    try {
      const [d, r] = await Promise.all([kebun.daftar(), referensi()]);
      setDaftar(d);
      setRef(r);
    } catch (e) {
      setGalat(e.message);
      setDaftar((x) => x ?? []);
    }
  }, []);
  useEffect(() => { muat(); }, [muat]);
  useEffect(() => {
    if (ref_ && window.location.hash.includes("tambah=1")) setForm("baru");
  }, [ref_]);

  const simpan = async (data) => {
    if (form === "baru") await kebun.tambah(data);
    else await kebun.ubah(form.id, data);
    toast(form === "baru" ? "Kebun berhasil ditambahkan." : "Data kebun diperbarui.");
    setForm(null);
    await muat();
  };

  const konfirmasiHapus = async () => {
    const k = hapus;
    setHapus(null);
    try {
      await kebun.hapus(k.id);
      toast("Kebun dihapus.");
      await muat();
    } catch (e) {
      toast(e.message, "galat");
    }
  };

  const nama = (list, kode) => list?.find((x) => x.kode === kode)?.nama || String(kode).replace(/_/g, " ");
  const tampil = (daftar || [])
    .filter((k) => `${k.nama_kebun} ${k.lokasi}`.toLowerCase().includes(cari.toLowerCase()))
    .sort((a, b) => (naik ? 1 : -1) * a.nama_kebun.localeCompare(b.nama_kebun, "id"));

  return (
    <Portal aktif="/kebun" krumb="Data Kebun">
      <Judul judul="Data Kebun" sub="Kelola informasi lahan dan komoditas yang Anda tanam." />
      <Alert>{galat}</Alert>
      {daftar === null && <Memuat teks="Memuat data kebun" />}
      {daftar && (
        <>
          <div className="ringkas-daftar">
            <div><strong>{daftar.length} kebun terdaftar</strong></div>
            <button className="btn primer" disabled={!ref_} onClick={() => setForm("baru")}><Ikon n="tambah" /> Tambah Data</button>
          </div>
          <label className="cari">
            <Ikon n="cari" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama kebun atau lokasi..." aria-label="Cari kebun" />
          </label>
          <div className="ringkas-daftar" style={{ marginBottom: ".8rem" }}>
            <span className="kecil">Menampilkan {tampil.length} dari {daftar.length} kebun</span>
            <button className="btn teks kecil" onClick={() => setNaik(!naik)}>Nama kebun {naik ? "A–Z" : "Z–A"}</button>
          </div>
          {daftar.length === 0 && !galat && (
            <Kosong judul="Belum ada kebun" teks="Tambahkan kebun pertama Anda: cukup jenis sayur, tanggal tanam, jenis tanah, dan lokasi." />
          )}
          {daftar.length > 0 && tampil.length === 0 && <p className="kecil">Tidak ada kebun yang cocok dengan pencarian.</p>}
          {tampil.map((k) => (
            <article className="kartu-kebun" key={k.id}>
              <div className="badan">
                <div className="baris-id"><span>{kodeKebun(k.id)}</span><span className="lencana">Aktif</span></div>
                <p className="ket">Nama Kebun</p>
                <p className="nilai-besar">{k.nama_kebun}</p>
                <p className="ket">Lokasi</p>
                <p className="nilai-lokasi"><Ikon n="pin" /> {k.lokasi}</p>
                <div className="dua">
                  <div><p className="ket">Komoditas</p><strong>{nama(ref_?.jenis_sayur, k.jenis_sayur)}</strong></div>
                  <div><p className="ket">Jenis tanah</p><strong>{nama(ref_?.jenis_tanah, k.jenis_tanah)}</strong></div>
                </div>
                <p className="ket" style={{ marginTop: ".8rem" }}>Ditanam {tanggalPendek(k.tanggal_tanam)}</p>
              </div>
              <div className="kaki">
                <span className="kecil">Milik {sesi.nama}</span>
                <span className="aksi">
                  <button className="btn teks" onClick={() => setForm(k)}><Ikon n="pensil" /> Edit</button>
                  <button className="btn teks merah" onClick={() => setHapus(k)}><Ikon n="sampah" /> Hapus</button>
                </span>
              </div>
            </article>
          ))}
          <div className="baris-info"><Ikon n="info" /><span>Perbarui data kebun jika komoditas atau tanggal tanam berubah agar perkiraan panen tetap akurat.</span></div>
        </>
      )}

      <Dialog buka={!!form && !!ref_} onTutup={() => setForm(null)} label="Formulir kebun">
        {form && ref_ && (
          <Form ref_={ref_} onBatal={() => setForm(null)} onSimpan={simpan}
            awal={form === "baru" ? null : {
              nama_kebun: form.nama_kebun, jenis_sayur: form.jenis_sayur, tanggal_tanam: form.tanggal_tanam,
              jenis_tanah: form.jenis_tanah, lokasi: form.lokasi,
            }} />
        )}
      </Dialog>
      <Konfirmasi buka={!!hapus} judul="Hapus kebun ini?" bahaya tombol="Hapus kebun"
        isi={hapus ? `Data ${hapus.nama_kebun} beserta riwayat perkiraannya akan dihapus dan tidak bisa dikembalikan.` : ""}
        onYa={konfirmasiHapus} onBatal={() => setHapus(null)} />
    </Portal>
  );
}
