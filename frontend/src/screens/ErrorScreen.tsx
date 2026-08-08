import { Link, useRouteError } from "react-router-dom";

export default function ErrorScreen() {
  const error = useRouteError() as { status?: number; statusText?: string } | null;
  const is404 = !error || error?.status === 404;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-[#F7F3ED] font-[Inter,sans-serif]">
      <p className="font-[Playfair_Display,serif] text-[10rem] text-[#EDE5D8] leading-none mb-2 select-none">
        404
      </p>
      <h2 className="font-[Playfair_Display,serif] text-2xl text-[#2C1A0E] mb-3">Página não encontrada</h2>
      <p className="text-[#6B5744] mb-8 text-[0.95rem]">
        {is404
          ? "A página que você tentou acessar não existe ou foi movida."
          : `Ocorreu um erro: ${error?.statusText ?? "tente novamente."}`}
      </p>
      <Link to="/"
        className="bg-[#A0522D] text-[#FDFAF6] px-8 py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase no-underline rounded-sm hover:bg-[#2C1A0E] transition-colors">
        Voltar para o início
      </Link>
    </div>
  );
}