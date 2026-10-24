import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth, premium as apiPremium } from "../api/index.js";
import { ambilSesi, hapusSesi, pasangPenangani401, simpanSesi } from "../api/client.js";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [sesi, setSesi] = useState(ambilSesi());
  const [pesan, setPesan] = useState("");
  const [premium, setPremium] = useState(null); // status paket dari backend (hanya petani)

  const keluar = useCallback(() => {
    hapusSesi();
    setSesi(null);
    setPremium(null);
    window.location.hash = "/masuk";
  }, []);

  // Token kedaluwarsa (401) -> kembali ke halaman masuk
  useEffect(() => {
    pasangPenangani401(() => {
      hapusSesi();
      setSesi(null);
      setPremium(null);
      setPesan("Sesi Anda berakhir. Silakan masuk lagi.");
      window.location.hash = "/masuk";
    });
  }, []);

  const muatPremium = useCallback(async () => {
    try {
      const d = await apiPremium.status();
      setPremium(d);
      return d;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (sesi?.role === "petani") muatPremium();
  }, [sesi, muatPremium]);

  const masuk = async (email, password, ingat) => {
    const d = await auth.masuk(email, password);
    const s = { token: d.access_token, role: d.role, nama: d.nama };
    simpanSesi(s, ingat);
    setSesi(s);
    setPesan("");
    return s;
  };

  const daftar = async (nama, email, password) => {
    await auth.daftar({ nama, email, password });
    return masuk(email, password, true);
  };

  // Dipakai halaman Akun setelah profil berubah
  const ubahNama = (nama) => {
    const s = { ...sesi, nama };
    const ingat = (() => { try { return localStorage.getItem("sistani.sesi") !== null; } catch { return true; } })();
    simpanSesi(s, ingat);
    setSesi(s);
  };

  return (
    <Ctx.Provider value={{ sesi, pesan, premium, muatPremium, masuk, daftar, keluar, ubahNama }}>
      {children}
    </Ctx.Provider>
  );
}
