import { useState } from "react";
import axios from "axios";

function RedefinirSenha() {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(`${apiUrl}/usuario/validar-codigo`, {
        email,
        codigo,
        novaSenha,
      });
      setMensagem("Senha redefinida com sucesso!");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao redefinir senha. Verifique os dados e tente novamente.");
    }
  };

  return (
    <form onSubmit={handleRedefinir}>
      <h2>Redefinir Senha</h2>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Código"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        required
      />
      <button type="submit">Redefinir Senha</button>
      <p>{mensagem}</p>
    </form>
  );
}

export default RedefinirSenha;


