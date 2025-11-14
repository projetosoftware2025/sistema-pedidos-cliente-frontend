import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";
import { HeaderComponent } from "../../components/Header";
import { SidebarComponent } from "../../components/SidebarComponent";
import { useDispatch, useSelector } from "react-redux";
import { setSideBar } from "../../redux/reducers/appReducer";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import axios from "axios";
import { UserInterface } from "../../app/models/interfaces/UserInterface";

interface Produto {
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

type StatusType = "Andamento" | "Cancelado" | "Finalizado" | "Pronto" | ""

export interface Pedido {
  id: number;
  numero: string;
  cliente: string;
  cpf: string;
  dtPedido: string;
  dtFInalizacao: string | null;
  dtCancelamento: string | null;
  formaPagamento: string;
  status: string;
}

export interface FiltroInterface {
  campo: string;
  dataInicial: string | null; // formato "YYYY-MM-DD"
  dataFinal: string | null;
  status: StatusType;
}

interface ItensPedidosInterface {
  id: number,
  idProduto: number,
  idPedido: number,
  titulo: string,
  valorUnitario: number,
  quantidade: number
}

export const MeusPedidos: React.FC = () => {
  const [pedidoAberto, setPedidoAberto] = useState<number | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [pedidos, setPedidos] = useState<Pedido[] | null>();
  const isSidebarOpen = useSelector((state: RootState) => state.app.isSidebarOpen);
  const [detalhePedido, setDetalhePedido] = useState<ItensPedidosInterface[] | null>(null);
  const navigate = useNavigate();
  const user: UserInterface = useSelector(
    (state: RootState) => state.auth.user
  );
  const dispatch = useDispatch()

  const hoje = new Date();
  const tresDiasAtras = new Date();
  tresDiasAtras.setDate(hoje.getDate() - 3);

  // formatar para "YYYY-MM-DD"
  const formatarData = (data: Date) => data.toISOString().split("T")[0];

  const [filtro, setFiltro] = useState<FiltroInterface>({
    campo: "",
    dataInicial: formatarData(tresDiasAtras),
    dataFinal: formatarData(hoje),
    status: "",
  });


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
    buscarDadosPedido(id)
  };

  const handleCancelarPedido = (id: number) => {
    alert(`Pedido #${id} cancelado com sucesso!`);
  };

  const pedidosFiltrados =
    filtroStatus === ""
      ? pedidos
      : pedidos?.filter(
        (p) => p.status.toLowerCase() === filtroStatus.toLowerCase()
      );

  // const buscarPedidos = async () => {
  //   // setLoading(true);
  //   // setPedidos(null)
  //   try {
  //     const response = await axios.get(`https://sistema-pedidos-gestao-api.onrender.com/pedido/buscar-pedidos?dtInicio=${filtro.dataInicial}&dtFim=${filtro.dataFinal}`)
  //     if (response.data && response.status == 200) {
  //       setPedidos(response.data)

  //     } else if (response.status == 404) {
  //       toast.error("Pedidos não encotrados!")
  //     } else {
  //       toast.error("Pedidos não encotrados!")
  //     }

  //     // setLoading(false);
  //   } catch (error) {
  //     toast.error("Pedidos não encotrados!")
  //     // setLoading(false);
  //   }
  // };

  const buscarDadosPedido = async (id: number) => {
    try {
      const response = await axios.get(`https://sistema-pedidos-gestao-api.onrender.com/itens-pedido/buscar-itens?idPedido=${id}`)
      if (response.data && response.status == 200) {
        setDetalhePedido(response.data)
      } else if (response.status == 404) {
        toast.error("Itens não encotrados!")
      } else {
        toast.error("Erro ao buscar dados do pedido")
      }
    } catch (error) {
      toast.error(`Erro na requisição: ${error}`)
    }
  };

  useEffect(() => {
    const buscarPedidos = async () => {
      try {
        const response = await axios.get(`https://sistema-pedidos-gestao-api.onrender.com/pedido/buscar-pedidos?dtInicio=${filtro.dataInicial}&dtFim=${filtro.dataFinal}&cpf=${user.cpf}`)
        if (response.data && response.status == 200) {
          setPedidos(response.data)
        } else if (response.status == 404) {
          toast.error("Pedidos não encotrados!")
        } else {
          toast.error("Pedidos não encotrados!")
        }
      } catch (error) {
        toast.error("Pedidos não encotrados!")
      }
    };
    buscarPedidos();

  }, [filtro.dataInicial, filtro.dataFinal]);

  return (
    <div className={styles.container}>
      <HeaderComponent device="desktop" />

      <div className={styles.containerBox}>
        <SidebarComponent
          isOpen={isSidebarOpen}
          onClose={() => dispatch(setSideBar(false))}
          device={"desktop"}
        />
        <div className={styles.filters}>
          <div className={styles.filterItem}>
            <label>Data inicial</label>
            <input type="date" className={styles.dateInput} value={filtro.dataInicial ?? ""} onChange={(e) => setFiltro({ ...filtro, dataInicial: e.target.value })} />
          </div>
          <div className={styles.filterItem}>
            <label>Data final</label>
            <input type="date" className={styles.dateInput} value={filtro.dataFinal ?? ""} onChange={(e) => setFiltro({ ...filtro, dataFinal: e.target.value })} />
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
          {pedidosFiltrados?.length === 0 ? (
            <p style={{ textAlign: "center", color: "#777" }}>
              Nenhum pedido encontrado para o status selecionado.
            </p>
          ) : (
            pedidosFiltrados?.map((pedido) => (
              <div
                key={pedido.id}
                className={styles.card}
                onClick={() => togglePedido(pedido.id)}

              >
                <div
                  className={styles.statusBar}
                  style={{
                    color:
                      pedido.status === "A"
                        ? "black"
                        : "white",
                    background:
                      pedido.status === "A"
                        ? "#F9A825" // amarelo
                        : pedido.status === "P"
                          ? "#43A047" // verde
                          : pedido.status === "R"
                            ? "#1976D2" // azul
                            : pedido.status === "F"
                              ? "#6A1B9A" // roxo
                              : "#E53935", // vermelho
                  }}
                >
                  #{pedido.id}
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3>{pedido.cliente}</h3>
                    {pedidoAberto === pedido.id ? (
                      <ChevronUp size={22} />
                    ) : (
                      <ChevronDown size={22} />
                    )}
                  </div>

                  <p className={styles.orderDate}>
                    Data do pedido: {pedido.dtPedido}
                  </p>

                  {pedidoAberto === pedido.id && (
                    <div className={styles.details}>
                      <p>
                        Valor total:{" "}
                        <strong>
                          R$
                          {detalhePedido
                            ?.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0)
                            .toFixed(2)
                            .replace(".", ",")}


                        </strong>
                      </p>
                      <p
                        style={{
                          fontWeight: "600",
                          marginTop: "4px",
                          marginBottom: "10px",
                        }}
                      >
                        Status:{" "}
                        {pedido.status === "A"
                          ? "Aguardando Pagamento"
                          : pedido.status === "P"
                            ? "Pagamento Aprovado"
                            : pedido.status === "R"
                              ? "Pronto"
                              : pedido.status === "F"
                                ? "Finalizado"
                                : "Cancelado"}
                      </p>

                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Produto</th>
                            <th>Qtd</th>
                            <th>Valor unit.</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalhePedido?.map((p, i) => (
                            <tr key={i}>
                              <td>{p.id}</td>
                              <td>{p.titulo}</td>
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

                      {/* {(pedido.status === "aguardando" ||
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
                        )} */}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
