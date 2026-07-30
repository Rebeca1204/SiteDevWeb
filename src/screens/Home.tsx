import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="text-center py-16 pb-14 border-b border-[#EDE5D8] mb-14">
        <p className="text-xs tracking-[0.14em] uppercase text-[#6B7C6A] mb-4 font-medium">
          Projeto Final · Desenvolvimento Web · UNESP 2026
        </p>
        <h1 className="font-[Playfair_Display,serif] text-5xl font-bold text-[#2C1A0E] leading-tight mb-5">
          Brechó da <em className="italic text-[#A0522D]">UNESP</em>
        </h1>
        <p className="text-[1.05rem] text-[#6B5744] max-w-lg mx-auto mb-9 font-light">
          Plataforma de compra e venda de itens usados
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/itens"
            className="bg-[#A0522D] text-[#FDFAF6] px-8 py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase no-underline rounded-sm hover:bg-[#2C1A0E] transition-colors">
            Ver Catálogo
          </Link>
          <Link to="/sobrenos"
            className="border-[1.5px] border-[#A0522D] text-[#A0522D] px-8 py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase no-underline rounded-sm hover:bg-[#A0522D] hover:text-[#FDFAF6] transition-colors">
            Sobre o Projeto
          </Link>
        </div>
      </section>

      <div className="bg-[#2C1A0E] text-[#EDE5D8] px-8 py-6 rounded-sm flex flex-col md:flex-row justify-between items-center gap-3">
        <div>
          <p className="font-[Playfair_Display,serif] text-[#B8956A] text-lg">Brechó da UNESP</p>
          <p className="text-[0.82rem] text-[#6B5744] mt-0.5">Projeto desenvolvido para a disciplina de Desenvolvimento Web</p>
        </div>
        <div className="text-right">
          <p className="text-[0.9rem] font-medium text-[#EDE5D8]">Rebeca Furtado e Elisa Yamashita</p>
          <p className="text-[0.78rem] text-[#6B5744]">UNESP · 2026</p>
        </div>
      </div>
    </div>
  );
}