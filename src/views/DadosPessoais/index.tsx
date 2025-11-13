import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { ChevronLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ClienteInterface } from "../../app/models/interfaces/ClienteInterface";
import { RootState } from "../../redux/store";
import { resetCliente, setCliente } from "../../redux/reducers/authReducer";
import { useEffect, useState } from "react";
import { CartItemInterface, clearCart } from "../../redux/reducers/cartReducer";
import { ModalRevisarPedido } from "../../components/ModalRevisarPedido";
import { PagamentoType } from "../../app/models/types/PagamentoType";
import { toast } from "react-toastify";
import axios from "axios";
import { URL_API_GESTAO } from "../../utils/constants";
import { DadosInterface } from "../../app/models/interfaces/DadosInterface";

export const DadosPessoais = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const cliente: ClienteInterface = useSelector(
        (state: RootState) => state.auth.cliente
    );
    const carrinho: CartItemInterface[] = useSelector(
        (state: RootState) => state.cart.cartProdutos
    );
    const lastPath: string = useSelector(
        (state: RootState) => state.app.lastPath
    );

    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<DadosInterface>({
        cliente: "",
        cpf: "",
        telefone: "",
        formaPagamento: "Dinheiro"
    });

    const opcoesPagamento: PagamentoType[] = [
        "Dinheiro",
        "Cartão de Crédito",
        "Cartão de Débito",
        "Pix"
    ];

    const abrirModal = () => {
        if (!formData.cliente || !formData.cpf || !formData.telefone) {
            setError("Preencha todos os dados pessoais!");
            return;
        }
        setError("");
        setIsModalOpen(true);
    };

    const confirmarItensPedido = async (
        idPedido: number,
        cart: CartItemInterface[]
    ) => {
        if (cart.length === 0) {
            return;
        }

        const itemRequests = cart.map((item) => {
            const itemPayload = {
                idPedido: idPedido,
                idProduto: item.id,
                titulo: item.titulo,
                valorUnitario: item.preco,
                quantidade: item.quantidade,
            };
            return axios.post(`${URL_API_GESTAO}/itens-pedido/cadastrar`, itemPayload);
        });
        await Promise.all(itemRequests);
    };


    const confirmarPedido = async (cart: CartItemInterface[]) => {

        const currentCart = carrinho;

        if (!formData.cliente || !formData.cpf || !formData.formaPagamento || !formData.telefone) {
            setError("Informe todos os dados do cliente!");
            return;
        }

        if (currentCart.length === 0) {
            setError("O carrinho está vazio! Adicione itens ao pedido.");
            return;
        }

        let pedidoId;

        try {
            console.log("Enviando dados do pedido principal: ", formData);

            const response = await axios.post(`${URL_API_GESTAO}/pedido/cadastrar`, formData);

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`Falha na criação do pedido principal. Status: ${response.status}`);
            }

            pedidoId = response.data.id;

        } catch (error) {
            console.error("Erro na Criação do Pedido Principal:", error);
            toast.error("Erro ao criar o pedido principal. Tente novamente!");
            return; 
        }

        if (pedidoId) {
            try {
                await confirmarItensPedido(pedidoId, currentCart);

                toast.success("Pedido efetuado com sucesso!");

                setIsModalOpen(false);
                navigate("/");
                dispatch(resetCliente());
                dispatch(clearCart());

            } catch (error) {
                console.error("Erro ao cadastrar um ou mais itens do pedido:", error);
                toast.error("Pedido principal criado, mas houve falha ao cadastrar os itens! Contate o suporte.");
            }
        }
    };


    useEffect(() => {
        if (!carrinho.length || lastPath !== "/carrinho") {
            navigate("/");
        }
    }, [carrinho, lastPath, navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div
                    className={styles.toBack}
                    onClick={() => navigate("/carrinho")}
                >
                    <ChevronLeft size={32} strokeWidth={2} />
                </div>
                <span>Dados da compra</span>
            </div>

            <div className={styles.body}>
                <label style={{ fontWeight: "bold", marginBottom: 8, display: "block" }}>
                    Dados pessoais*
                </label>

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="">Nome completo</label>
                        <input
                            type="text"
                            placeholder="Nome completo"
                            value={formData?.cliente}
                            onChange={(e) =>
                                setFormData({ ...formData, cliente: e.target.value })
                            }

                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="">CPF</label>
                        <input
                            type="text"
                            placeholder="CPF"
                            value={formData?.cpf}
                            onChange={(e) =>
                                setFormData({ ...formData, cpf: e.target.value })
                            }
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="">Telefone</label>
                        <input
                            type="text"
                            placeholder="Telefone"
                            value={formData?.telefone}
                            onChange={(e) =>
                                setFormData({ ...formData, telefone: e.target.value })
                            }
                        />
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <label style={{ fontWeight: "bold", marginBottom: 8, display: "block" }}>
                            Forma de pagamento*
                        </label>
                        {opcoesPagamento.map((opcao, idx) => (
                            <label key={idx} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="formaPagamento"
                                    value={opcao}
                                    checked={formData.formaPagamento === opcao}
                                    onChange={(e) =>
                                        setFormData({ ...formData, formaPagamento: opcao })
                                    }
                                />
                                <span>{opcao}</span>
                            </label>
                        ))}
                    </div>
                </form>

                {error && (
                    <div className={styles.errorMessage}>
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <ModalRevisarPedido
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => { confirmarPedido(carrinho) }}
                cliente={formData}
                carrinho={carrinho}
                formaPagamento={formData.formaPagamento}
            />

            <div className={styles.footer}>
                <button className={styles.checkoutButton} onClick={abrirModal}>
                    Revisar pedido
                </button>
            </div>
        </div>
    );
};
