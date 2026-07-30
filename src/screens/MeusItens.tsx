import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getUsuarioId } from "../utils/auth";

interface Telefone { numero: string; }
interface Interessado { id: number; nome?: string; email?: string; telefones?: Telefone[]; }
interface Pedido { id: number; usuario: { id: number }; vendedor?: { id: number }; statusEntrega: boolean; total?: number; data?: string; item?: { id: number; nome?: string }; }
interface Avaliacao { id: number; nota: number; comentario?: string; autor?: { id: number }; tipo?: string; }
interface Item { id: number; nome?: string; preco?: number; status?: string; condicao?: string; categoria?: string; interessados?: Interessado[]; vendedor?: { id: number; nome?: string }; }

const STATUS_CFG: Record<string,{label:string;bg:string}> = {
  DISPONIVEL:{label:"Disponível",bg:"bg-[#6B7C6A]"},
  RESERVADO: {label:"Reservado", bg:"bg-[#B8956A]"},
  VENDIDO:   {label:"Vendido",   bg:"bg-[#A0522D]"},
};
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
const CONDICOES = ["Novo","Seminovo","Usado - Bom estado","Usado - Estado regular"];
const btnPrimary = "bg-[#A0522D] text-[#FDFAF6] px-5 py-2.5 text-[0.85rem] font-medium tracking-wide uppercase rounded-sm hover:bg-[#2C1A0E] transition-colors border-none cursor-pointer";
const btnSecondary = "border-[1.5px] border-[#A0522D] text-[#A0522D] px-4 py-2 text-[0.82rem] font-medium rounded-sm hover:bg-[#A0522D] hover:text-white transition-colors bg-transparent cursor-pointer no-underline inline-block";
const btnRemover = "border border-[#c9a09a] text-[#A0522D] bg-transparent px-3 py-1.5 rounded-sm text-[0.75rem] font-medium cursor-pointer hover:bg-[#A0522D] hover:text-white hover:border-[#A0522D] transition-colors whitespace-nowrap";
const selectCls = "w-full px-3 py-2.5 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.88rem] text-[#3D2B1F] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors appearance-none cursor-pointer";
const textareaCls = "w-full px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.92rem] text-[#3D2B1F] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors resize-none leading-relaxed";

function Estrelas({ nota, interativa=false, onChange }: { nota:number; interativa?:boolean; onChange?:(n:number)=>void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(n=>(
        <span key={n}
          className={`text-xl leading-none transition-colors ${n<=(interativa?(hover||nota):nota)?"text-[#B8956A]":"text-[#EDE5D8]"} ${interativa?"cursor-pointer":""}`}
          onClick={()=>interativa&&onChange?.(n)}
          onMouseEnter={()=>interativa&&setHover(n)}
          onMouseLeave={()=>interativa&&setHover(0)}>★</span>
      ))}
    </span>
  );
}

function FiltrosBarra({ busca, setBusca, fativos, onToggle, onLimpar, visiveis, children }:
  { busca:string; setBusca:(v:string)=>void; fativos:number; onToggle:()=>void; onLimpar:()=>void; visiveis:boolean; children:React.ReactNode }) {
  return (
    <>
      <div className="flex gap-2.5 items-center mb-3 flex-wrap">
        <input type="text" placeholder="Buscar por nome..." value={busca} onChange={e=>setBusca(e.target.value)}
          className="flex-1 min-w-[180px] px-3.5 py-2.5 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.9rem] bg-[#FDFAF6] outline-none focus:border-[#A0522D] transition-colors" />
        <button onClick={onToggle}
          className="relative bg-[#FDFAF6] border-[1.5px] border-[#EDE5D8] text-[#3D2B1F] px-4 py-2.5 rounded-sm text-[0.82rem] font-medium hover:border-[#A0522D] hover:text-[#A0522D] transition-colors">
          {visiveis?"Ocultar":"Filtros"}
          {fativos>0&&<span className="absolute -top-1.5 -right-1.5 bg-[#A0522D] text-white text-[0.6rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">{fativos}</span>}
        </button>
        {fativos>0&&<button onClick={onLimpar} className="text-[#A0522D] text-[0.82rem] underline bg-none border-none cursor-pointer">Limpar</button>}
      </div>
      {visiveis&&(
        <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm p-4 mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {children}
        </div>
      )}
    </>
  );
}

function FormAvaliacao({ itemId, tipo, onSend }: { itemId:number; tipo:"comprador"|"vendedor"; onSend:()=>void }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const token = localStorage.getItem("token");

  const handleEnviar = async () => {
    if (nota===0){ setFeedback("Selecione uma nota."); return; }
    setEnviando(true); setFeedback("");
    try {
      await axios.post(`http://localhost:8080/avaliacoes/item/${itemId}`,{ nota, comentario },{ headers:{ Authorization:`Bearer ${token}` } });
      setFeedback("Avaliação enviada!"); setNota(0); setComentario(""); onSend();
    } catch(err:any){ setFeedback(err.response?.data??"Erro."); }
    finally { setEnviando(false); }
  };

  return (
    <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm p-4 mb-4 flex flex-col gap-3">
      <p className="font-[Playfair_Display,serif] text-base text-[#2C1A0E]">
        Avaliar o {tipo}
      </p>
      <Estrelas nota={nota} interativa onChange={setNota} />
      <textarea className={textareaCls} rows={2} placeholder="Comentário (opcional)..."
        value={comentario} onChange={e=>setComentario(e.target.value)} />
      {feedback&&<p className={`text-[0.82rem] ${feedback.includes("!")?"text-[#6B7C6A]":"text-[#A0522D]"}`}>{feedback}</p>}
      <button onClick={handleEnviar} disabled={enviando} className={`${btnPrimary} self-start disabled:opacity-60`}>
        {enviando?"Enviando...":"Enviar avaliação"}
      </button>
    </div>
  );
}

function CardVenda({ item, onUpdate }: { item:Item; onUpdate:()=>void }) {
  const [expanded, setExpanded] = useState(false);
  const [pedido, setPedido] = useState<Pedido|null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [feedback, setFeedback] = useState("");
  const token = localStorage.getItem("token");
  const meuId = getUsuarioId();
  const s = STATUS_CFG[item.status??""]??{label:"—",bg:"bg-[#6B5744]"};

  const fetchDetalhes = async () => {
    const [resPed, resAv] = await Promise.all([
      axios.get("http://localhost:8080/pedidos",{ headers:{ Authorization:`Bearer ${token}` } }),
      axios.get(`http://localhost:8080/avaliacoes/item/${item.id}`),
    ]);
    setPedido(resPed.data.find((p:any)=>p.item?.id===item.id)??null);
    setAvaliacoes(resAv.data);
  };

  const handleExpand = () => { if(!expanded) fetchDetalhes(); setExpanded(!expanded); setFeedback(""); };

  const removerInteressado = async (uid:number) => {
    try {
      await axios.delete(`http://localhost:8080/pedidos/interesse/${item.id}/usuario/${uid}`,{ headers:{ Authorization:`Bearer ${token}` } });
      setFeedback("Removido. Fila atualizada."); fetchDetalhes(); onUpdate();
    } catch { setFeedback("Erro ao remover."); }
  };

  const concluirVenda = async () => {
    if(!pedido) return;
    try {
      await axios.put(`http://localhost:8080/pedidos/${pedido.id}/concluir`,{},{ headers:{ Authorization:`Bearer ${token}` } });
      setFeedback("Venda concluída!"); fetchDetalhes(); onUpdate();
    } catch { setFeedback("Erro ao concluir."); }
  };

  const minhaAv = avaliacoes.find(a=>a.autor?.id===meuId&&a.tipo==="VENDEDOR_PARA_COMPRADOR");
  const compradorId = pedido?.usuario?.id;

  return (
    <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm mb-2.5 overflow-hidden hover:border-[#B8956A] transition-colors">
      <div className="flex items-center gap-6 px-6 py-5 cursor-pointer" onClick={handleExpand}>
        <div className="flex-1">
          <p className="text-[0.72rem] tracking-[0.1em] uppercase text-[#6B7C6A] mb-1">{item.categoria?.replace(/_/g," ")??"—"}</p>
          <h3 className="font-[Playfair_Display,serif] text-lg text-[#2C1A0E] mb-1.5">{item.nome??`Item #${item.id}`}</h3>
          <div className="flex gap-2 items-center flex-wrap">
            <span className={`${s.bg} text-white text-[0.68rem] tracking-[0.08em] uppercase px-2.5 py-0.5 rounded-full font-medium`}>{s.label}</span>
            {item.condicao&&<span className="text-[0.8rem] text-[#6B5744]">{item.condicao}</span>}
            {item.interessados&&item.interessados.length>0&&(
              <span className="text-[0.78rem] text-[#6B7C6A]">{item.interessados.length} interessado{item.interessados.length>1?"s":""}</span>
            )}
          </div>
        </div>
        <div className="text-lg font-medium text-[#A0522D] whitespace-nowrap">
          {item.preco!==undefined?`R$ ${Number(item.preco).toFixed(2).replace(".",",")}` :"—"}
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/itens/${item.id}`} className={btnSecondary} onClick={e=>e.stopPropagation()}>Ver</Link>
          <span className="text-[0.75rem] text-[#6B5744]">{expanded?"▲":"▼"}</span>
        </div>
      </div>

      {expanded&&(
        <div className="border-t border-[#EDE5D8] px-6 py-5 bg-[#F7F3ED]">
          {feedback&&<div className="bg-[#EDE5D8] px-4 py-2.5 rounded-sm text-[0.85rem] text-[#3D2B1F] mb-4">{feedback}</div>}

          {item.status==="RESERVADO"&&pedido&&!pedido.statusEntrega&&(
            <div className="mb-4">
              <button onClick={concluirVenda} className={btnPrimary}>✓ Confirmar venda concluída</button>
            </div>
          )}

          {item.status==="VENDIDO"&&pedido&&!minhaAv&&(
            <FormAvaliacao itemId={item.id} tipo="comprador" onSend={()=>{fetchDetalhes();onUpdate();}} />
          )}
          {item.status==="VENDIDO"&&minhaAv&&(
            <div className="bg-[#EDE5D8] px-4 py-2.5 rounded-sm text-[0.85rem] text-[#3D2B1F] mb-4">✓ Você já avaliou o comprador.</div>
          )}

          <h4 className="font-[Playfair_Display,serif] text-base text-[#2C1A0E] mb-3">
            {item.interessados&&item.interessados.length>0?"Lista de interessados":"Nenhum interessado ainda"}
          </h4>
          {item.interessados&&item.interessados.length>0&&(
            <div className="flex flex-col gap-2.5">
              {item.interessados.map((u,i)=>{
                const isComprador=compradorId===u.id;
                return (
                  <div key={u.id} className={`flex items-center gap-4 px-4 py-3 rounded-sm border ${isComprador?"border-[#B8956A] bg-[#fdf8f2]":"border-[#EDE5D8] bg-[#FDFAF6]"}`}>
                    <span className="text-base min-w-[28px] text-center text-[#6B5744] font-medium">{isComprador?"":`#${i+1}`}</span>
                    <div className="flex-1">
                      <p className="font-medium text-[#2C1A0E] text-[0.92rem] flex items-center gap-2 flex-wrap">
                        {u.nome??"Usuário"}
                        {isComprador&&<span className="bg-[#B8956A] text-[#2C1A0E] text-[0.65rem] tracking-[0.06em] uppercase px-2 py-0.5 rounded-full font-semibold">Comprador atual</span>}
                      </p>
                      <p className="text-[0.82rem] text-[#6B5744]">✉ {u.email??"—"}</p>
                      {u.telefones&&u.telefones.length>0&&<p className="text-[0.82rem] text-[#6B5744]">Telefone: {u.telefones.map(t=>t.numero).join(", ")}</p>}
                    </div>
                    {item.status!=="VENDIDO"&&(
                      <button onClick={()=>removerInteressado(u.id)} className={btnRemover}>Remover</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardCompra({ pedido, onUpdate }: { pedido:Pedido; onUpdate:()=>void }) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const meuId = getUsuarioId();
  const token = localStorage.getItem("token");

  useEffect(()=>{
    if(!pedido.item) return;
    axios.get(`http://localhost:8080/avaliacoes/item/${pedido.item.id}`).then(r=>setAvaliacoes(r.data)).catch(()=>{});
  },[pedido.item?.id]);

  const minhaAv = avaliacoes.find(a=>a.autor?.id===meuId&&a.tipo==="COMPRADOR_PARA_VENDEDOR");
  const concluido = pedido.statusEntrega;

  return (
    <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm mb-2.5 overflow-hidden">
      <div className="flex items-center gap-6 px-6 py-5">
        <div className="flex-1">
          <h3 className="font-[Playfair_Display,serif] text-lg text-[#2C1A0E] mb-1.5">{pedido.item?.nome??`Item #${pedido.item?.id}`}</h3>
          <div className="flex gap-2 items-center flex-wrap">
            <span className={`${concluido?"bg-[#A0522D]":"bg-[#B8956A]"} text-white text-[0.68rem] tracking-[0.08em] uppercase px-2.5 py-0.5 rounded-full font-medium`}>
              {concluido?"Venda concluída":"Reservado para você"}
            </span>
            {pedido.data&&<span className="text-[0.8rem] text-[#6B5744]">{new Date(pedido.data).toLocaleDateString("pt-BR")}</span>}
          </div>
          {pedido.vendedor?.id&&(
            <p className="text-[0.82rem] text-[#6B5744] mt-1">
              Vendedor: <Link to={`/perfil/${pedido.vendedor.id}`} className="text-[#A0522D] no-underline hover:underline">ver perfil</Link>
            </p>
          )}
        </div>
        <div className="text-lg font-medium text-[#A0522D] whitespace-nowrap">
          {pedido.total!==undefined?`R$ ${Number(pedido.total).toFixed(2).replace(".",",")}` :"—"}
        </div>
        {pedido.item&&(
          <Link to={`/itens/${pedido.item.id}`} className={btnSecondary}>Ver item</Link>
        )}
      </div>
      {concluido&&!minhaAv&&(
        <div className="border-t border-[#EDE5D8] px-6 py-5 bg-[#F7F3ED]">
          <FormAvaliacao itemId={pedido.item!.id} tipo="vendedor" onSend={onUpdate} />
        </div>
      )}
      {concluido&&minhaAv&&(
        <div className="border-t border-[#EDE5D8] px-6 py-3 bg-[#F7F3ED]">
          <p className="text-[0.85rem] text-[#6B7C6A]">✓ Você já avaliou esta compra.</p>
        </div>
      )}
    </div>
  );
}

function CardFila({ item }: { item:Item }) {
  const meuId = getUsuarioId();
  const s = STATUS_CFG[item.status??""]??{label:"—",bg:"bg-[#6B5744]"};
  const pos = item.interessados?.findIndex(u=>u.id===meuId)??-1;

  return (
    <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm mb-2.5 flex items-center gap-6 px-6 py-5">
      <div className="flex-1">
        <p className="text-[0.72rem] tracking-[0.1em] uppercase text-[#6B7C6A] mb-1">{item.categoria?.replace(/_/g," ")??"—"}</p>
        <h3 className="font-[Playfair_Display,serif] text-lg text-[#2C1A0E] mb-1.5">{item.nome??`Item #${item.id}`}</h3>
        <div className="flex gap-2 items-center flex-wrap">
          <span className={`${s.bg} text-white text-[0.68rem] tracking-[0.08em] uppercase px-2.5 py-0.5 rounded-full font-medium`}>{s.label}</span>
          {item.condicao&&<span className="text-[0.8rem] text-[#6B5744]">{item.condicao}</span>}
          {pos>=0&&<span className="text-[0.78rem] text-[#6B7C6A] font-medium">{pos===0?"Próximo da fila":`Posição #${pos+1} na fila`}</span>}
        </div>
        {item.vendedor?.nome&&(
          <p className="text-[0.82rem] text-[#6B5744] mt-1">
            Vendedor: <Link to={`/perfil/${item.vendedor.id}`} className="text-[#A0522D] no-underline hover:underline">{item.vendedor.nome}</Link>
          </p>
        )}
      </div>
      <div className="text-lg font-medium text-[#A0522D] whitespace-nowrap">
        {item.preco!==undefined?`R$ ${Number(item.preco).toFixed(2).replace(".",",")}` :"—"}
      </div>
      <Link to={`/itens/${item.id}`} className={btnSecondary}>Ver item</Link>
    </div>
  );
}

type Aba = "vendendo"|"comprando"|"fila";

export default function MeusItens() {
  const [aba, setAba] = useState<Aba>("vendendo");
  const [meusItens, setMeusItens] = useState<Item[]>([]);
  const [pedidos, setPedidos]     = useState<Pedido[]>([]);
  const [filaItens, setFilaItens] = useState<Item[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const [buscaV, setBuscaV]=useState(""); const [catV, setCatV]=useState("");
  const [statusV, setStatusV]=useState(""); const [condV, setCondV]=useState("");
  const [fvv, setFvv]=useState(false);

  const [buscaC, setBuscaC]=useState(""); const [statusC, setStatusC]=useState("");
  const [fvc, setFvc]=useState(false);

  const [buscaF, setBuscaF]=useState(""); const [catF, setCatF]=useState("");
  const [condF, setCondF]=useState(""); const [fvf, setFvf]=useState(false);

  const token = localStorage.getItem("token");
  const meuId = getUsuarioId();

  const fetchAll = async () => {
    try {
      const [ri, rp, rf] = await Promise.all([
        axios.get("http://localhost:8080/itens/meus",{ headers:{ Authorization:`Bearer ${token}` } }),
        meuId?axios.get(`http://localhost:8080/pedidos/usuario/${meuId}`,{ headers:{ Authorization:`Bearer ${token}` } }):Promise.resolve({data:[]}),
        axios.get("http://localhost:8080/itens/fila",{ headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      setMeusItens(ri.data); setPedidos(rp.data); setFilaItens(rf.data);
    } catch { setError("Erro ao carregar dados."); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchAll(); },[]);

  const itensV = useMemo(()=>{
    let r=meusItens;
    if(buscaV.trim()){ const q=buscaV.toLowerCase(); r=r.filter(i=>i.nome?.toLowerCase().includes(q)||i.categoria?.toLowerCase().includes(q)); }
    if(catV) r=r.filter(i=>i.categoria===catV);
    if(statusV) r=r.filter(i=>i.status===statusV);
    if(condV) r=r.filter(i=>i.condicao===condV);
    return r;
  },[meusItens,buscaV,catV,statusV,condV]);

  const pedidosF = useMemo(()=>{
    let r=pedidos;
    if(buscaC.trim()) r=r.filter(p=>p.item?.nome?.toLowerCase().includes(buscaC.toLowerCase()));
    if(statusC==="concluido") r=r.filter(p=>p.statusEntrega);
    if(statusC==="andamento") r=r.filter(p=>!p.statusEntrega);
    return r;
  },[pedidos,buscaC,statusC]);

  const filaF = useMemo(()=>{
    let r=filaItens;
    if(buscaF.trim()){ const q=buscaF.toLowerCase(); r=r.filter(i=>i.nome?.toLowerCase().includes(q)||i.categoria?.toLowerCase().includes(q)); }
    if(catF) r=r.filter(i=>i.categoria===catF);
    if(condF) r=r.filter(i=>i.condicao===condF);
    return r;
  },[filaItens,buscaF,catF,condF]);

  const fatV=[buscaV,catV,statusV,condV].filter(Boolean).length;
  const fatC=[buscaC,statusC].filter(Boolean).length;
  const fatF=[buscaF,catF,condF].filter(Boolean).length;

  const reservados  = itensV.filter(i=>i.status==="RESERVADO");
  const disponiveis = itensV.filter(i=>i.status==="DISPONIVEL");
  const vendidos    = itensV.filter(i=>i.status==="VENDIDO");

  if(loading) return <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>Carregando...</p></div>;
  if(error)   return <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>{error}</p></div>;

  const secao = (titulo:string, lista:Item[]) => lista.length>0?(
    <section className="mb-8" key={titulo}>
      <h2 className="font-[Playfair_Display,serif] text-lg text-[#2C1A0E] mb-3 pb-2 border-b border-[#EDE5D8]">{titulo} ({lista.length})</h2>
      {lista.map(i=><CardVenda key={i.id} item={i} onUpdate={fetchAll}/>)}
    </section>
  ):null;

  return (
    <div>
      <div className="flex justify-between items-end mb-8 pb-6 border-b border-[#EDE5D8] flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.14em] uppercase text-[#6B7C6A] mb-2 font-medium">Sua atividade</p>
          <h1 className="font-[Playfair_Display,serif] text-4xl text-[#2C1A0E]">Meus Itens</h1>
        </div>
        <Link to="/itens/cadastrar" className={`${btnPrimary} no-underline`}>+ Cadastrar item</Link>
      </div>

      <div className="flex border-b-2 border-[#EDE5D8] mb-7">
        {([["vendendo","Vendendo",meusItens.length],["comprando","Comprando",pedidos.length],["fila","Fila de Espera",filaItens.length]] as [Aba,string,number][]).map(([id,label,count])=>(
          <button key={id} onClick={()=>setAba(id)}
            className={`relative flex items-center gap-2 px-6 py-3 text-[0.85rem] font-medium tracking-[0.05em] uppercase border-none border-b-2 -mb-0.5 transition-colors cursor-pointer bg-transparent ${aba===id?"text-[#A0522D] border-[#A0522D]":"text-[#6B5744] border-transparent hover:text-[#A0522D]"}`}>
            {label}
            {count>0&&<span className="bg-[#A0522D] text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{count}</span>}
          </button>
        ))}
      </div>

      {aba==="vendendo"&&(
        meusItens.length===0
          ?<div className="flex flex-col items-center py-16 text-[#6B5744]">
            <p className="mb-5">Você ainda não cadastrou nenhum item.</p>
            <Link to="/itens/cadastrar" className={`${btnPrimary} no-underline`}>Cadastrar meu primeiro item</Link>
          </div>
          :<>
            <FiltrosBarra busca={buscaV} setBusca={setBuscaV} fativos={fatV} onToggle={()=>setFvv(!fvv)} onLimpar={()=>{setBuscaV("");setCatV("");setStatusV("");setCondV("");}} visiveis={fvv}>
              <div className="flex flex-col gap-1"><label className="text-[0.75rem] uppercase tracking-wide text-[#6B7C6A] font-medium">Categoria</label><select value={catV} onChange={e=>setCatV(e.target.value)} className={selectCls}><option value="">Todas</option>{CATEGORIAS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
              <div className="flex flex-col gap-1"><label className="text-[0.75rem] uppercase tracking-wide text-[#6B7C6A] font-medium">Status</label><select value={statusV} onChange={e=>setStatusV(e.target.value)} className={selectCls}><option value="">Todos</option><option value="DISPONIVEL">Disponível</option><option value="RESERVADO">Reservado</option><option value="VENDIDO">Vendido</option></select></div>
              <div className="flex flex-col gap-1"><label className="text-[0.75rem] uppercase tracking-wide text-[#6B7C6A] font-medium">Conservação</label><select value={condV} onChange={e=>setCondV(e.target.value)} className={selectCls}><option value="">Qualquer</option>{CONDICOES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            </FiltrosBarra>
            {itensV.length===0
              ?<p>Nenhum item encontrado com esses filtros.</p>
              :<>
                <p className="text-[0.8rem] text-[#6B7C6A] mb-4">{itensV.length} item{itensV.length!==1?"s":""}{fatV>0&&meusItens.length!==itensV.length?` de ${meusItens.length}`:""}</p>
                {secao("Reservados",reservados)}
                {secao("Disponíveis",disponiveis)}
                {secao("Vendidos",vendidos)}
              </>
            }
          </>
      )}

      {aba==="comprando"&&(
        pedidos.length===0
          ?<p>Você ainda não tem compras ativas</p>
          :<>
            <FiltrosBarra busca={buscaC} setBusca={setBuscaC} fativos={fatC} onToggle={()=>setFvc(!fvc)} onLimpar={()=>{setBuscaC("");setStatusC("");}} visiveis={fvc}>
              <div className="flex flex-col gap-1"><label className="text-[0.75rem] uppercase tracking-wide text-[#6B7C6A] font-medium">Status</label><select value={statusC} onChange={e=>setStatusC(e.target.value)} className={selectCls}><option value="">Todos</option><option value="andamento">Em andamento</option><option value="concluido">Concluído</option></select></div>
            </FiltrosBarra>
            {pedidosF.length===0
              ?<p>Nenhuma compra encontrada.</p>
              :<>
                <p className="text-[0.8rem] text-[#6B7C6A] mb-4">{pedidosF.length} compra{pedidosF.length!==1?"s":""}{fatC>0&&pedidos.length!==pedidosF.length?` de ${pedidos.length}`:""}</p>
                {pedidosF.map(p=><CardCompra key={p.id} pedido={p} onUpdate={fetchAll}/>)}
              </>
            }
          </>
      )}

      {aba==="fila"&&(
        filaItens.length===0
          ?<p>Você não está na fila de espera de nenhum item.</p>
          :<>
            <FiltrosBarra busca={buscaF} setBusca={setBuscaF} fativos={fatF} onToggle={()=>setFvf(!fvf)} onLimpar={()=>{setBuscaF("");setCatF("");setCondF("");}} visiveis={fvf}>
              <div className="flex flex-col gap-1"><label className="text-[0.75rem] uppercase tracking-wide text-[#6B7C6A] font-medium">Categoria</label><select value={catF} onChange={e=>setCatF(e.target.value)} className={selectCls}><option value="">Todas</option>{CATEGORIAS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
              <div className="flex flex-col gap-1"><label className="text-[0.75rem] uppercase tracking-wide text-[#6B7C6A] font-medium">Conservação</label><select value={condF} onChange={e=>setCondF(e.target.value)} className={selectCls}><option value="">Qualquer</option>{CONDICOES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            </FiltrosBarra>
            {filaF.length===0
              ?<p>Nenhum item encontrado.</p>
              :<>
                <p className="text-[0.8rem] text-[#6B7C6A] mb-4">{filaF.length} item{filaF.length!==1?"s":""}{fatF>0&&filaItens.length!==filaF.length?` de ${filaItens.length}`:""}</p>
                {filaF.map(i=><CardFila key={i.id} item={i}/>)}
              </>
            }
          </>
      )}
    </div>
  );
}