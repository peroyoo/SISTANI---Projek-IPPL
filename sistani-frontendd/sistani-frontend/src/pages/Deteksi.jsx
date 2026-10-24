import { useEffect, useRef, useState } from "react";
import { kebun, kerusakan } from "../api/index.js";
import { useAuth } from "../context/Auth.jsx";
import { Alert, Field, Ikon, Judul, Portal } from "../components/ui.jsx";
import { Hasil } from "../components/Diagnosis.jsx";
import { FORMAT_FOTO, MAKS_FOTO_MB } from "../lib/config.js";

const ukuran = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1).replace(".", ",")} MB` : `${Math.ceil(b / 1024)} KB`);

export default function Deteksi() {
  const { premium, muatPremium } = useAuth();
  const [daftarKebun, setDaftarKebun] = useState([]);
  const [kebunId, setKebunId] = useState("");
  const [file, setFile] = useState(null);
  const [pratinjau, setPratinjau] = useState("");
  const [galatFile, setGalatFile] = useState("");
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState("");
  const [hasil, setHasil] = useState(null);
  const inp = useRef(null);

  useEffect(() => { kebun.daftar().then(setDaftarKebun).catch(() => {}); muatPremium(); }, [muatPremium]);
  useEffect(() => () => { if (pratinjau) URL.revokeObjectURL(pratinjau); }, [pratinjau]);

  const pilih = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setGalatFile("");
    if (!FORMAT_FOTO.includes(f.type)) { setGalatFile("Format foto harus JPG, PNG, atau WEBP."); return; }
    if (f.size > MAKS_FOTO_MB * 1048576) { setGalatFile(`Ukuran foto maksimal ${MAKS_FOTO_MB} MB.`); return; }
    setFile(f);
    setPratinjau(URL.createObjectURL(f));
    setHasil(null);
    setGalat("");
  };

  const analisis = async () => {
    setProses(true);
    setGalat("");
    try {
      const d = await kerusakan.foto(file, kebunId ? Number(kebunId) : null);
      setHasil(d);
    } catch (e) {
      setGalat(e.status === 503 ? "Model analisis foto belum siap di server. Silakan coba lagi nanti atau gunakan laporan teks." : e.message);
      if (e.status === 403) muatPremium();
    } finally {
      setProses(false);
    }
  };

  const ulang = () => { setFile(null); setPratinjau(""); setHasil(null); setGalat(""); };
  const aktif = !!premium?.premium_aktif;
  const k = daftarKebun.find((x) => String(x.id) === kebunId);

  return (
    <Portal aktif="/deteksi" krumb="Deteksi Penyakit">
      <Judul eyebrow="Asisten tanaman" judul="Deteksi penyakit dengan AI" sub="Unggah foto daun untuk mengenali indikasi penyakit dan langkah penanganan awal." />

      {premium && !aktif && (
        <div className="kartu kartu-sorot">
          <h2>Fitur khusus Premium</h2>
          <p>Deteksi dari foto memakai model analisis gambar, sehingga hasilnya lebih akurat. Anda tetap bisa memakai laporan teks secara gratis.</p>
          <div className="aksi">
            <a className="btn primer" href="#/premium">Upgrade ke Premium <Ikon n="miring" /></a>
            <a className="btn sekunder" href="#/kerusakan">Laporan teks (gratis)</a>
          </div>
        </div>
      )}

      {(aktif || !premium) && (
        <>
          <section className="kartu">
            <h3>Foto tanaman <span className="wajib">*</span></h3>
            <p className="kecil">JPG, PNG, atau WEBP · Maks. {MAKS_FOTO_MB} MB · 1 foto. Pastikan daun terlihat jelas dan cukup terang.</p>
            <Alert>{galatFile}</Alert>
            <div className="unggah">
              <input ref={inp} id="berkas" type="file" accept={FORMAT_FOTO.join(",")} onChange={pilih} disabled={!aktif} />
              {pratinjau ? (
                <>
                  <img className="pratinjau" src={pratinjau} alt="Pratinjau foto tanaman" style={{ marginTop: 0 }} />
                  <div className="info-file">
                    <Ikon n="gambar" />
                    <div style={{ flex: 1, minWidth: 0 }}><b style={{ overflowWrap: "anywhere" }}>{file.name}</b><div className="kecil">{ukuran(file.size)} · Berkas valid</div></div>
                    <Ikon n="centang" />
                  </div>
                  <button className="btn sekunder penuh" type="button" onClick={() => inp.current.click()} disabled={proses}><Ikon n="unggah" /> Ganti foto</button>
                </>
              ) : (
                <button className="btn sekunder penuh" type="button" onClick={() => inp.current.click()} disabled={!aktif}><Ikon n="unggah" /> Pilih foto tanaman</button>
              )}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <Field label="Kebun (opsional)" hint="Kaitkan hasil deteksi dengan salah satu kebun Anda.">
                <select value={kebunId} onChange={(e) => setKebunId(e.target.value)} disabled={!aktif}>
                  <option value="">Tidak dikaitkan ke kebun</option>
                  {daftarKebun.map((x) => <option key={x.id} value={x.id}>{x.nama_kebun}</option>)}
                </select>
              </Field>
            </div>
            <Alert>{galat}</Alert>
            <button className="btn primer penuh" disabled={!file || proses || !aktif} onClick={analisis}>
              {proses ? <><span className="muat" /> Menganalisis foto</> : "Analisis foto"}
            </button>
          </section>

          {proses && (
            <div style={{ margin: "1rem 0" }} aria-live="polite">
              <div className="aksi" style={{ justifyContent: "space-between" }}><span><Ikon n="info" /> Sedang menganalisis</span></div>
              <div className="progres jalan"><span /></div>
            </div>
          )}
          {hasil && (
            <>
              <div style={{ margin: "1rem 0" }}>
                <div className="aksi" style={{ justifyContent: "space-between" }}><span><Ikon n="centang" /> Analisis selesai</span><b>100%</b></div>
                <div className="progres"><span style={{ width: "100%" }} /></div>
                <p className="kecil">Foto berhasil dianalisis. Hasil tersedia di bawah.</p>
              </div>
              <Hasil d={hasil} tanaman={k ? k.nama_kebun : null} />
              <button className="btn primer penuh" style={{ marginTop: "1rem" }} onClick={ulang}><Ikon n="gambar" /> Analisis foto lain</button>
            </>
          )}
        </>
      )}
    </Portal>
  );
}
