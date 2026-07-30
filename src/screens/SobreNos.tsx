export default function SobreNos() {
  return (
    <div>
      <div className="mb-12 pb-6 border-b border-[#EDE5D8]">
        <p className="text-xs tracking-[0.14em] uppercase text-[#6B7C6A] mb-3 font-medium">Sobre o projeto</p>
        <h1 className="font-[Playfair_Display,serif] text-4xl text-[#2C1A0E] leading-tight">
          Quem <em className="italic text-[#A0522D]">somos</em>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        {[
          {
            title: "O Projeto",
            text: "O Brechó Vintage é um sistema web completo desenvolvido como projeto final da disciplina de Desenvolvimento Web da UNESP. A plataforma conecta compradores e vendedores de itens usados, com foco em sustentabilidade, confiança e facilidade de uso.",
          },
          {
            title: "Tecnologias",
            text: "React 18 + TypeScript, Tailwind CSS v4, React Router v6, Axios e Vite no frontend. Java 17, Spring Boot 3, Spring Security, JPA/Hibernate e MySQL no backend. Upload de imagens com armazenamento local e autenticação stateless via JWT.",
          },
        ].map(({ title, text }) => (
          <div key={title}>
            <h2 className="font-[Playfair_Display,serif] text-xl text-[#2C1A0E] mb-3">{title}</h2>
            <p className="text-[0.95rem] text-[#6B5744] leading-[1.75]">{text}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="font-[Playfair_Display,serif] text-2xl text-[#2C1A0E] mb-6">Funcionalidades principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { feat: "Autenticação com JWT", desc: "Cadastro, login e rotas protegidas com Spring Security." },
            { feat: "Catálogo com filtros", desc: "Busca incremental por texto, categoria, pagamento, conservação e preço." },
            { feat: "Fila de espera", desc: "Primeiro interessado reserva o item; demais entram na fila automaticamente." },
            { feat: "Avaliações mútuas", desc: "Comprador avalia vendedor e vice-versa após a conclusão da venda." },
            { feat: "Perfis públicos", desc: "Reputação acumulada separada por papel: como vendedor e como comprador." },
            { feat: "Upload de imagens", desc: "Múltiplas fotos por item com galeria e visualização em detalhe." },
          ].map(({ feat, desc }) => (
            <div key={feat} className="flex gap-4 bg-[#FDFAF6] border border-[#EDE5D8] px-5 py-4 rounded-sm">
              <p className="font-medium text-[#2C1A0E] text-[0.95rem] mb-0.5">{feat}</p>
              <p className="text-[0.85rem] text-[#6B5744]">{desc}</p>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}