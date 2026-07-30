import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/auth/login", { email, senha: password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/itens");
    } catch {
      setErrorMessage("E-mail ou senha inválidos.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="bg-[#FDFAF6] border border-[#EDE5D8] rounded-sm p-10 w-full max-w-md">
        <div className="mb-7">
          <p className="text-xs tracking-[0.14em] uppercase text-[#6B7C6A] mb-3 font-medium">Bem-vindo de volta</p>
          <h1 className="font-[Playfair_Display,serif] text-3xl text-[#2C1A0E]">Entrar</h1>
        </div>

        {errorMessage && (
          <div className="bg-[#fdf0ee] border border-[#e8bbb4] text-[#A0522D] px-4 py-3 rounded-sm text-[0.88rem] mb-5">
            {errorMessage}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {[
            { id:"email", label:"E-mail", type:"email", value:email, set:setEmail, placeholder:"seu@email.com" },
            { id:"password", label:"Senha", type:"password", value:password, set:setPassword, placeholder:"••••••••" },
          ].map(({ id, label, type, value, set, placeholder }) => (
            <div key={id} className="flex flex-col gap-1.5">
              <label htmlFor={id} className="text-[0.8rem] tracking-[0.06em] uppercase text-[#6B7C6A] font-medium">{label}</label>
              <input type={type} id={id} value={value} placeholder={placeholder} required
                onChange={e => set(e.target.value)}
                className="px-3.5 py-3 border-[1.5px] border-[#EDE5D8] rounded-sm text-[0.95rem] text-[#3D2B1F] bg-[#F7F3ED] outline-none focus:border-[#A0522D] transition-colors" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="mt-2 bg-[#A0522D] text-[#FDFAF6] py-3.5 text-[0.88rem] font-medium tracking-[0.06em] uppercase rounded-sm hover:bg-[#2C1A0E] transition-colors disabled:opacity-60">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-[0.88rem] text-[#6B5744] text-center">
          Não tem conta?{" "}
          <Link to="/register" className="text-[#A0522D] font-medium no-underline hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}