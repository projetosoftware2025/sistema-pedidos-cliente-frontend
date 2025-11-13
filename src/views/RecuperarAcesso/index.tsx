import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { URL_API_USERS } from "../../utils/constants";

function RecuperarAcesso() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${URL_API_USERS}/usuario/recuperar-senha`, { email });
      setMensagem("Código de recuperação enviado ao seu e-mail!");
      navigate("/codigo-recuperar")
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao enviar código. Verifique o e-mail e tente novamente.");
    }
  };

  return (
    <form onSubmit={handleEnviar}>
      <h2>Recuperar Acesso</h2>
      <input
        type="email"
        placeholder="Digite seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Enviar Código</button>
      <p>{mensagem}</p>
    </form>
  );
}

export default RecuperarAcesso;
