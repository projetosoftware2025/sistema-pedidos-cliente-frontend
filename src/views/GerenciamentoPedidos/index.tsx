import React, { useState, useMemo, useEffect } from "react";
import styles from "./index.module.css";
import { HeaderComponent } from "../../components/Header";
import { SidebarComponent } from "../../components/SidebarComponent";
import { setSideBar } from "../../redux/reducers/appReducer";
import { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { EllipsisVertical, Info } from "lucide-react";
import { formatarReal } from "../../utils/formatarReal";

import { Search } from "lucide-react";


interface Produto {
  id: string;
  nome: string;
  valorUnitario: number;
  quantidade: number;
}

interface Pedido {
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

interface ItensPedidosInterface {
  id: number,
  idProduto: number,
  idPedido: number,
  titulo: string,
  valorUnitario: number,
  quantidade: number
}

type StatusType = "Andamento" | "Cancelado" | "Finalizado" | "Pronto" | ""

interface FiltroInterface {
  campo: string;
  dataInicial: string | null; // formato "YYYY-MM-DD"
  dataFinal: string | null;
  status: StatusType;
}

export default function GerenciamentoPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[] | null>();
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

  const [menuAtivo, setMenuAtivo] = useState<number>();
  const [detalhePedido, setDetalhePedido] = useState<ItensPedidosInterface[] | null>(null);
  const [pedidoCancelamento, setPedidoCancelamento] = useState<Pedido | null>(null);
  const [motivo, setMotivo] = useState("");
  const [pedidoPix, setPedidoPix] = useState<Pedido | null>(null); // usado para exibir o modal do comprovante
  const [confirmar, setConfirmar] = useState<"confirmar" | "recusar" | null>(null);
  const isSidebarOpen = useSelector((state: RootState) => state.app.isSidebarOpen);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido>();
  const [loading, setLoading] = useState(false);

  // === Fecha o menu ao clicar fora ===
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(`.${styles.infoButton}`) &&
        !target.closest(`.${styles.menu}`)
      ) {
        setMenuAtivo(0);
      }
    };

    document.addEventListener("click", handleClickFora);
    return () => document.removeEventListener("click", handleClickFora);
  }, []);

  // useEffect(() => {
  //   const buscarPedidos = async () => {
  //     try {
  //       const response = await axios.get(`https://sistema-pedidos-gestao-api.onrender.com/pedido/buscar-pedidos?dtInicio=${filtro.dataInicial}&dtFim=${filtro.dataFinal}`)
  //       if (response.data && response.status == 200) {
  //         setPedidos(response.data)
  //       } else if (response.status == 404) {
  //         toast.error("Pedidos não encotrados!")
  //       } else {
  //         toast.error("Pedidos não encotrados!")
  //       }
  //     } catch (error) {
  //       toast.error("Pedidos não encotrados!")
  //     }
  //   };
  //   buscarPedidos();

  // }, [filtro.dataInicial, filtro.dataFinal]);

  useEffect(() => {
    const handleClickForaModal = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (detalhePedido && target.classList.contains(styles.modal)) setDetalhePedido(null);
      if (pedidoCancelamento && target.classList.contains(styles.modal))
        setPedidoCancelamento(null);
      if (pedidoPix && target.classList.contains(styles.modal)) setPedidoPix(null);
      if (confirmar && target.classList.contains(styles.modal)) setConfirmar(null);
    };

    document.addEventListener("click", handleClickForaModal);
    return () => document.removeEventListener("click", handleClickForaModal);
  }, [detalhePedido, pedidoCancelamento, pedidoPix, confirmar]);

  const calcularTotal = (produtos: Produto[]) =>
    produtos.reduce((acc, p) => acc + p.valorUnitario * p.quantidade, 0);

  const buscarPedidos = async () => {
    setLoading(true);
    setPedidos(null)
    try {
      const response = await axios.get(`https://sistema-pedidos-gestao-api.onrender.com/pedido/buscar-pedidos?dtInicio=${filtro.dataInicial}&dtFim=${filtro.dataFinal}`)
      if (response.data && response.status == 200) {
        setPedidos(response.data)

      } else if (response.status == 404) {
        toast.error("Pedidos não encotrados!")
      } else {
        toast.error("Pedidos não encotrados!")
      }

      setLoading(false);
    } catch (error) {
      toast.error("Pedidos não encotrados!")
      setLoading(false);
    }
  };

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

  const alterarStatusPedido = async (pedido: Pedido, status: string) => {
    try {
      const response = await axios.put(
        `https://sistema-pedidos-gestao-api.onrender.com/pedido/atualizar-status?id=${pedido.id}&status=${status}`
      );

      if (response.status === 200) {
        toast.success("Status atualizado com sucesso!");
        return { ...pedido, status }; // retorna o objeto atualizado
      } else if (response.status === 404) {
        toast.error("Pedido não encontrado");
      } else {
        toast.error("Erro ao atualizar status do pedido");
      }
    } catch (error) {
      toast.error(`Erro na requisição: ${error}`);
    }
  };


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
          <h1 className={styles.title}>Gerenciamento de Pedidos</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // evita reload
            }}
          >
            {/* <input
              placeholder="Nome ou CPF"
              value={filtro.campo}
              onChange={(e) => setFiltro({ ...filtro, campo: e.target.value })}
            /> */}

            <input
              type="date"
              value={filtro.dataInicial ?? ""}
              onChange={(e) => setFiltro({ ...filtro, dataInicial: e.target.value })}
            />

            <input
              type="date"
              value={filtro.dataFinal ?? ""}
              onChange={(e) => setFiltro({ ...filtro, dataFinal: e.target.value })}
            />

            {/* <select
              value={filtro.status}
              onChange={(e) => setFiltro({ ...filtro, status: e.target.value as StatusType })}
            >
              <option value="">Status</option>
              <option value="Andamento">Andamento</option>
              <option value="Pronto">Pronto</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select> */}

            <button className={styles.buscar} onClick={buscarPedidos} disabled={loading}>
              <Search width={20} height={20} />{" "}
              Buscar</button>
          </form>


        </div>

        {/* TABELA */}
        {pedidos?.length ? <table className={styles.table}>
          <thead>
            <tr>
              <th>N°</th>
              <th>Cliente</th>
              <th>CPF</th>
              <th>Data do pedido</th>
              <th>Forma de pagamento</th>
              {/* <th>Qtd</th>
              <th>Valor</th> */}
              <th>Status</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {pedidos?.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.cliente}</td>
                <td>{p.cpf}</td>
                <td>
                  {new Date(p.dtPedido).toLocaleDateString()}{" "}
                  {new Date(p.dtPedido).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td>{p.formaPagamento}</td>
                {/* <td>{p.produtos.length}</td> */}
                {/* <td>R$ {calcularTotal(p.produtos).toFixed(2)}</td> */}
                <td>
                  <span
                    className={`${styles.status} ${styles[p.status]}`}
                    style={{
                      color:
                        p.status === "A"
                          ? "black"
                          : "white",
                      background:
                        p.status === "A"
                          ? "#F9A825" // amarelo
                          : p.status === "P"
                            ? "#43A047" // verde
                            : p.status === "R"
                              ? "#1976D2" // azul
                              : p.status === "F"
                                ? "#6A1B9A" // roxo
                                : "#E53935", // vermelho
                    }}
                  >
                    {p.status === "A"
                      ? "Aguardando Pagamento"
                      : p.status === "P"
                        ? "Pagamento Aprovado"
                        : p.status === "R"
                          ? "Pronto"
                          : p.status === "F"
                            ? "Finalizado"
                            : "Cancelado"}
                  </span>

                </td>

                {/* ======= MENU DE OPÇÕES ======= */}
                <td className={styles.acoes}>
                  <button
                    className={styles.infoButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuAtivo(menuAtivo === p.id ? 0 : p.id);
                      // buscarDadosPedido(p.id)
                      // setPedidoSelecionado(p)
                    }}
                  >
                    <EllipsisVertical size={28} color="orange" />
                  </button>

                  {menuAtivo === p.id && (
                    <div className={styles.menu}>
                      <button onClick={() => {
                        buscarDadosPedido(p.id)
                        setPedidoSelecionado(p)
                        setMenuAtivo(0);
                      }}>
                        Visualizar pedido
                      </button>

                      {p.formaPagamento == "Pix" || (p.status == "F" || p.status == "C") ? <button onClick={() => {

                        setPedidoSelecionado(p)
                      }}>
                        Ver comprovante
                      </button> : null}

                      {(p.status !== "F" && p.status !== "C") ? (
                        <button
                          onClick={async () => {
                            setMenuAtivo(0);
                            const pedidoAtualizado = await alterarStatusPedido(p, "C");
                            if (pedidoAtualizado) {
                              setPedidos(prev =>
                                pedidos.map(item =>
                                  item.id === pedidoAtualizado.id ? pedidoAtualizado : item
                                )
                              );
                            }
                            
                          }}
                        >
                          Cancelar pedido
                        </button>

                      ) : null}

                      {p.status == "P"  ? (
                      <button
                        onClick={async () => {
                          setMenuAtivo(0);
                         const pedidoAtualizado = await alterarStatusPedido(p, "R");
                            if (pedidoAtualizado) {
                              setPedidos(prev =>
                                pedidos.map(item =>
                                  item.id === pedidoAtualizado.id ? pedidoAtualizado : item
                                )
                              );
                            }
                            
                        }}
                      >
                        Chamar cliente
                      </button>
                      ) : null} 

                      {p.status == "R" ? (
                        <button
                          onClick={async () => {
                            setMenuAtivo(0);
                            const pedidoAtualizado = await alterarStatusPedido(p, "F");
                            if (pedidoAtualizado) {
                              setPedidos(prev =>
                                pedidos.map(item =>
                                  item.id === pedidoAtualizado.id ? pedidoAtualizado : item
                                )
                              );
                            }
                            
                          }}
                        >
                          Finalizar pedido
                        </button>
                      ) : null}


                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table> :
          <div>

          </div>
        }

        {detalhePedido && pedidoSelecionado ? (
          <div className={styles.modal}>
            <div className={styles.card}>
              <h2>Detalhes do pedido Nº {pedidoSelecionado?.id}</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>

                  {detalhePedido.map((p, index) => (
                    <tr key={p.id}>
                      <td>{p.idProduto}</td>
                      <td>{p.titulo}</td>
                      <td>{p.quantidade}</td>
                      <td>{formatarReal(p.quantidade * p.valorUnitario)}</td>
                    </tr>
                  ))}


                </tbody>
              </table>
              {/* <h3>Valor total: R$ {calcularTotal(detalhePedido.produtos).toFixed(2)}</h3> */}
              <div className={styles.actions}>
                <button onClick={() => setDetalhePedido(null)}>Fechar</button>
              </div>
            </div>
          </div>
        ) : ""}

        {/* MODAL CANCELAMENTO */}
        {pedidoCancelamento && (
          <div className={styles.modal}>
            <div className={styles.card}>
              <h2>Cancelar pedido Nº {pedidoCancelamento.numero}</h2>
              <textarea
                placeholder="Insira aqui o motivo do cancelamento"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
              <div className={styles.actions}>
                <button onClick={() => setPedidoCancelamento(null)}>Voltar</button>
                <button
                  className={styles.enviar}
                // onClick={() => atualizarStatus(pedidoCancelamento.numero, "Cancelado")}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        {pedidoPix && (
          <div className={styles.modal}>
            <div className={styles.card}>
              <h2>Comprovante Pix</h2>
              <p>Pedido Nº {pedidoPix.numero}</p>

              {/* Caixa onde o comprovante Pix pode ser exibido */}
              <div className={styles.pixBox}></div>

              <div className={styles.actions}>
                <button className={styles.recusar} onClick={() => setConfirmar("recusar")}>
                  Recusar pagamento
                </button>
                <button className={styles.confirmar} onClick={() => setConfirmar("confirmar")}>
                  Confirmar pagamento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMAR/RECUSAR PIX */}
        {confirmar && (
          <div className={styles.modal}>
            <div className={styles.alert}>
              <h3>
                {confirmar === "confirmar" ? "Confirmar pagamento" : "Recusar comprovante"}
              </h3>
              <p>Você tem certeza que deseja {confirmar} este pagamento?</p>
              <div className={styles.actions}>
                <button onClick={() => setConfirmar(null)}>Voltar</button>
                <button
                  className={confirmar === "confirmar" ? styles.confirmar : styles.recusar}
                  onClick={() => {
                    setConfirmar(null);
                    setPedidoPix(null);
                  }}
                >
                  {confirmar === "confirmar" ? "Confirmar" : "Recusar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>



    </div>
  );
}
