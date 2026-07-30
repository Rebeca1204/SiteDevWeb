import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { getUsuarioId } from "../utils/auth";

interface Imagem { id: number; url: string; descricao?: string; }
interface Telefone { numero: string; }
interface Vendedor { id: number; nome?: string; email?: string; telefones?: Telefone[]; }
interface Item {
  id: number; nome?: string; preco?: number; categoria?: string;
  descricao?: string; status?: string; condicao?: string;
  formaPagamentoAceitas?: string; vendedor?: Vendedor;
  interessados?: { id: number }[]; imagens?: Imagem[];
}
interface Avaliacao {
  id: number; nota: number; comentario?: string; data?: string; tipo?: string;
  autor?: { id: number; nome?: string };
}

const FORMA_LABEL: Record<string,string> = { PIX:"Pix", DINHEIRO:"Dinheiro", AMBOS:"Pix e Dinheiro" };
const STATUS_CFG: Record<string,{label:string;bg:string}> = {
  DISPONIVEL:{label:"Disponível",bg:"bg-[#6B7C6A]"},
  RESERVADO: {label:"Reservado", bg:"bg-[#B8956A]"},
  VENDIDO:   {label:"Vendido",   bg:"bg-[#A0522D]"},
};

function Estrelas({ nota, interativa=false, onChange }: { nota:number; interativa?:boolean; onChange?:(n:number)=>void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <span key={n}
          className={`text-2xl leading-none transition-colors ${n<=(interativa?(hover||nota):nota)?"text-[#B8956A]":"text-[#EDE5D8]"} ${interativa?"cursor-pointer":""}`}
          onClick={()=>interativa&&onChange?.(n)}
          onMouseEnter={()=>interativa&&setHover(n)}
          onMouseLeave={()=>interativa&&setHover(0)}>★</span>
      ))}
    </span>
  );
}

const inputCls = "w-full px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.95rem] text-[#3D2B1F] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors resize-y";

export default function ItemDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item|null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [avaliacoesVendedor, setAvaliacoesVendedor] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [notaForm, setNotaForm] = useState(0);
  const [comentarioForm, setComentarioForm] = useState("");
  const [enviandoAv, setEnviandoAv] = useState(false);
  const [feedbackAv, setFeedbackAv] = useState("");
  const [uploadArquivo, setUploadArquivo] = useState<File|null>(null);
  const [uploadPreview, setUploadPreview] = useState<string|null>(null);
  const [uploadando, setUploadando] = useState(false);

  const meuId = getUsuarioId();
  const token = localStorage.getItem("token");

  const fetchItem = async () => {
    try {
      const [resItem, resAv] = await Promise.all([
        axios.get(`http://localhost:8080/itens/${id}`, { headers:{ Authorization:`Bearer ${token}` } }),
        axios.get(`http://localhost:8080/avaliacoes/item/${id}`),
      ]);
      setItem(resItem.data); setFotoAtiva(0); setAvaliacoes(resAv.data);
      if (resItem.data.vendedor?.id) {
        const resVend = await axios.get(`http://localhost:8080/avaliacoes/usuario/${resItem.data.vendedor.id}`);
        setAvaliacoesVendedor(resVend.data);
      }
    } catch { setError("Não foi possível carregar este item."); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchItem(); },[id]);

  const handleInteresse = async () => {
    setEnviando(true); setFeedback("");
    try {
      const res = await axios.post(`http://localhost:8080/pedidos/interesse/${id}`,{},{ headers:{ Authorization:`Bearer ${token}` } });
      setFeedback(res.data); fetchItem();
    } catch(err:any){ setFeedback(err.response?.data??"Erro ao registrar interesse."); }
    finally { setEnviando(false); }
  };

  const handleUploadImagem = async () => {
    if (!uploadArquivo) return; setUploadando(true);
    try {
      const form = new FormData(); form.append("arquivo", uploadArquivo);
      await axios.post(`http://localhost:8080/imagens/item/${id}`, form, {
        headers:{ Authorization:`Bearer ${token}`, "Content-Type":"multipart/form-data" },
      });
      setUploadArquivo(null); setUploadPreview(null); fetchItem();
    } catch { setFeedback("Erro ao enviar imagem."); }
    finally { setUploadando(false); }
  };

  const handleDeletarImagem = async (imagemId: number) => {
    try {
      await axios.delete(`http://localhost:8080/imagens/${imagemId}`,{ headers:{ Authorization:`Bearer ${token}` } });
      fetchItem();
    } catch { setFeedback("Erro ao remover imagem."); }
  };

  const handleAvaliar = async () => {
    if (notaForm===0){ setFeedbackAv("Selecione uma nota."); return; }
    setEnviandoAv(true); setFeedbackAv("");
    try {
      await axios.post(`http://localhost:8080/avaliacoes/item/${id}`,{ nota:notaForm, comentario:comentarioForm },{ headers:{ Authorization:`Bearer ${token}` } });
      setNotaForm(0); setComentarioForm(""); setFeedbackAv("Avaliação enviada!"); fetchItem();
    } catch(err:any){ setFeedbackAv(err.response?.data??"Erro."); }
    finally { setEnviandoAv(false); }
  };

  const handleDeletarAvaliacao = async (avId: number) => {
    try {
      await axios.delete(`http://localhost:8080/avaliacoes/${avId}`,{ headers:{ Authorization:`Bearer ${token}` } });
      fetchItem();
    } catch { setFeedbackAv("Erro ao remover avaliação."); }
  };

  if (loading) return <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>Carregando...</p></div>;
  if (error||!item) return (
    <div>
      <Link to="/itens" className="inline-flex items-center gap-1.5 text-[#A0522D] text-[0.85rem] no-underline mb-8 hover:gap-2.5 transition-all">← Voltar ao catálogo</Link>
      <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>{error||"Item não encontrado."}</p></div>
    </div>
  );

  const isMeu = meuId!==null && item.vendedor?.id===meuId;
  const jaInteressado = item.interessados?.some(u=>u.id===meuId)??false;
  const statusCfg = STATUS_CFG[item.status??""]??{label:item.status??"—",bg:"bg-[#6B5744]"};
  const imagens = item.imagens??[];
  const minhaAvaliacao = avaliacoes.find(a=>a.autor?.id===meuId);
  const podeAvaliar = item.status==="VENDIDO" && !isMeu && jaInteressado && !minhaAvaliacao;
  const mediaVendedor = avaliacoesVendedor.length>0
    ? (avaliacoesVendedor.reduce((s,a)=>s+a.nota,0)/avaliacoesVendedor.length).toFixed(1) : null;

  const btnPrimary = "bg-[#A0522D] text-[#FDFAF6] px-6 py-3 text-[0.88rem] font-medium tracking-[0.06em] uppercase rounded-sm hover:bg-[#2C1A0E] transition-colors border-none cursor-pointer";
  const btnRemover = "border border-[#c9a09a] text-[#A0522D] bg-transparent px-3 py-1.5 rounded-sm text-[0.78rem] font-medium cursor-pointer hover:bg-[#A0522D] hover:text-white hover:border-[#A0522D] transition-colors";

  return (
    <div>
      <Link to="/itens" className="inline-flex items-center gap-1.5 text-[#A0522D] text-[0.85rem] no-underline mb-8 hover:gap-2.5 transition-all">← Voltar ao catálogo</Link>

      {isMeu && (
        <div className="bg-[#EDE5D8] border-l-[3px] border-[#B8956A] px-4 py-3 text-[0.9rem] text-[#6B5744] mb-7 rounded-r-sm">
          Este é um dos seus itens.{" "}
          <Link to="/meus-itens" className="text-[#A0522D] font-medium no-underline hover:underline">Gerenciar meus itens</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
        <div>
          <div className="w-full aspect-[4/3] rounded-sm overflow-hidden bg-[#EDE5D8] mb-2.5">
            {imagens.length>0
              ?<img src={imagens[fotoAtiva].url} alt={item.nome} className="w-full h-full object-cover" />
              :<div className="w-full h-full flex items-center justify-center text-7xl text-[#B8956A]">🧥</div>
            }
          </div>
          {imagens.length>1 && (
            <div className="flex gap-2 flex-wrap mb-2.5">
              {imagens.map((img,i)=>(
                <button key={img.id} onClick={()=>setFotoAtiva(i)}
                  className={`relative w-[72px] h-[72px] rounded-sm overflow-hidden p-0 border-2 cursor-pointer transition-colors ${i===fotoAtiva?"border-[#A0522D]":"border-[#EDE5D8]"}`}>
                  <img src={img.url} alt={`foto ${i+1}`} className="w-full h-full object-cover" />
                  {isMeu&&<span onClick={e=>{e.stopPropagation();handleDeletarImagem(img.id);}}
                    className="absolute top-0.5 right-0.5 bg-[rgba(44,26,14,0.75)] text-white w-4 h-4 rounded-full text-[0.6rem] flex items-center justify-center cursor-pointer">✕</span>}
                </button>
              ))}
            </div>
          )}
          {isMeu && (
            <div className="flex flex-col gap-2 mt-2">
              {imagens.length===1&&<button onClick={()=>handleDeletarImagem(imagens[0].id)} className={btnRemover}>✕ Remover foto</button>}
              <label htmlFor="upload-extra"
                className="inline-flex items-center gap-2 bg-[#EDE5D8] border-[1.5px] border-dashed border-[#B8956A] text-[#6B5744] px-4 py-2.5 rounded-sm text-[0.85rem] cursor-pointer hover:border-[#A0522D] hover:text-[#A0522D] transition-colors self-start">
                + Adicionar foto
                <input id="upload-extra" type="file" accept="image/*" className="hidden"
                  onChange={e=>{const f=e.target.files?.[0];if(f){setUploadArquivo(f);setUploadPreview(URL.createObjectURL(f));}}} />
              </label>
              {uploadPreview&&(
                <div className="flex items-center gap-2 mt-1">
                  <img src={uploadPreview} alt="preview" className="w-14 h-14 object-cover rounded-sm" />
                  <button onClick={handleUploadImagem} disabled={uploadando} className={`${btnPrimary} py-2 px-4 text-[0.8rem]`}>
                    {uploadando?"Enviando...":"Enviar"}
                  </button>
                  <button onClick={()=>{setUploadArquivo(null);setUploadPreview(null);}} className={btnRemover}>Cancelar</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          {item.categoria&&<p className="text-[0.75rem] tracking-[0.12em] uppercase text-[#6B7C6A] mb-3">{item.categoria.replace(/_/g," ")}</p>}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-[Playfair_Display,serif] text-3xl text-[#2C1A0E] leading-tight m-0">{item.nome??`Item #${item.id}`}</h1>
            <span className={`${statusCfg.bg} text-white text-[0.7rem] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full font-medium`}>{statusCfg.label}</span>
          </div>
          {item.preco!==undefined&&<p className="text-2xl font-medium text-[#A0522D] mb-6">R$ {Number(item.preco).toFixed(2).replace(".",",")}</p>}
          {item.descricao&&<p className="text-[0.95rem] text-[#6B5744] leading-[1.75] mb-8">{item.descricao}</p>}

          <div className="bg-[#EDE5D8] p-5 rounded-sm mb-7 flex flex-col gap-2.5">
            {item.condicao&&<div className="flex justify-between text-[0.88rem]"><span className="text-[0.78rem] uppercase tracking-[0.06em] text-[#6B7C6A]">Estado</span><span className="text-[#3D2B1F] font-medium">{item.condicao}</span></div>}
            {item.formaPagamentoAceitas&&<div className="flex justify-between text-[0.88rem]"><span className="text-[0.78rem] uppercase tracking-[0.06em] text-[#6B7C6A]">Pagamento</span><span className="text-[#3D2B1F] font-medium">{FORMA_LABEL[item.formaPagamentoAceitas]??item.formaPagamentoAceitas}</span></div>}
            {item.vendedor?.nome&&(
              <div className="flex justify-between text-[0.88rem] items-center">
                <span className="text-[0.78rem] uppercase tracking-[0.06em] text-[#6B7C6A]">Vendedor</span>
                <span className="flex items-center gap-2">
                  <Link to={`/perfil/${item.vendedor.id}`} className="text-[#A0522D] font-medium no-underline hover:underline">{item.vendedor.nome}</Link>
                  {mediaVendedor&&<span className="text-[0.75rem] text-[#B8956A] font-medium bg-[#D4C4B0] px-2 py-0.5 rounded-full">★ {mediaVendedor}</span>}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[0.88rem]"><span className="text-[0.78rem] uppercase tracking-[0.06em] text-[#6B7C6A]">Código</span><span className="text-[#3D2B1F] font-medium">#{item.id}</span></div>
          </div>

          {isMeu ? (
            <div className="bg-[#EDE5D8] p-4 rounded-sm text-center text-[0.9rem] text-[#6B5744]">Este item é seu. Acesse "Meus Itens" para gerenciá-lo.</div>
          ) : item.status==="VENDIDO" ? (
            <div className="bg-[#EDE5D8] p-4 rounded-sm text-center text-[0.9rem] text-[#6B5744]">Este item já foi vendido.</div>
          ) : jaInteressado ? (
            <div className="bg-[#EDE5D8] p-4 rounded-sm text-center text-[0.9rem] text-[#6B5744]">✓ Você já está na lista de interesse. O vendedor entrará em contato.</div>
          ) : (
            <button onClick={handleInteresse} disabled={enviando} className={`${btnPrimary} w-full disabled:opacity-60`}>
              {enviando?"Registrando...":item.status==="DISPONIVEL"?"Quero comprar":"Entrar na fila de espera"}
            </button>
          )}

          {feedback&&(
            <div className="mt-3 bg-[#f0f4f0] border border-[#6B7C6A] text-[#3D2B1F] px-4 py-3 rounded-sm text-[0.88rem]">{feedback}</div>
          )}
        </div>
      </div>

      {avaliacoesVendedor.length>0&&(
        <section className="mt-12 pt-8 border-t border-[#EDE5D8]">
          <h2 className="font-[Playfair_Display,serif] text-2xl text-[#2C1A0E] mb-5 flex items-center gap-3 flex-wrap">
            Reputação do vendedor
            <span className="text-[#B8956A] text-base font-normal font-[Inter,sans-serif]">★ {mediaVendedor} <span className="text-[#6B5744] text-[0.85rem]">({avaliacoesVendedor.length} avaliações)</span></span>
          </h2>
          <div className="flex flex-col gap-3">
            {avaliacoesVendedor.slice(0,3).map(a=>(
              <div key={a.id} className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm px-5 py-4">
                <div className="flex items-center gap-2.5 flex-wrap mb-2">
                  <Estrelas nota={a.nota} />
                  <span className="font-medium text-[0.9rem] text-[#2C1A0E]">{a.autor?.nome??"Usuário"}</span>
                  <span className="text-[0.78rem] text-[#6B7C6A] ml-auto">{a.data?new Date(a.data).toLocaleDateString("pt-BR"):""}</span>
                </div>
                {a.comentario&&<p className="text-[0.9rem] text-[#6B5744] leading-relaxed">{a.comentario}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 pt-8 border-t border-[#EDE5D8]">
        <h2 className="font-[Playfair_Display,serif] text-2xl text-[#2C1A0E] mb-5">
          Avaliações desta transação{avaliacoes.length>0&&<span className="text-[#6B5744] text-base font-normal font-[Inter,sans-serif]"> ({avaliacoes.length})</span>}
        </h2>

        {podeAvaliar&&(
          <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm p-5 mb-5 flex flex-col gap-3">
            <p className="font-[Playfair_Display,serif] text-lg text-[#2C1A0E]">Deixe sua avaliação</p>
            <Estrelas nota={notaForm} interativa onChange={setNotaForm} />
            <textarea className={inputCls} rows={3} placeholder="Conte como foi a experiência..."
              value={comentarioForm} onChange={e=>setComentarioForm(e.target.value)} />
            {feedbackAv&&<p className="text-[0.85rem] text-[#A0522D]">{feedbackAv}</p>}
            <button onClick={handleAvaliar} disabled={enviandoAv} className={`${btnPrimary} self-start disabled:opacity-60`}>
              {enviandoAv?"Enviando...":"Enviar avaliação"}
            </button>
          </div>
        )}

        {avaliacoes.length===0
          ?<p className="text-[0.9rem] text-[#6B7C6A] italic">Nenhuma avaliação ainda.</p>
          :<div className="flex flex-col gap-3">
            {avaliacoes.map(a=>(
              <div key={a.id} className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm px-5 py-4">
                <div className="flex items-center gap-2.5 flex-wrap mb-2">
                  <Estrelas nota={a.nota} />
                  <span className="font-medium text-[0.9rem] text-[#2C1A0E]">{a.autor?.nome??"Usuário"}</span>
                  <span className="text-[0.7rem] tracking-[0.06em] uppercase bg-[#EDE5D8] text-[#6B5744] px-2 py-0.5 rounded-full">
                    {a.tipo==="COMPRADOR_PARA_VENDEDOR"?"comprador → vendedor":"vendedor → comprador"}
                  </span>
                  <span className="text-[0.78rem] text-[#6B7C6A] ml-auto">{a.data?new Date(a.data).toLocaleDateString("pt-BR"):""}</span>
                  {a.autor?.id===meuId&&(
                    <button onClick={()=>handleDeletarAvaliacao(a.id)} className={btnRemover}>Remover</button>
                  )}
                </div>
                {a.comentario&&<p className="text-[0.9rem] text-[#6B5744] leading-relaxed">{a.comentario}</p>}
              </div>
            ))}
          </div>
        }
      </section>
    </div>
  );
}