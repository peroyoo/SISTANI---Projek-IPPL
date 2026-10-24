import { useAuth } from "../context/Auth.jsx";
import { inisial } from "../lib/format.js";

export const go = (path) => {
  window.location.hash = path;
};

export function Logo() {
  return (
    <div className="logo">
      <img src="/logo.png" alt="" />
      <span>SISTANI</span>
    </div>
  );
}

export function Field({ label, error, hint, children }) {
  return (
    <label className="field">
      <span className="lbl">{label}</span>
      {children}
      {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </label>
  );
}

export function Alert({ tone = "merah", children }) {
  if (!children) return null;
  return <div className={`alert ${tone}`} role={tone === "merah" ? "alert" : "status"}>{children}</div>;
}

export function Kosong({ judul, teks, aksi }) {
  return (
    <div className="kosong">
      <h3>{judul}</h3>
      <p>{teks}</p>
      {aksi}
    </div>
  );
}

const NAV = [
  ["/beranda", "Beranda"],
  ["/kebun", "Data Kebun"],
  ["/kerusakan", "Kerusakan"],
];

export function Portal({ aktif, judul, sub, children }) {
  const { sesi, keluar } = useAuth();
  return (
    <div className="portal">
      <header className="top">
        <Logo />
        <div className="who">
          <span className="avatar" title={sesi.nama}>{inisial(sesi.nama)}</span>
          <button className="link" onClick={keluar}>Keluar</button>
        </div>
      </header>
      <main>
        <h1>{judul}</h1>
        {sub && <p className="sub">{sub}</p>}
        {children}
      </main>
      <nav className="bottom">
        {NAV.map(([p, t]) => (
          <a key={p} href={`#${p}`} className={aktif === p ? "on" : ""}>{t}</a>
        ))}
      </nav>
    </div>
  );
}
