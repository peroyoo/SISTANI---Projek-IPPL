import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/Auth.jsx";
import { ToastArea, go } from "./components/ui.jsx";
import Landing from "./pages/Landing.jsx";
import Masuk from "./pages/Masuk.jsx";
import Daftar from "./pages/Daftar.jsx";
import Lupa from "./pages/Lupa.jsx";
import Beranda from "./pages/Beranda.jsx";
import Kebun from "./pages/Kebun.jsx";
import Riwayat from "./pages/Riwayat.jsx";
import Kerusakan from "./pages/Kerusakan.jsx";
import Deteksi from "./pages/Deteksi.jsx";
import Premium from "./pages/Premium.jsx";
import Akun from "./pages/Akun.jsx";
import { AdminLaporan, AdminPetani, AdminPembayaran } from "./pages/Admin.jsx";

function usePath() {
  const baca = () => (window.location.hash.slice(1) || "/").split("?")[0];
  const [p, setP] = useState(baca());
  useEffect(() => {
    const f = () => { setP(baca()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return p;
}

const PUBLIK = {
  "/": Landing,
  "/masuk": Masuk,
  "/daftar": Daftar,
  "/lupa": Lupa
};
const PETANI = { "/beranda": Beranda, "/kebun": Kebun, "/riwayat": Riwayat, "/kerusakan": Kerusakan, "/deteksi": Deteksi, "/premium": Premium, "/akun": Akun };
const ADMIN = { "/admin": AdminLaporan, "/admin/petani": AdminPetani, "/admin/pembayaran": AdminPembayaran, "/akun": Akun };

function Router() {
  const { sesi } = useAuth();
  const path = usePath();
  const rumah = sesi ? (sesi.role === "admin" ? "/admin" : "/beranda") : "/masuk";

  let Halaman = null;
  if (!sesi) Halaman = path === "/masuk" || path === "/daftar" || path === "/lupa" || path === "/" ? PUBLIK[path] : null;
  else if (path === "/") Halaman = Landing; // landing tetap bisa dilihat setelah masuk
  else Halaman = (sesi.role === "admin" ? ADMIN : PETANI)[path] || null;
  // Sudah masuk tetapi membuka halaman masuk/lupa, atau alamat tidak dikenal
  useEffect(() => {
    if (!Halaman || (sesi && (path === "/masuk" || path === "/daftar" || path === "/lupa"))) go(rumah);
  }, [Halaman, sesi, path, rumah]);

  return Halaman ? (
    <>
      <Halaman />
      {!sesi && <ToastArea />}
    </>
  ) : null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
