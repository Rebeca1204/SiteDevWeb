import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function fmt(value: string, type: "cpf" | "tel") {
  const d = value.replace(/\D/g, "");
  if (type === "cpf") return d.slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");
  return d.slice(0,11).replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d{1,4})$/,"$1-$2");
}

const inputCls = "px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.95rem] text-[#3D2B1F] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors";
const labelCls = "text-[0.8rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage("");
    if (password !== confirmPassword) { setErrorMessage("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/auth/register", {
        nome, email, senha: password,
        cpf: cpf.replace(/\D/g,""), telefone: telefone.replace(/\D/g,""), role: "ADMIN",
      });
      navigate("/login");
    } catch { setErrorMessage("Não foi possível criar a conta. O e-mail já pode estar em uso."); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm p-10 w-full max-w-md">
        <div className="mb-7">
          <p className="text-xs tracking-[0.14em] uppercase text-[#6B7C6A] mb-3 font-medium">Crie sua conta</p>
          <h1 className="font-[Playfair_Display,serif] text-3xl text-[#2C1A0E]">Cadastro</h1>
        </div>

        {errorMessage && (
          <div className="bg-[#fdf0ee] border border-[#e8bbb4] text-[#A0522D] px-4 py-3 rounded-sm text-[0.88rem] mb-5">
            {errorMessage}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Nome completo</label>
            <input type="text" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>E-mail</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>CPF</label>
            <input type="text" value={cpf} onChange={e=>setCpf(fmt(e.target.value,"cpf"))} placeholder="000.000.000-00" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Telefone</label>
            <input type="text" value={telefone} onChange={e=>setTelefone(fmt(e.target.value,"tel"))} placeholder="(11) 99999-9999" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Senha</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Confirmar senha</label>
            <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="••••••••" required className={inputCls} />
          </div>
          <button type="submit" disabled={loading}
            className="mt-2 bg-[#A0522D] text-[#FDFAF6] py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase rounded-sm hover:bg-[#2C1A0E] transition-colors disabled:opacity-60">
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-5 text-[0.88rem] text-[#6B5744] text-center">
          Já tem conta?{" "}
          <Link to="/login" className="text-[#A0522D] font-medium no-underline hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}