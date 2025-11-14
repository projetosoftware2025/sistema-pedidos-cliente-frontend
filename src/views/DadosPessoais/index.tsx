import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { ChevronLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { CartItemInterface, clearCart } from "../../redux/reducers/cartReducer";
import { ModalRevisarPedido } from "../../components/ModalRevisarPedido";
import { PagamentoType } from "../../app/models/types/PagamentoType";
import { toast } from "react-toastify";
import axios from "axios";
import { URL_API_GESTAO } from "../../utils/constants";
import { DadosInterface } from "../../app/models/interfaces/DadosInterface";
import { UserInterface } from "../../app/models/interfaces/UserInterface";
import { resetCliente } from "../../redux/reducers/authReducer";

// ----------------------
// Máscaras e validações
// ----------------------

const mascaraCPF = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14);

const mascaraTelefone = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .substring(0, 15);

const validarCPF = (cpf: string) => {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10]);
};

const validarTelefone = (tel: string) => {
  tel = tel.replace(/\D/g, "");
  return tel.length === 11; // Ex: (11) 99999-9999
};

// ----------------------
// Componente principal
// ----------------------

export const DadosPessoais = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const carrinho: CartItemInterface[] = useSelector(
    (state: RootState) => state.cart.cartProdutos
  );

  const lastPath: string = useSelector(
    (state: RootState) => state.app.lastPath
  );

  const user: UserInterface = useSelector(
    (state: RootState) => state.auth.user
  );

  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<DadosInterface>({
    cliente: "",
    cpf: "",
    telefone: "",
    formaPagamento: "Dinheiro",
  });

  const opcoesPagamento: PagamentoType[] = [
    "Dinheiro",
    "Cartão de Crédito",
    "Cartão de Débito",
    "Pix",
  ];

  // Preenche CPF do usuário, mas deixa alterar
  useEffect(() => {
    if (user?.cpf && formData.cpf === "") {
      setFormData((prev) => ({ ...prev, cpf: mascaraCPF(user.cpf) }));
    }

    if (user?.telefone && formData.telefone === "") {
      setFormData((prev) => ({ ...prev, telefone: mascaraTelefone(user.telefone) }));
    }

    if (user?.usuario && formData.cliente === "") {
      setFormData((prev) => ({ ...prev, cliente: user.usuario }));
    }
  }, [user]);

  // Impede entrar sem carrinho
  useEffect(() => {
    if (!carrinho.length || lastPath !== "/carrinho") {
      navigate("/");
    }
  }, [carrinho, lastPath, navigate]);

  const abrirModal = () => {
    const cpfSemMascara = formData.cpf.replace(/\D/g, "");
    const telSemMascara = formData.telefone.replace(/\D/g, "");

    if (!formData.cliente || !cpfSemMascara || !telSemMascara) {
      setError("Preencha todos os dados pessoais!");
      return;
    }

    if (!validarCPF(formData.cpf)) {
      setError("CPF inválido!");
      return;
    }

    if (!validarTelefone(formData.telefone)) {
      setError("Telefone inválido!");
      return;
    }

    setError("");
    setIsModalOpen(true);
  };

  const confirmarItensPedido = async (
    idPedido: number,
    cart: CartItemInterface[]
  ) => {
    if (cart.length === 0) return;

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
    const cpfSemMascara = formData.cpf.replace(/\D/g, "");
    const telSemMascara = formData.telefone.replace(/\D/g, "");

    const payload = {
      ...formData,
      cpf: cpfSemMascara,
      telefone: telSemMascara,
    };

    let pedidoId;

    try {
      const response = await axios.post(`${URL_API_GESTAO}/pedido/cadastrar`, payload);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Falha ao cadastrar pedido");
      }

      pedidoId = response.data.id;
    } catch (error) {
      toast.error("Erro ao criar o pedido principal!");
      return;
    }

    try {
      await confirmarItensPedido(pedidoId, cart);
      toast.success("Pedido efetuado com sucesso!");

      setIsModalOpen(false);
      navigate("/");
      dispatch(resetCliente());
      dispatch(clearCart());
    } catch (error) {
      toast.error("Pedido criado, mas erro ao cadastrar itens!");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.toBack} onClick={() => navigate("/carrinho")}>
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
            <label>Nome completo</label>
            <input
              type="text"
              placeholder="Nome completo"
              value={formData.cliente}
              onChange={(e) =>
                setFormData({ ...formData, cliente: e.target.value })
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <label>CPF</label>
            <input
              type="text"
              placeholder="CPF"
              value={formData.cpf}
              onChange={(e) =>
                setFormData({ ...formData, cpf: mascaraCPF(e.target.value) })
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Telefone</label>
            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telefone: mascaraTelefone(e.target.value),
                })
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
                  onChange={() =>
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
        onConfirm={() => confirmarPedido(carrinho)}
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
