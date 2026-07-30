import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

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

const inputCls = "px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.95rem] text-[#3D2B1F] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors";
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const labelCls = "text-[0.8rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium";

export default function CadastrarItem() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [condicao, setCondicao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState<"form"|"upload">("form");
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleArquivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setArquivos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removerImagem = (i: number) => {
    setArquivos(p => p.filter((_,j) => j!==i));
    setPreviews(p => p.filter((_,j) => j!==i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage("");
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/itens", {
        nome, descricao, preco: parseFloat(preco.replace(",",".")),
        condicao, categoria, formaPagamentoAceitas: formaPagamento,
      }, { headers:{ Authorization:`Bearer ${token}` } });

      const itemId = res.data.id;
      if (arquivos.length > 0) {
        setEtapa("upload");
        for (let i = 0; i < arquivos.length; i++) {
          const form = new FormData();
          form.append("arquivo", arquivos[i]);
          await axios.post(`http://localhost:8080/imagens/item/${itemId}`, form, {
            headers:{ Authorization:`Bearer ${token}`, "Content-Type":"multipart/form-data" },
          });
          setUploadProgress(Math.round(((i+1)/arquivos.length)*100));
        }
      }
      navigate(`/itens/${itemId}`);
    } catch { setErrorMessage("Não foi possível cadastrar o item."); }
    finally { setLoading(false); setEtapa("form"); }
  };

  return (
    <div>
      <div className="mb-10 pb-6 border-b border-[#EDE5D8]">
        <p className="text-xs tracking-[0.14em] uppercase text-[#6B7C6A] mb-2 font-medium">Venda no brechó</p>
        <h1 className="font-[Playfair_Display,serif] text-4xl text-[#2C1A0E]">Cadastrar Item</h1>
      </div>

      {errorMessage && (
        <div className="bg-[#fdf0ee] border border-[#e8bbb4] text-[#A0522D] px-4 py-3 rounded-sm text-[0.88rem] mb-6">{errorMessage}</div>
      )}

      {loading && (
        <div className="bg-[#EDE5D8] px-5 py-4 rounded-sm mb-6 text-[0.88rem] text-[#6B5744]">
          {etapa==="form" ? "Criando item..." : `Enviando imagens... ${uploadProgress}%`}
          <div className="h-1 bg-[#D4C4B0] rounded-sm mt-2.5 overflow-hidden">
            <div className="h-full bg-[#A0522D] rounded-sm transition-all duration-300"
              style={{width:`${etapa==="form"?20:uploadProgress}%`}} />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Nome do item</label>
              <input type="text" value={nome} onChange={e=>setNome(e.target.value)}
                placeholder="Ex: Vestido floral anos 70" required className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Descrição</label>
              <textarea value={descricao} onChange={e=>setDescricao(e.target.value)}
                placeholder="Descreva o item: tamanho, marca, detalhes..." rows={4} required
                className={`${inputCls} resize-y leading-relaxed`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Preço (R$)</label>
              <input type="text" value={preco} onChange={e=>setPreco(e.target.value.replace(/[^\d,\.]/g,""))}
                placeholder="0,00" required className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Categoria</label>
              <select value={categoria} onChange={e=>setCategoria(e.target.value)} required className={selectCls}>
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Estado de conservação</label>
              <select value={condicao} onChange={e=>setCondicao(e.target.value)} required className={selectCls}>
                <option value="">Selecione o estado</option>
                {CONDICOES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Forma de pagamento aceita</label>
              <select value={formaPagamento} onChange={e=>setFormaPagamento(e.target.value)} required className={selectCls}>
                <option value="">Selecione</option>
                {FORMAS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Fotos do item</label>
              <label htmlFor="imagens"
                className="inline-flex items-center gap-2 bg-[#EDE5D8] border-[1.5px] border-dashed border-[#B8956A] text-[#6B5744] px-5 py-3 rounded-sm text-[0.88rem] font-medium cursor-pointer hover:bg-[#e4d8c8] hover:border-[#A0522D] hover:text-[#A0522D] transition-colors">
                Selecionar fotos
                <input id="imagens" type="file" accept="image/*" multiple onChange={handleArquivos} className="hidden" />
              </label>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((src,i) => (
                  <div key={i} className="relative aspect-square rounded-sm overflow-hidden border border-[#EDE5D8]">
                    <img src={src} alt={`preview ${i+1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={()=>removerImagem(i)}
                      className="absolute top-1 right-1 bg-[rgba(44,26,14,0.75)] text-white w-5 h-5 rounded-full text-[0.65rem] flex items-center justify-center border-none cursor-pointer">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 items-center pt-2">
          <Link to="/itens"
            className="border-[1.5px] border-[#A0522D] text-[#A0522D] px-8 py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase no-underline rounded-sm hover:bg-[#A0522D] hover:text-white transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="bg-[#A0522D] text-[#FDFAF6] px-8 py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase rounded-sm hover:bg-[#2C1A0E] transition-colors disabled:opacity-60">
            {loading ? "Salvando..." : "Cadastrar item"}
          </button>
        </div>
      </form>
    </div>
  );
}