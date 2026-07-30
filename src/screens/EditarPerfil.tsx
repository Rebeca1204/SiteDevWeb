import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUsuarioId } from "../utils/auth";

interface Usuario { id: number; nome?: string; email?: string; chavePix?: string; telefones?: { numero: string }[]; formaPagamentoPreferida?: string; }
const FORMAS = [["","Nenhuma preferência"],["PIX","Pix"],["DINHEIRO","Dinheiro"],["AMBOS","Pix e Dinheiro"]];
function fmtTel(v: string) { return v.replace(/\D/g,"").slice(0,11).replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d{1,4})$/,"$1-$2"); }

const inputCls = "w-full px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.95rem] text-[#3D2B1F] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors";
const labelCls = "text-[0.8rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium";

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState<Usuario|null>(null);
  const [nome, setNome] = useState(""); const [telefone, setTelefone] = useState("");
  const [chavePix, setChavePix] = useState(""); const [formaPagamento, setFormaPagamento] = useState("");
  const [novaSenha, setNovaSenha] = useState(""); const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(true); const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(""); const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");
  const meuId = getUsuarioId();
  const navigate = useNavigate();

  useEffect(()=>{
    axios.get("http://localhost:8080/usuario/me",{ headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>{ const u=r.data; setUsuario(u); setNome(u.nome??""); setChavePix(u.chavePix??""); setFormaPagamento(u.formaPagamentoPreferida??""); setTelefone(u.telefones?.[0]?.numero??""); })
      .catch(()=>setErro("Não foi possível carregar seu perfil."))
      .finally(()=>setLoading(false));
  },[]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault(); setFeedback(""); setErro("");
    if (novaSenha&&novaSenha!==confirmarSenha){ setErro("As senhas não coincidem."); return; }
    setSalvando(true);
    try {
      await axios.put("http://localhost:8080/usuario/me",
        { nome, chavePix, telefone:telefone.replace(/\D/g,""), formaPagamentoPreferida:formaPagamento||null, novaSenha:novaSenha||null },
        { headers:{ Authorization:`Bearer ${token}` } });
      setFeedback("Perfil atualizado com sucesso!"); setNovaSenha(""); setConfirmarSenha("");
    } catch { setErro("Erro ao salvar. Tente novamente."); }
    finally { setSalvando(false); }
  };

  if (loading) return <div className="flex flex-col items-center py-20 text-[#6B5744]"><p>Carregando...</p></div>;

  return (
    <div>
      <div className="mb-10 pb-6 border-b border-[#EDE5D8]">
        <p className="text-xs tracking-[0.14em] uppercase text-[#6B7C6A] mb-2 font-medium">Seu perfil</p>
        <h1 className="font-[Playfair_Display,serif] text-4xl text-[#2C1A0E]">Editar Perfil</h1>
      </div>

      {feedback&&<div className="bg-[#f0f4f0] border border-[#6B7C6A] text-[#3D2B1F] px-4 py-3 rounded-sm text-[0.88rem] mb-6">✓ {feedback}</div>}
      {erro&&<div className="bg-[#fdf0ee] border border-[#e8bbb4] text-[#A0522D] px-4 py-3 rounded-sm text-[0.88rem] mb-6">{erro}</div>}

      <form onSubmit={handleSalvar}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>E-mail (não editável)</label>
              <input type="email" value={usuario?.email??""} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Nome</label>
              <input type="text" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome completo" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Telefone</label>
              <input type="text" value={telefone} onChange={e=>setTelefone(fmtTel(e.target.value))} placeholder="(11) 99999-9999" className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Chave Pix</label>
              <input type="text" value={chavePix} onChange={e=>setChavePix(e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Pagamento preferido</label>
              <select value={formaPagamento} onChange={e=>setFormaPagamento(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                {FORMAS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div className="bg-[#EDE5D8] rounded-sm p-4 flex flex-col gap-4">
              <p className="text-[0.85rem] font-medium text-[#3D2B1F]">
                Alterar senha <span className="font-normal text-[#6B7C6A]">(deixe em branco para manter)</span>
              </p>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Nova senha</label>
                <input type="password" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)} placeholder="••••••••" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Confirmar nova senha</label>
                <input type="password" value={confirmarSenha} onChange={e=>setConfirmarSenha(e.target.value)} placeholder="••••••••" className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center pt-2">
          <button type="button" onClick={()=>navigate(`/perfil/${meuId}`)}
            className="border-[1.5px] border-[#A0522D] text-[#A0522D] px-8 py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase rounded-sm hover:bg-[#A0522D] hover:text-white transition-colors bg-transparent cursor-pointer">
            Ver meu perfil
          </button>
          <button type="submit" disabled={salvando}
            className="bg-[#A0522D] text-[#FDFAF6] px-8 py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase rounded-sm hover:bg-[#2C1A0E] transition-colors disabled:opacity-60 border-none cursor-pointer">
            {salvando?"Salvando...":"Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}