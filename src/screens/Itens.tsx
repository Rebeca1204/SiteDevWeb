import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getUsuarioId } from "../utils/auth";

interface Item {
  id: number; nome?: string; preco?: number; categoria?: string;
  condicao?: string; formaPagamentoAceitas?: string; status?: string;
  vendedor?: { id: number }; imagens?: { id: number; url: string }[];
}

const CATEGORIAS = [
  ["ROUPAS_FEMININAS","Roupas Femininas"],["ROUPAS_MASCULINAS","Roupas Masculinas"],
  ["ROUPAS_INFANTIS","Roupas Infantis"],["CALCADOS","Calçados"],["BOLSAS","Bolsas"],
  ["ACESSORIOS","Acessórios"],["JOIAS_BIJUTERIAS","Joias e Bijuterias"],["BELEZA","Beleza"],
  ["PERFUMARIA","Perfumaria"],["LIVROS","Livros"],["BRINQUEDOS","Brinquedos"],
  ["JOGOS","Jogos"],["ELETRONICOS","Eletrônicos"],["CELULARES","Celulares"],
  ["INFORMATICA","Informática"],["ELETRODOMESTICOS","Eletrodomésticos"],["MOVEIS","Móveis"],
  ["DECORACAO","Decoração"],["CAMA_MESA_BANHO","Cama, Mesa e Banho"],["COZINHA","Cozinha"],
  ["ESPORTE_LAZER","Esporte e Lazer"],["INSTRUMENTOS_MUSICAIS","Instrumentos Musicais"],
  ["FERRAMENTAS","Ferramentas"],["AUTOMOTIVO","Automotivo"],["PET","Pet"],
  ["ARTIGOS_ESCOLARES","Artigos Escolares"],["ARTESANATO","Artesanato"],
  ["ANTIGUIDADES","Antiguidades"],["COLECIONAVEIS","Colecionáveis"],["OUTROS","Outros"],
];
const FORMAS = [["PIX","Pix"],["DINHEIRO","Dinheiro"],["AMBOS","Pix e Dinheiro"]];
const CONDICOES = ["Novo","Seminovo","Usado - Bom estado","Usado - Estado regular"];

const selectCls = "w-full px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.92rem] text-[#3D2B1F] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors appearance-none cursor-pointer";

export default function Itens() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [busca, setBusca] = useState(""); const [categoria, setCategoria] = useState("");
  const [formaPagamento, setFormaPagamento] = useState(""); const [condicao, setCondicao] = useState("");
  const [precoMin, setPrecoMin] = useState(""); const [precoMax, setPrecoMax] = useState("");
  const meuId = getUsuarioId();

  useEffect(() => {
    axios.get("http://localhost:8080/itens", { headers:{ Authorization:`Bearer ${localStorage.getItem("token")}` } })
      .then(r => setItems(r.data)).catch(() => setError("Não foi possível carregar o catálogo."))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => {
    let r = items;
    if (busca.trim()) { const q=busca.toLowerCase(); r=r.filter(i=>i.nome?.toLowerCase().includes(q)||i.categoria?.toLowerCase().includes(q)||i.condicao?.toLowerCase().includes(q)); }
    if (categoria) r=r.filter(i=>i.categoria===categoria);
    if (formaPagamento) r=r.filter(i=>i.formaPagamentoAceitas===formaPagamento);
    if (condicao) r=r.filter(i=>i.condicao===condicao);
    if (precoMin!=="") r=r.filter(i=>(i.preco??0)>=parseFloat(precoMin.replace(",",".")));
    if (precoMax!=="") r=r.filter(i=>(i.preco??0)<=parseFloat(precoMax.replace(",",".")));
    return r;
  }, [items,busca,categoria,formaPagamento,condicao,precoMin,precoMax]);

  const fativos = [busca,categoria,formaPagamento,condicao,precoMin,precoMax].filter(Boolean).length;
  const limpar = () => { setBusca("");setCategoria("");setFormaPagamento("");setCondicao("");setPrecoMin("");setPrecoMax(""); };

  if (loading) return <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>Carregando peças...</p></div>;
  if (error) return <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>{error}</p></div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8 pb-6 border-b border-[#EDE5D8] flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.14em] uppercase text-[#6B7C6A] mb-2 font-medium">Nosso acervo</p>
          <h1 className="font-[Playfair_Display,serif] text-4xl text-[#2C1A0E]">Catálogo</h1>
        </div>
        <Link to="/itens/cadastrar"
          className="bg-[#A0522D] text-[#FDFAF6] px-6 py-3 text-[0.85rem] font-medium tracking-[0.06em] uppercase no-underline rounded-sm hover:bg-[#2C1A0E] transition-colors">
          + Cadastrar item
        </Link>
      </div>

      <div className="flex gap-2.5 items-center mb-3 flex-wrap">
        <input type="text" placeholder="Buscar por nome, categoria ou estado..."
          value={busca} onChange={e=>setBusca(e.target.value)}
          className="flex-1 min-w-[200px] px-3.5 py-2.5 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.92rem] text-[#3D2B1F] bg-[#FDFAF6] outline-none focus:border-[#A0522D] transition-colors" />
        <button onClick={()=>setFiltrosVisiveis(!filtrosVisiveis)}
          className="relative bg-[#FDFAF6] border-[1.5px] border-[#EDE5D8] text-[#3D2B1F] px-4 py-2.5 rounded-sm text-[0.85rem] font-medium tracking-wide hover:border-[#A0522D] hover:text-[#A0522D] transition-colors">
          {filtrosVisiveis?"Ocultar filtros":"Filtros"}
          {fativos>0&&<span className="absolute -top-1.5 -right-1.5 bg-[#A0522D] text-white text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">{fativos}</span>}
        </button>
        {fativos>0&&<button onClick={limpar} className="text-[#A0522D] text-[0.82rem] underline bg-none border-none cursor-pointer">Limpar</button>}
      </div>

      {filtrosVisiveis && (
        <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm p-5 mb-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.78rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium">Categoria</label>
            <select value={categoria} onChange={e=>setCategoria(e.target.value)} className={selectCls}>
              <option value="">Todas</option>
              {CATEGORIAS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.78rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium">Pagamento</label>
            <select value={formaPagamento} onChange={e=>setFormaPagamento(e.target.value)} className={selectCls}>
              <option value="">Qualquer</option>
              {FORMAS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.78rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium">Conservação</label>
            <select value={condicao} onChange={e=>setCondicao(e.target.value)} className={selectCls}>
              <option value="">Qualquer</option>
              {CONDICOES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.78rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium">Preço mín.</label>
            <input type="text" placeholder="0,00" value={precoMin} onChange={e=>setPrecoMin(e.target.value.replace(/[^\d,\.]/g,""))}
              className="px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.92rem] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.78rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium">Preço máx.</label>
            <input type="text" placeholder="0,00" value={precoMax} onChange={e=>setPrecoMax(e.target.value.replace(/[^\d,\.]/g,""))}
              className="px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.92rem] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors" />
          </div>
        </div>
      )}

      {filtrados.length===0 ? (
        <div className="flex flex-col items-center py-20 text-[#6B5744]">
          <p>Nenhum item encontrado com esses filtros.</p>
          {fativos>0&&<button onClick={limpar} className="mt-4 border-[1.5px] border-[#A0522D] text-[#A0522D] px-6 py-2.5 rounded-sm text-[0.85rem] font-medium hover:bg-[#A0522D] hover:text-white transition-colors">Limpar filtros</button>}
        </div>
      ) : (
        <>
          <p className="text-[0.82rem] text-[#6B7C6A] tracking-wide mb-4">
            {filtrados.length} {filtrados.length===1?"item encontrado":"itens encontrados"}
            {fativos>0&&items.length!==filtrados.length&&` de ${items.length}`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtrados.map(item => {
              const isMeu = meuId!==null && item.vendedor?.id===meuId;
              return (
                <Link key={item.id} to={`/itens/${item.id}`}
                  className={`bg-[#FDFAF6] border rounded-sm overflow-hidden no-underline text-inherit block hover:-translate-y-1 hover:shadow-lg transition-all duration-200 relative ${isMeu?"border-[#B8956A]":"border-[#EDE5D8]"}`}>
                  {isMeu&&<span className="absolute top-2.5 right-2.5 z-10 bg-[#2C1A0E] text-[#B8956A] text-[0.7rem] tracking-[0.08em] uppercase px-2.5 py-1 rounded-sm font-medium">Meu item</span>}
                  <div className="w-full aspect-[4/3] bg-[#EDE5D8] flex items-center justify-center text-5xl text-[#B8956A]">
                    {item.imagens&&item.imagens.length>0
                      ?<img src={item.imagens[0].url} alt={item.nome} className="w-full h-full object-cover" />
                      :<span></span>}
                  </div>
                  <div className="p-5">
                    {item.categoria&&<p className="text-[0.72rem] tracking-[0.1em] uppercase text-[#6B7C6A] mb-1.5">{item.categoria.replace(/_/g," ")}</p>}
                    <h2 className="font-[Playfair_Display,serif] text-lg text-[#2C1A0E] mb-2">{item.nome??`Item #${item.id}`}</h2>
                    {item.preco!==undefined&&<p className="text-[1.1rem] font-medium text-[#A0522D]">R$ {Number(item.preco).toFixed(2).replace(".",",")}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}