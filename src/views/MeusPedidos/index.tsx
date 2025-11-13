import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";

interface Produto {
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

interface Pedido {
  id: number;
  descricao: string;
  data: string;
  status: "pendente" | "finalizado" | "cancelado" | "aguardando";
  produtos: Produto[];
}

export const MeusPedidos: React.FC = () => {
  const [pedidoAberto, setPedidoAberto] = useState<number | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const navigate = useNavigate()

  const pedidos: Pedido[] = [
    {
      id: 14,
      descricao: "Suco de manga 300ml, Café expresso 160ml, Tapioca com queijo",
      data: "15/10/2025 às 09:29",
      status: "aguardando",
      produtos: [
        { nome: "Suco de manga 300ml", quantidade: 1, valorUnitario: 6.99 },
        { nome: "Café expresso 160ml", quantidade: 1, valorUnitario: 5.5 },
        { nome: "Tapioca com queijo", quantidade: 1, valorUnitario: 8.99 },
      ],
    },
    {
      id: 15,
      descricao: "Café com leite 200ml, Pão na chapa",
      data: "15/10/2025 às 10:15",
      status: "pendente",
      produtos: [
        { nome: "Café com leite 200ml", quantidade: 1, valorUnitario: 4.99 },
        { nome: "Pão na chapa", quantidade: 2, valorUnitario: 3.5 },
      ],
    },
    {
      id: 16,
      descricao: "Suco natural 400ml",
      data: "15/10/2025 às 11:00",
      status: "finalizado",
      produtos: [
        { nome: "Suco natural 400ml", quantidade: 1, valorUnitario: 7.99 },
      ],
    },
    {
      id: 17,
      descricao: "Misto quente, Coca 350ml",
      data: "15/10/2025 às 12:00",
      status: "cancelado",
      produtos: [
        { nome: "Misto quente", quantidade: 1, valorUnitario: 8.5 },
        { nome: "Coca 350ml", quantidade: 1, valorUnitario: 6.0 },
      ],
    },
  ];

  const getStatusColor = (status: Pedido["status"]) => {
    switch (status) {
      case "aguardando":
        return "#A6A6A6";
      case "pendente":
        return "#0047FF";
      case "finalizado":
        return "#00A313";
      case "cancelado":
        return "#E50000";
      default:
        return "#999";
    }
  };

  const togglePedido = (id: number) => {
    setPedidoAberto(pedidoAberto === id ? null : id);
  };

  const handleCancelarPedido = (id: number) => {
    alert(`Pedido #${id} cancelado com sucesso!`);
  };

  const pedidosFiltrados =
    filtroStatus === ""
      ? pedidos
      : pedidos.filter(
        (p) => p.status.toLowerCase() === filtroStatus.toLowerCase()
      );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.toBack} onClick={() => navigate("/")}>
          <ChevronLeft size={32} strokeWidth={2} />
        </div>
        <span>Meus pedidos</span>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label>Data inicial</label>
          <input type="date" className={styles.dateInput} />
        </div>
        <div className={styles.filterItem}>
          <label>Data final</label>
          <input type="date" className={styles.dateInput} />
        </div>
        <div className={styles.filterItem}>
          <label>Status</label>
          <select
            className={styles.select}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
            <option value="aguardando">Aguardando</option>
          </select>
        </div>
      </div>

      <div className={styles.list}>
        {pedidosFiltrados.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>
            Nenhum pedido encontrado para o status selecionado.
          </p>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              className={styles.card}
              onClick={() => togglePedido(pedido.id)}
            >
              <div
                className={styles.statusBar}
                style={{ backgroundColor: getStatusColor(pedido.status) }}
              >
                #{pedido.id}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3>{pedido.descricao}</h3>
                  {pedidoAberto === pedido.id ? (
                    <ChevronUp size={22} />
                  ) : (
                    <ChevronDown size={22} />
                  )}
                </div>

                <p className={styles.orderDate}>
                  Data do pedido: {pedido.data}
                </p>

                {pedidoAberto === pedido.id && (
                  <div className={styles.details}>
                    <p>
                      Valor total:{" "}
                      <strong>
                        R$
                        {pedido.produtos
                          .reduce(
                            (total, p) =>
                              total + p.quantidade * p.valorUnitario,
                            0
                          )
                          .toFixed(2)
                          .replace(".", ",")}
                      </strong>
                    </p>

                    { /*STATUS ABAIXO DO VALOR TOTAL */}
                    <p
                      style={{
                        fontWeight: "600",
                        marginTop: "4px",
                        marginBottom: "10px",
                      }}
                    >
                      Status:{" "}
                      {pedido.status.charAt(0).toUpperCase() +
                        pedido.status.slice(1).toLowerCase()}
                    </p>

                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Qtd</th>
                          <th>Valor unit.</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedido.produtos.map((p, i) => (
                          <tr key={i}>
                            <td>{p.nome}</td>
                            <td>{p.quantidade}</td>
                            <td>
                              R$ {p.valorUnitario.toFixed(2).replace(".", ",")}
                            </td>
                            <td>
                              R${" "}
                              {(p.quantidade * p.valorUnitario)
                                .toFixed(2)
                                .replace(".", ",")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {(pedido.status === "aguardando" ||
                      pedido.status === "pendente") && (
                        <button
                          className={styles.cancelBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelarPedido(pedido.id);
                          }}
                        >
                          Cancelar pedido
                        </button>
                      )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
