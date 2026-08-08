import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { getUsuarioId } from "../utils/auth";

interface Telefone { numero: string; }
interface Usuario { id: number; nome?: string; email?: string; chavePix?: string; telefones?: Telefone[]; formaPagamentoPreferida?: string; }
interface Avaliacao { id: number; nota: number; comentario?: string; data?: string; tipo?: string; autor?: { id: number; nome?: string }; item?: { id: number; nome?: string }; }

const FORMA_LABEL: Record<string,string> = { PIX:"Pix", DINHEIRO:"Dinheiro", AMBOS:"Pix e Dinheiro" };

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="flex gap-1">
      {[1,2,3,4,5].map(n=>(
        <span key={n} className={`text-xl leading-none ${n<=nota?"text-[#B8956A]":"text-[#EDE5D8]"}`}>★</span>
      ))}
    </span>
  );
}

function SecaoAvaliacoes({ titulo, lista }: { titulo: string; lista: Avaliacao[] }) {
  return (
    <section className="mt-10 pt-8 border-t border-[#EDE5D8]">
      <h2 className="font-[Playfair_Display,serif] text-2xl text-[#2C1A0E] mb-5">
        {titulo}{lista.length>0&&<span className="text-[#6B5744] text-base font-normal font-[Inter,sans-serif]"> ({lista.length})</span>}
      </h2>
      {lista.length===0
        ?<p className="text-[0.9rem] text-[#6B7C6A] italic">Nenhuma avaliação ainda.</p>
        :<div className="flex flex-col gap-3">
          {lista.map(a=>(
            <div key={a.id} className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm px-5 py-4">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <Estrelas nota={a.nota} />
                <span className="font-medium text-[0.9rem] text-[#2C1A0E]">{a.autor?.nome??"Usuário"}</span>
                {a.item&&(
                  <Link to={`/itens/${a.item.id}`} className="text-[0.78rem] italic text-[#A0522D] no-underline hover:underline">
                    re: {a.item.nome??`Item #${a.item.id}`}
                  </Link>
                )}
                <span className="text-[0.78rem] text-[#6B7C6A] ml-auto">{a.data?new Date(a.data).toLocaleDateString("pt-BR"):""}</span>
              </div>
              {a.comentario&&<p className="text-[0.9rem] text-[#6B5744] leading-relaxed">{a.comentario}</p>}
            </div>
          ))}
        </div>
      }
    </section>
  );
}

export default function Perfil() {
  const { id } = useParams<{ id: string }>();
  const [usuario, setUsuario] = useState<Usuario|null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const meuId = getUsuarioId();
  const token = localStorage.getItem("token");
  const isProprioId = meuId!==null && meuId===Number(id);

  useEffect(()=>{
    Promise.all([
      axios.get(`http://localhost:8080/usuario/${id}`, { headers:{ Authorization:`Bearer ${token}` } }),
      axios.get(`http://localhost:8080/avaliacoes/usuario/${id}`),
    ]).then(([resUser, resAv])=>{ setUsuario(resUser.data); setAvaliacoes(resAv.data); })
      .catch(()=>setError("Não foi possível carregar o perfil."))
      .finally(()=>setLoading(false));
  },[id]);

  if (loading) return <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>Carregando...</p></div>;
  if (error||!usuario) return <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>{error||"Perfil não encontrado."}</p></div>;

  const media = avaliacoes.length>0 ? (avaliacoes.reduce((s,a)=>s+a.nota,0)/avaliacoes.length).toFixed(1) : null;
  const comoVendedor  = avaliacoes.filter(a=>a.tipo==="COMPRADOR_PARA_VENDEDOR");
  const comoComprador = avaliacoes.filter(a=>a.tipo==="VENDEDOR_PARA_COMPRADOR");

  return (
    <div>
      <div className="flex items-start gap-6 pb-8 border-b border-[#EDE5D8] mb-8 flex-wrap">
        <div className="w-18 h-18 rounded-full bg-[#2C1A0E] text-[#B8956A] font-[Playfair_Display,serif] text-3xl flex items-center justify-center flex-shrink-0 w-[72px] h-[72px]">
          {(usuario.nome??usuario.email??"?")[0].toUpperCase()}
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <h1 className="font-[Playfair_Display,serif] text-3xl text-[#2C1A0E] leading-tight">{usuario.nome??"Usuário"}</h1>
          {isProprioId&&<p className="text-[0.88rem] text-[#6B5744]">{usuario.email}</p>}
          {media&&(
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Estrelas nota={Math.round(Number(media))} />
              <span className="text-[#B8956A] font-medium">{media}</span>
              <span className="text-[#6B5744] text-[0.85rem]">({avaliacoes.length} avaliação{avaliacoes.length!==1?"ões":""})</span>
            </div>
          )}
        </div>
        {isProprioId&&(
          <Link to="/perfil/editar"
            className="border-[1.5px] border-[#A0522D] text-[#A0522D] px-5 py-2.5 text-[0.85rem] font-medium tracking-wide uppercase no-underline rounded-sm hover:bg-[#A0522D] hover:text-white transition-colors self-start">
            Editar perfil
          </Link>
        )}
      </div>

      {isProprioId&&(
        <div className="mb-8">
          <h2 className="font-[Playfair_Display,serif] text-xl text-[#2C1A0E] mb-4">Seus dados</h2>
          <div className="bg-[#EDE5D8] p-5 rounded-sm flex flex-col gap-2.5">
            {usuario.telefones&&usuario.telefones.length>0&&(
              <div className="flex justify-between text-[0.88rem]">
                <span className="text-[0.78rem] uppercase tracking-[0.06em] text-[#6B7C6A]">Telefone</span>
                <span className="text-[#3D2B1F] font-medium">{usuario.telefones.map(t=>t.numero).join(", ")}</span>
              </div>
            )}
            {usuario.chavePix&&(
              <div className="flex justify-between text-[0.88rem]">
                <span className="text-[0.78rem] uppercase tracking-[0.06em] text-[#6B7C6A]">Chave Pix</span>
                <span className="text-[#3D2B1F] font-medium">{usuario.chavePix}</span>
              </div>
            )}
            {usuario.formaPagamentoPreferida&&(
              <div className="flex justify-between text-[0.88rem]">
                <span className="text-[0.78rem] uppercase tracking-[0.06em] text-[#6B7C6A]">Pagamento preferido</span>
                <span className="text-[#3D2B1F] font-medium">{FORMA_LABEL[usuario.formaPagamentoPreferida]??usuario.formaPagamentoPreferida}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <SecaoAvaliacoes titulo="Como vendedor" lista={comoVendedor} />
      <SecaoAvaliacoes titulo="Como comprador" lista={comoComprador} />
    </div>
  );
}