import { useState } from "react";
import { useAuth } from "../context/Auth.jsx";
import { Footer, Ikon, Logo } from "../components/ui.jsx";
import { HARGA_PREMIUM_LANDING } from "../lib/config.js";
import { rupiah } from "../lib/format.js";

const FITUR = [
  { i: "tunas", t: "Cek Kerusakan Tanaman", d: "Deskripsikan kondisi tanaman Anda, sistem akan menganalisis kemungkinan penyebab kerusakan dan memberikan rekomendasi penanganan.", k: "Gratis untuk semua petani" },
  { i: "gambar", t: "Deteksi Penyakit Tanaman", d: "Unggah foto tanaman yang rusak untuk hasil diagnosis yang lebih akurat lewat analisis gambar AI.", k: "Fitur Premium" },
  { i: "riwayat", t: "Prediksi Waktu Panen", d: "Dapatkan estimasi waktu panen yang disesuaikan otomatis dengan jenis tanaman, jenis tanah, dan data cuaca terkini di lokasi kebun Anda.", k: "Otomatis & akurat" },
  { i: "peta", t: "Catat Data Kebun", d: "Simpan jenis sayur, tanggal tanam, jenis tanah, dan lokasi setiap kebun, lengkap dengan riwayat perkiraan panennya.", k: "Rapi dan mudah dicari" },
];
const LANGKAH = [
  ["01", "Daftar & catat kebun", "Buat akun gratis, lalu catat jenis tanaman, tanggal tanam, dan jenis tanah kebun Anda."],
  ["02", "Pantau & diagnosis", "Lihat estimasi waktu panen yang otomatis menyesuaikan cuaca, dan dapatkan diagnosis cepat saat tanaman menunjukkan tanda kerusakan."],
  ["03", "Panen tepat waktu", "Panen sesuai estimasi yang sudah disesuaikan kondisi lapangan, lalu lihat kembali riwayat kebun Anda kapan saja."],
];
const FAQ = [
  ["Apakah hasil diagnosis dari foto selalu akurat?", "Tidak selalu. Hasil adalah indikasi awal beserta tingkat keyakinan sistem. Jika keyakinan rendah, sistem akan memberi tahu dan menyarankan Anda berkonsultasi dengan penyuluh pertanian."],
  ["Bagaimana cara kerja prediksi waktu panen?", "Sistem memadukan jenis sayur, jenis tanah, tanggal tanam, dan data cuaca di lokasi kebun (suhu, curah hujan, kelembapan) untuk memperkirakan umur panen beserta rentang tanggalnya."],
  ["Apa bedanya paket Dasar dan Premium?", "Paket Dasar gratis untuk mengelola kebun, prediksi panen, dan laporan kerusakan lewat teks. Premium menambahkan deteksi penyakit dari foto dengan analisis gambar."],
  ["Bagaimana proses upgrade ke Premium?", "Pilih paket di menu Premium, lakukan pembayaran, lalu kirim nomor referensi transaksi. Premium aktif setelah admin memverifikasi pembayaran Anda."],
];

export default function Landing() {
  const { sesi } = useAuth();
  const [menu, setMenu] = useState(false);
  const [buka, setBuka] = useState(-1);
  const rumah = sesi ? (sesi.role === "admin" ? "#/admin" : "#/beranda") : "#/masuk";
  const tutup = () => setMenu(false);

  return (
    <div className="publik landing">
      <header className="pub-atas">
        <Logo href="#/" />
        <nav className="pub-menu-lebar" aria-label="Menu">
          <a href="#fitur" onClick={(e) => { e.preventDefault(); document.getElementById("fitur")?.scrollIntoView({ behavior: "smooth" }); }}>Fitur</a>
          <a href="#paket" onClick={(e) => { e.preventDefault(); document.getElementById("paket")?.scrollIntoView({ behavior: "smooth" }); }}>Premium</a>
          <a href={rumah} className="btn primer kecil">{sesi ? "Buka portal" : "Masuk / Daftar"}</a>
        </nav>
        <button className="ikon-tombol pub-burger" aria-label="Buka menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><Ikon n="menu" /></button>
      </header>
      {menu && (
        <div className="pub-menu" role="menu">
          <button onClick={() => { tutup(); document.getElementById("fitur")?.scrollIntoView({ behavior: "smooth" }); }}>Fitur</button>
          <button onClick={() => { tutup(); document.getElementById("paket")?.scrollIntoView({ behavior: "smooth" }); }}>Premium</button>
          <button onClick={() => { tutup(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }}>Pertanyaan umum</button>
          <a className="btn primer penuh" href={rumah}>{sesi ? "Buka portal" : "Masuk / Daftar"}</a>
        </div>
      )}

      <section className="hero">
        <div className="hero-teks">
          <h1>Bertani cerdas, panen berkualitas.</h1>
          <p>Cukup dari ponsel, kita bisa tahu kapan waktu terbaik untuk panen dan kenapa tanaman sedang rusak tanpa perlu menebak-nebak lagi.</p>
          <a className="btn primer penuh-kecil" href={rumah}>{sesi ? "Buka portal" : "Coba Sekarang, Gratis"} <Ikon n="kanan" /></a>
        </div>
        <div className="hero-foto">
          <img src="/hero.jpg" alt="Petani merawat tanaman di sawah" />
          <span className="hero-label"><i /> Lahan sehat, petani sejahtera</span>
          <div className="hero-kartu">
            <div><Ikon n="awan" /><b>Cuaca</b><small>sesuai lokasi kebun</small></div>
            <div><Ikon n="tunas" /><b>Umur tanaman</b><small>dihitung otomatis</small></div>
            <div><Ikon n="riwayat" /><b>Waktu panen</b><small>lengkap dengan rentang</small></div>
          </div>
        </div>
      </section>

      <section className="bagian" id="fitur">
        <p className="eyebrow">Satu platform, banyak manfaat</p>
        <h2>Semua yang Anda butuhkan untuk tumbuh.</h2>
        <p className="redup">Teknologi yang dekat dengan keseharian petani. Sederhana digunakan, nyata manfaatnya.</p>
        <div className="fitur-grid">
          {FITUR.map((f) => (
            <article className="kartu fitur" key={f.t}>
              <span className="fitur-ikon"><Ikon n={f.i} /></span>
              <h3>{f.t}</h3>
              <p className="redup">{f.d}</p>
              <div className="fitur-kaki"><span>{f.k}</span><Ikon n="miring" kelas="kecil" /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="bagian mint">
        <div className="dua-bagian">
          <div>
            <p className="eyebrow">Kenali kebun Anda lebih baik</p>
            <h2>Data yang jelas. Panen yang lebih tepat waktu.</h2>
            <p className="redup">Tak perlu menebak kondisi lahan. Gabungkan catatan budidaya dan informasi cuaca untuk merencanakan langkah berikutnya.</p>
            <ul className="daftar-centang" style={{ borderTop: 0, padding: 0 }}>
              <li><Ikon n="centang" /> Estimasi waktu panen otomatis berdasarkan cuaca</li>
              <li><Ikon n="centang" /> Catat data kebun: jenis tanaman, tanggal tanam, jenis tanah</li>
              <li><Ikon n="centang" /> Riwayat tanam dan perkiraan panen tersimpan rapi</li>
            </ul>
            <a className="btn primer" href={rumah}>Kenali fitur pemantauan <Ikon n="kanan" /></a>
          </div>
        </div>
      </section>

      <section className="bagian">
        <div className="tengah-teks">
          <p className="eyebrow">Mudah dimulai</p>
          <h2>Tiga langkah menuju pertanian cerdas.</h2>
          <p className="redup">Mulai dari lahan Anda, berkembang bersama kami.</p>
        </div>
        <div className="langkah-grid">
          {LANGKAH.map(([n, t, d]) => (
            <div key={n}>
              <div className="langkah-no"><span>{n}</span><hr /></div>
              <h3>{t}</h3>
              <p className="redup">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bagian" id="paket">
        <div className="tengah-teks">
          <p className="eyebrow">Investasi untuk pertumbuhan</p>
          <h2>Mulai gratis. Tumbuh dengan Premium.</h2>
          <p className="redup">Pilih dukungan yang sesuai kebutuhan lahan Anda. Harga sederhana, manfaat yang berkelanjutan.</p>
        </div>
        <div className="paket-grid">
          <article className="kartu paket">
            <h3>Petani Dasar</h3>
            <p className="redup">Cukup untuk mengelola kebun dan memantau waktu panen</p>
            <div className="harga-besar">Rp0</div>
            <p className="kecil">gratis selamanya · tanpa kartu kredit</p>
            <a className="btn sekunder penuh" href="#/masuk">Daftar akun gratis</a>
            <ul className="daftar-centang" style={{ borderTop: 0, paddingTop: 0 }}>
              <li><Ikon n="centang" /> Kelola data kebun (jenis tanaman, tanggal tanam, jenis tanah)</li>
              <li><Ikon n="centang" /> Prediksi waktu panen otomatis</li>
              <li><Ikon n="centang" /> Lapor kerusakan tanaman via deskripsi teks</li>
              <li><Ikon n="centang" /> Riwayat tanam dan perkiraan panen</li>
            </ul>
          </article>
          <article className="kartu paket gelap">
            <div className="judul-kartu"><h3>Premium</h3><span className="lencana lime">PILIHAN PETANI</span></div>
            <p>Untuk diagnosis kerusakan tanaman yang lebih akurat</p>
            <div className="harga-besar">{rupiah(HARGA_PREMIUM_LANDING)}</div>
            <p className="kecil">per 30 hari · tanpa langganan otomatis</p>
            <a className="btn terang penuh" href="#/masuk">Mulai berlangganan Premium <Ikon n="kanan" /></a>
            <ul className="daftar-centang" style={{ borderTop: 0, paddingTop: 0 }}>
              <li><Ikon n="centang" /> Semua fitur Petani Dasar</li>
              <li><Ikon n="centang" /> Deteksi penyakit tanaman dari foto</li>
              <li><Ikon n="centang" /> Hasil diagnosis lebih akurat (model AI klasifikasi gambar)</li>
              <li><Ikon n="centang" /> Rekomendasi penanganan lebih spesifik</li>
            </ul>
          </article>
        </div>
        <p className="kecil" style={{ textAlign: "center", marginTop: "1.2rem" }}><Ikon n="perisai" kelas="kecil" /> Pembayaran diverifikasi admin · Tidak ada biaya tersembunyi</p>
      </section>

      <section className="bagian putih" id="faq">
        <div className="faq-isi">
          <p className="eyebrow">Kami siap membantu</p>
          <h2>Ada pertanyaan?</h2>
          <p className="redup">Temukan jawaban sebelum memulai perjalanan pertanian cerdas Anda.</p>
          <div className="faq-daftar">
            {FAQ.map(([q, a], i) => (
              <div className="faq" key={q}>
                <button aria-expanded={buka === i} onClick={() => setBuka(buka === i ? -1 : i)}>
                  <span>{q}</span><Ikon n={buka === i ? "minus" : "tambah"} />
                </button>
                {buka === i && <p className="redup">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="dalam">
          <h2>Musim yang lebih baik dimulai hari ini.</h2>
          <p>Bawa usaha tani Anda selangkah lebih maju. Kami tumbuh bersama Anda.</p>
          <a className="btn primer" href={rumah}>{sesi ? "Buka portal" : "Daftar gratis sekarang"} <Ikon n="kanan" /></a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
