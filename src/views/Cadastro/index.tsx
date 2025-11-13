import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";

import styles from "./index.module.css";
import logo from "../../assets/logo.png";
import background from "../../assets/background.png";
import axios from "axios";

const Cadastro: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (
      !formData.nome ||
      !formData.email ||
      !formData.senha ||
      !formData.confirmarSenha
    ) {
      setErro("Preencha todos os campos!");
      setMensagem("");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem!");
      setMensagem("");
      return;
    }

    // Envio para API
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/usuario/cadastrar`,
        {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
        }
      );

      if (response.status === 201 || response.status === 200) {
        setMensagem("Cadastro realizado com sucesso!");
        setErro("");

        // Redireciona para login após
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setErro("Algo deu errado. Tente novamente.");
        setMensagem("");
      }
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        setErro(`Erro: ${error.response.data.message}`);
      } else {
        setErro("Erro de conexão com o servidor.");
      }
      setMensagem("");
    }
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className={styles.containerLogin}>
        <img src={logo} alt="Logo SuculentuS" className={styles.logo} />

        <div className={styles.header}>
          <UserPlus size={28} strokeWidth={3} /> Cadastro
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type={senhaVisivel ? "text" : "password"}
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
            <span
              className={styles.showPasswordIcon}
              onClick={() => setSenhaVisivel(!senhaVisivel)}
            >
              {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className={styles.inputGroup}>
            <input
              type={confirmarSenhaVisivel ? "text" : "password"}
              name="confirmarSenha"
              placeholder="Confirmar senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
            />
            <span
              className={styles.showPasswordIcon}
              onClick={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)}
            >
              {confirmarSenhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {erro && <div className={styles.errorMessage}>{erro}</div>}
          {mensagem && (
            <div className={styles.errorMessage} style={{ color: "#00b050" }}>
              {mensagem}
            </div>
          )}

          <button type="submit" className={styles.loginButton}>
            Cadastrar
          </button>
        </form>

        <div className={styles.footer}>
          <span>Já tem uma conta?</span>
          <button
            type="button"
            className={styles.registerButton}
            onClick={() => navigate("/login")}
          >
            Voltar para Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
