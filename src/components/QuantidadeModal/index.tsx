import React, { useState } from "react";
import styles from "./index.module.css";
import { formatarReal } from "../../utils/formatarReal";
import { URL_API_GESTAO } from "../../utils/constants";

interface QuantidadeModalProps {
  produto: {
    id: number;
    titulo: string;
    preco: number;
    url: string;
  };
  onConfirm: (quantidade: number) => void;
  onClose: () => void;
}

export const QuantidadeModal: React.FC<QuantidadeModalProps> = ({
  produto,
  onConfirm,
  onClose,
}) => {
  const [quantidade, setQuantidade] = useState(1);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{produto.titulo}</h3>
        <img src={`${URL_API_GESTAO}/produto/imagem/${produto.id}`} alt={produto.titulo} className={styles.produtoImg}/>
        <p className={styles.preco}>Valor: {formatarReal(produto.preco)}</p>
        <p className={styles.preco}>Total: {formatarReal(produto.preco * quantidade)}</p>

        <div className={styles.controls}>
          <button onClick={() => setQuantidade((prev) => (prev > 1 ? prev - 1 : prev))}>-</button>
          <span>{quantidade}</span>
          <button onClick={() => setQuantidade((prev) => prev + 1)}>+</button>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={() => onConfirm(quantidade)}>Adicionar</button>
        </div>
      </div>
    </div>
  );
};
