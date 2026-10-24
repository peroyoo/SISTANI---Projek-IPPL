import { useCallback, useEffect, useState } from "react";
import { premium as api } from "../api/index.js";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Field, Ikon, Judul, Memuat, Portal, toast } from "../components/ui.jsx";
import { rupiah, tanggalPendek, waktuLengkap } from "../lib/format.js";

const METODE = { transfer_bank: "Transfer bank", qris: "QRIS", e_wallet: "E-wallet" };
const STATUS = { menunggu: ["Menunggu verifikasi", "kuning"], disetujui: ["Disetujui", ""], ditolak: ["Ditolak", "merah"] };
const MANFAAT = [
  "Deteksi penyakit tanaman dari foto",
  "Hasil diagnosis lebih akurat (model analisis gambar)",
  "Rekomendasi penanganan lebih spesifik",
];

export default function Premium() {
  const { muatPremium } = useAuth();
  const [st, setSt] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [galat, setGalat] = useState("");
  const [metode, setMetode] = useState("transfer_bank");
  const [ref, setRef] = useState("");
  const [galatRef, setGalatRef] = useState("");
  const [umum, setUmum] = useState("");
  const [kirim, setKirim] = useState(false);

  const muat = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([api.status(), api.riwayat()]);
      setSt(s);
      setRiwayat(r);
      muatPremium();
    } catch (e) {
      setGalat(e.message);
    }
  }, [muatPremium]);
  useEffect(() => { muat(); }, [muat]);

  const bayar = async (e) => {
    e.preventDefault();
    setUmum("");
    if (ref.trim().length < 4) { setGalatRef("Isi nomor referensi pembayaran, minimal 4 karakter."); return; }
    setGalatRef("");
    setKirim(true);
    try {
      await api.upgrade(metode, ref.trim());
      setRef("");
      toast("Pembayaran terkirim. Menunggu verifikasi admin.");
      await muat();
    } catch (err) {
      setUmum(err.message);
    } finally {
      setKirim(false);
    }
  };

  const aktif = st?.premium_aktif;
  const menunggu = st?.pembayaran_terakhir?.status === "menunggu";

  return (
    <Portal aktif="/premium" krumb="Premium">
      <Judul eyebrow="Layanan premium" judul="Upgrade ke SISTANI Premium" sub="Buka deteksi penyakit dari foto dengan analisis gambar yang lebih akurat." />
      <Alert>{galat}</Alert>
      {!st && !galat && <Memuat teks="Memuat status paket" />}
      {st && (
        <>
          {aktif ? (
            <Alert tone="sukses" judul="Premium aktif">Berlaku sampai {tanggalPendek(st.premium_sampai)}. Jika memperpanjang, masa aktif ditambahkan ke sisa waktu Anda.</Alert>
          ) : menunggu ? (
            <Alert tone="waspada" judul="Menunggu verifikasi">Pembayaran Anda sedang diperiksa admin. Premium aktif setelah pembayaran diverifikasi.</Alert>
          ) : (
            <Alert tone="waspada" judul="Premium belum aktif">Pilih paket di bawah, lalu kirim data pembayaran untuk diverifikasi admin.</Alert>
          )}

          <div className="kepala-bagian"><h2>Paket premium</h2></div>
          <div className="paket-pilih">
            <div className="judul-kartu"><h3>Bulanan</h3><span className="lencana">Dipilih</span></div>
            <div className="harga">{rupiah(st.harga)} <small>/ {st.durasi_hari} hari</small></div>
            <p className="kecil" style={{ margin: 0 }}>Pembayaran satu kali per periode, tanpa langganan otomatis.</p>
            <ul className="daftar-centang">
              <li><Ikon n="centang" /> Semua fitur paket Dasar</li>
              {MANFAAT.map((m) => <li key={m}><Ikon n="centang" /> {m}</li>)}
            </ul>
          </div>

          {!menunggu && (
            <>
              <section className="kartu" style={{ marginTop: "1rem" }}>
                <h2>Rincian pembayaran</h2>
                <div className="tagihan"><span>Premium {st.durasi_hari} hari</span><span>{rupiah(st.harga)}</span></div>
                <div className="tagihan"><span>Biaya administrasi</span><span>Rp0</span></div>
                <div className="tagihan total"><span>Total</span><span>{rupiah(st.harga)}</span></div>
                <div className="pesan info" style={{ margin: "1rem 0 0" }}>
                  <Ikon n="info" />
                  <span>Pembayaran pada sistem ini bersifat simulasi. Setelah membayar, isi nomor referensi transaksi di bawah agar admin dapat memverifikasi.</span>
                </div>
              </section>

              <form className="kartu" onSubmit={bayar} noValidate>
                <h2>Konfirmasi pembayaran</h2>
                <Alert>{umum}</Alert>
                <Field label="Metode pembayaran" wajib>
                  <select value={metode} onChange={(e) => setMetode(e.target.value)}>
                    {Object.entries(METODE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Nomor referensi transaksi" wajib error={galatRef} hint="Contoh: TRX-20261019-001. Lihat di bukti pembayaran Anda.">
                  <input value={ref} onChange={(e) => setRef(e.target.value)} maxLength={100} placeholder="Nomor referensi" />
                </Field>
                <button className="btn primer penuh" disabled={kirim}>{kirim ? "Mengirim..." : "Kirim konfirmasi pembayaran"}</button>
                <p className="kecil" style={{ margin: ".8rem 0 0" }}>Premium aktif setelah pembayaran diverifikasi admin.</p>
              </form>
            </>
          )}

          <div className="kepala-bagian"><h2>Riwayat pembayaran</h2></div>
          {riwayat.length === 0 ? (
            <p className="kecil">Belum ada pembayaran.</p>
          ) : (
            <div className="kartu" style={{ padding: "0 1.25rem" }}>
              {riwayat.map((p) => {
                const [t, w] = STATUS[p.status] || [p.status, "abu"];
                return (
                  <div className="siklus" key={p.id}>
                    <div className="atas">
                      <span className="kode">{waktuLengkap(p.dibuat_pada)}</span>
                      <span className={`lencana ${w}`}>{t}</span>
                    </div>
                    <h3>{rupiah(p.nominal)}</h3>
                    <p className="kecil" style={{ margin: 0 }}>{METODE[p.metode] || p.metode} · Ref. {p.nomor_referensi}</p>
                    {p.catatan_admin && <p className="kecil" style={{ margin: ".4rem 0 0" }}>Catatan admin: {p.catatan_admin}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Portal>
  );
}
