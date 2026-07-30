import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  useEffect(() => { localStorage.clear(); navigate("/login"); }, []);
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-[#6B5744]">
      Saindo...
    </div>
  );
}