import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/Auth.jsx";
import Masuk from "./pages/Masuk.jsx";
import Beranda from "./pages/Beranda.jsx";
import Kebun from "./pages/Kebun.jsx";
import Kerusakan from "./pages/Kerusakan.jsx";
import { Logo, go } from "./components/ui.jsx";

function usePath() {
  const baca = () => (window.location.hash.slice(1) || "/").split("?")[0];
  const [p, setP] = useState(baca());
  useEffect(() => {
    const f = () => setP(baca());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return p;
}

const HALAMAN = { "/beranda": Beranda, "/kebun": Kebun, "/kerusakan": Kerusakan };

function Router() {
  const { sesi, keluar } = useAuth();
  const path = usePath();
  const Halaman = HALAMAN[path];

  useEffect(() => {
    if (sesi && !Halaman) go("/beranda");
  }, [sesi, Halaman]);

  if (!sesi) return <Masuk />;
  if (sesi.role !== "petani") {
    return (
      <div className="tengah">
        <Logo />
        <h1>Akun admin</h1>
        <p className="sub">Dashboard admin belum tersedia di frontend ini. Gunakan halaman /docs pada backend untuk verifikasi pembayaran.</p>
        <button className="btn" onClick={keluar}>Keluar</button>
      </div>
    );
  }
  return Halaman ? <Halaman /> : null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
