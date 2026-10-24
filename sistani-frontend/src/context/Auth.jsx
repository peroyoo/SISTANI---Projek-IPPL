import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth } from "../api/index.js";
import { ambilSesi, hapusSesi, pasangPenangani401, simpanSesi } from "../api/client.js";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [sesi, setSesi] = useState(ambilSesi());
  const [pesan, setPesan] = useState("");

  const keluar = useCallback(() => {
    hapusSesi();
    setSesi(null);
    window.location.hash = "/masuk";
  }, []);

  // Token kedaluwarsa (401) -> kembali ke halaman masuk
  useEffect(() => {
    pasangPenangani401(() => {
      hapusSesi();
      setSesi(null);
      setPesan("Sesi Anda berakhir. Silakan masuk lagi.");
      window.location.hash = "/masuk";
    });
  }, []);

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

  return <Ctx.Provider value={{ sesi, pesan, masuk, daftar, keluar }}>{children}</Ctx.Provider>;
}
