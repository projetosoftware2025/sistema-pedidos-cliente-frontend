import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import logo from "../../assets/logo.png";
import background from "../../assets/background.png";

export const TeladeFinalizacao: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `linear-gradient(rgba(255,138,0,0.85), rgba(229,46,113,0.85)), url(${background})`,
      }}
    >
      <div className={styles.containerFinalizacao}>
        <img src={logo} alt="Logo Suculent.us" className={styles.logo} />
        <h2 className={styles.header}>Pronto!</h2>
        <p className={styles.description}>
          Sua senha foi alterada com sucesso!<br />
          Faça login com sua nova senha.
        </p>
        <button
          className={styles.loginButton}
          onClick={() => navigate("/login")}
        >
          Fazer login
        </button>
      </div>
    </div>
  );
};

export default TeladeFinalizacao;
