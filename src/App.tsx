import { Outlet, NavLink, Link } from "react-router-dom";
import { getUsuarioId } from "./utils/auth";
import "./styles.css";

export default function App() {
  const token = localStorage.getItem("token");
  const meuId = getUsuarioId();

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3ED] font-[Inter,sans-serif]">

      <header className="bg-[#2C1A0E] text-[#F7F3ED] px-6 py-7 border-b-[3px] border-[#B8956A]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="font-[Playfair_Display,serif] text-3xl font-bold tracking-wide">Brechó da UNESP</span>
          </div>
        </div>
      </header>

      <nav className="bg-[#EDE5D8] border-b border-[#D4C4B0]">
        <div className="max-w-5xl mx-auto flex px-6 flex-wrap">
          {[
            { to: "/", label: "Início", end: true },
            { to: "/sobrenos", label: "Quem Somos" },
            { to: "/itens", label: "Catálogo" },
          ].map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `text-[0.85rem] font-medium tracking-[0.06em] uppercase no-underline px-5 py-3.5 border-b-[3px] transition-colors duration-150 ${
                  isActive
                    ? "text-[#A0522D] border-[#A0522D]"
                    : "text-[#6B5744] border-transparent hover:text-[#A0522D]"
                }`
              }>{label}</NavLink>
          ))}
          {token && (
            <NavLink to="/meus-itens"
              className={({ isActive }) =>
                `text-[0.85rem] font-medium tracking-[0.06em] uppercase no-underline px-5 py-3.5 border-b-[3px] transition-colors duration-150 ${
                  isActive ? "text-[#A0522D] border-[#A0522D]" : "text-[#6B5744] border-transparent hover:text-[#A0522D]"
                }`
              }>Meus Itens</NavLink>
          )}
          {token && meuId && (
            <NavLink to={`/perfil/${meuId}`}
              className={({ isActive }) =>
                `text-[0.85rem] font-medium tracking-[0.06em] uppercase no-underline px-5 py-3.5 border-b-[3px] transition-colors duration-150 ${
                  isActive ? "text-[#A0522D] border-[#A0522D]" : "text-[#6B5744] border-transparent hover:text-[#A0522D]"
                }`
              }>Meu Perfil</NavLink>
          )}
          <div className="ml-auto">
            {token ? (
              <NavLink to="/logout"
                className="text-[0.85rem] font-medium tracking-[0.06em] uppercase no-underline px-5 py-3.5 border-b-[3px] border-transparent text-[#A0522D] hover:text-[#2C1A0E] transition-colors">
                Sair
              </NavLink>
            ) : (
              <NavLink to="/login"
                className={({ isActive }) =>
                  `text-[0.85rem] font-medium tracking-[0.06em] uppercase no-underline px-5 py-3.5 border-b-[3px] transition-colors ${
                    isActive ? "text-[#A0522D] border-[#A0522D]" : "text-[#A0522D] border-transparent hover:text-[#2C1A0E]"
                  }`
                }>Entrar</NavLink>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <Outlet />
      </main>

      <footer className="bg-[#2C1A0E] px-6 py-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <p className="font-[Playfair_Display,serif] text-[#B8956A]">Brechó da UNESP</p>
          <p className="text-xs text-[#6B5744] tracking-wide">© 2026 — Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}