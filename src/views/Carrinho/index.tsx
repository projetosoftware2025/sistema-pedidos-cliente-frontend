import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { ChevronLeft, ShoppingCart, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, CartItemInterface, removeFromCart, removeOneFromCart } from "../../redux/reducers/cartReducer";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import { formatarReal } from "../../utils/formatarReal";
import { QuantidadeModal } from "../../components/QuantidadeModal";
import { setLastPath } from "../../redux/reducers/appReducer";
import { URL_API_GESTAO } from "../../utils/constants";

export const Carrinho = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItens: CartItemInterface[] = useSelector(
        (state: RootState) => state.cart.cartProdutos
    );

    const isCartEmpty = cartItens.length === 0;

    const totalValue = cartItens.reduce((total, item) => total + item.preco * item.quantidade, 0);
    const totalFormatted = totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.toBack} onClick={() => navigate("/")}>
                    <ChevronLeft size={32} strokeWidth={2} />
                </div>
                <span>Carrinho</span>
            </div>

            <div className={styles.mainContent}>
                {isCartEmpty ? (
                    <div className={styles.emptyCartMessage}>
                        <ShoppingCart size={48} strokeWidth={1.5} color="#ccc" />
                        <h2>Seu carrinho está vazio!</h2>
                        <p>Adicione produtos para finalizar sua compra.</p>
                        <button
                            className={styles.backToHomeButton}
                            onClick={() => navigate("/")}
                        >
                            Ver produtos
                        </button>
                    </div>
                ) : (
                    <div className={styles.listaProdutos}>
                        {cartItens.map((produto) => (
                            <div key={produto.id} className={styles.produto}>
                                <div
                                    className={styles.produtoImage}
                                    style={{ backgroundImage: `url(${URL_API_GESTAO}/produto/imagem/${produto.id})` }}
                                />
                                <div className={styles.produtoInfo}>
                                    <div>{produto.titulo}</div>
                                    <div>{produto.descricao}</div>
                                    <div>{formatarReal(produto.preco)}</div>
                                </div>
                                <div className={styles.controles}>
                                    <button onClick={() => {
                                        dispatch(removeOneFromCart(produto.id))
                                        if (produto.quantidade == 1) {
                                            toast.info("Produto removido do carrinho!");
                                        }
                                    }}>-</button>
                                    <span>{produto.quantidade}</span>
                                    <button onClick={() => dispatch(addToCart({ ...produto, quantidade: 1 }))}>+</button>
                                    <span
                                        className={styles.remover}
                                        onClick={() => {
                                            dispatch(removeFromCart(produto.id))
                                            toast.info("Produto removido do carrinho!");
                                        }}
                                    >
                                        <Trash size={22} strokeWidth={2} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isCartEmpty && (
                <div className={styles.footer}>
                    <div className={styles.footerContent}>
                        <div className={styles.totalContainer}>
                            <span className={styles.totalLabel}>Itens:</span>
                            <span className={styles.totalValue}>{cartItens.length}</span>
                        </div>
                        <div className={styles.totalContainer}>
                            <span className={styles.totalLabel}>Total:</span>
                            <span className={styles.totalValue}>{totalFormatted}</span>
                        </div>

                        <button className={styles.checkoutButton} onClick={()=>{
                            navigate("/dados-pessoais");
                            dispatch(setLastPath("/carrinho"))
                        }}>
                            Informe seus dados
                        </button>
                    </div>
                </div>

            )}
        </div>

    );
};
