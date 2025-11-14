import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { HeaderComponent } from "../../components/Header";
import { SidebarComponent } from "../../components/SidebarComponent";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { UserInterface } from "../../app/models/interfaces/UserInterface";
import { QuantidadeModal } from "../../components/QuantidadeModal/index";
import { addToCart } from "../../redux/reducers/cartReducer";
import { DeviceType } from "../../app/models/types/DeviceType";
import { formatarReal } from "../../utils/formatarReal";
import { setSideBar } from "../../redux/reducers/appReducer";
import axios from "axios";
import { URL_API_GESTAO } from "../../utils/constants";
import { ProdutoInterface } from "../../app/models/interfaces/ProdutoInterface";
import { ItemImageInterface } from "../../app/models/interfaces/ItemImageInterface";
import { FiltroInterface, Pedido } from "../MeusPedidos";

export const HomeView = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state: RootState) => state.app.isSidebarOpen);
  // Inicializamos com 'undefined' para controlar melhor a primeira seleção
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<ItemImageInterface | undefined>(undefined);

  const [produtosOriginais, setProdutosOriginais] = useState<ProdutoInterface[]>([]);
  const [produtosLista, setProdutosLista] = useState<ProdutoInterface[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoInterface | null>(null);
  const user: UserInterface = useSelector(
    (state: RootState) => state.auth.user
  );
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
  const [categorias, setCategorias] = useState<ItemImageInterface[]>([])

  const [device, setDevice] = useState<DeviceType>(undefined)

  // 1. Efeito para buscar dados e definir o tipo de dispositivo
  useEffect(() => {
    const buscarCategorias = async () => {
      try {
        const response = await axios.get(`${URL_API_GESTAO}/categoria/buscar-categorias`);
        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          setCategorias(data);
          // Removida a linha: setCategoriaSelecionada(data[0]); 
          // A seleção inicial será feita no próximo useEffect, após carregar os produtos.
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    }

    const buscarProdutos = async () => {
      try {
        const produtosRes = await axios.get(`https://sistema-pedidos-gestao-api.onrender.com/produto/buscar-produtos`);
        if (produtosRes.status === 200) {
          const produtos = Array.isArray(produtosRes.data) ? produtosRes.data : [];
          setProdutosOriginais(produtos);
          setProdutosLista(produtos); // Inicialmente, pode carregar todos ou uma lista vazia, mas setProdutosOriginais é o importante aqui.
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }

    if (window.innerWidth >= 768) {
      setDevice("desktop")
    } else {
      setDevice("mobile")
    }

    buscarCategorias()
    buscarProdutos();
  }, [user]); // Dependência em 'user' mantida

  useEffect(() => {
    if (categorias.length > 0 && produtosOriginais.length > 0 && !categoriaSelecionada) {
      const categoriaInicial = categorias[0];
      setCategoriaSelecionada(categoriaInicial);

      const produtosFiltrados = produtosOriginais.filter(p => p.categoriaId == categoriaInicial.id);
      setProdutosLista(produtosFiltrados);
    }
  }, [categorias, produtosOriginais, categoriaSelecionada]);

  const selecionarCategoria = (item: ItemImageInterface) => {
    setCategoriaSelecionada(item);

    // Sempre filtra usando a lista ORIGINAL (produtosOriginais)
    const produtosFiltrados = produtosOriginais.filter(
      (produto) => produto.categoriaId == item.id
    );

    setProdutosLista(produtosFiltrados);
  };


  const handleConfirmar = (quantidade: number) => {
    if (!produtoSelecionado) return;
    dispatch(
      addToCart({
        id: produtoSelecionado.id,
        titulo: produtoSelecionado.titulo,
        preco: produtoSelecionado.preco,
        descricao: produtoSelecionado.descricao,
        quantidade,
        url: produtoSelecionado.url,
      })
    );
    toast.success("Produto adicionado ao carrinho!");
    setProdutoSelecionado(null);
  };

  const buscarProduto = (descricao: string) => {
    const normalizar = (texto: string) =>
      texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const termo = normalizar(descricao);

    // Se apagou o texto → mostra produtos da categoria atual
    if (!termo.trim()) {
      // Garante que só filtra se uma categoria estiver selecionada
      if (!categoriaSelecionada) {
        setProdutosLista([]); // Ou setProdutosLista(produtosOriginais); se quiser mostrar todos.
        return;
      }

      const produtosFiltrados = produtosOriginais.filter(
        (produto) => produto.categoriaId === categoriaSelecionada.id
      );
      setProdutosLista(produtosFiltrados);
      return;
    }

    // Busca apenas nos produtos da categoria selecionada
    const resultado = produtosOriginais.filter((item) => {
      const tituloNormalizado = normalizar(item.titulo);
      const descricaoNormalizada = normalizar(item.descricao || "");

      return (
        // Garante que o produto pertence à categoria selecionada
        item.categoriaId === categoriaSelecionada?.id &&
        (tituloNormalizado.includes(termo) ||
          descricaoNormalizada.includes(termo))
      );
    });

    setProdutosLista(resultado);
  };

  useEffect(() => {
    const buscarPedidos = async () => {
      if(!user.cpf) return
      try {
        const response = await axios.get(
          `https://sistema-pedidos-gestao-api.onrender.com/pedido/buscar-pedidos?dtInicio=${filtro.dataInicial}&dtFim=${filtro.dataFinal}&cpf=${user.cpf}`
        );

        if (response.data && response.status === 200) {
          const pedidos = response.data;

          const pendentes = pedidos.filter((p: Pedido) => p.status === "A");
          const prontos = pedidos.filter((p: Pedido) => p.status === "R");

          if (prontos.length > 0) {
            toast.success("Seu pedido já está pronto!");
          } else if (pendentes.length > 0) {
            toast.info("Há pedidos pendentes de pagamento!");
          }
        }
      } catch (error) {
        // erro silencioso
      }
    };

    // executa imediatamente
    buscarPedidos();

    // executa a cada 10 segundos
    const intervalId = setInterval(() => {
      buscarPedidos();
    }, 10000);

    return () => clearInterval(intervalId);

  }, [filtro.dataInicial, filtro.dataFinal, user.cpf]);



  return (
    <div className={styles.container}>

      <HeaderComponent device={device} />
      <div className={styles.containerBox}>
        <SidebarComponent
          isOpen={isSidebarOpen}
          onClose={() => dispatch(setSideBar(false))}
          device={device}
        />


        <>
          <div className={styles.inputGroup}>
            <input
              type="text"
              onFocus={() => { }}
              onChange={(e) => buscarProduto(e.target.value)}

              placeholder="Buscar produto"
              className={styles.input}
            />
          </div>

          {categorias && categorias.length ?
            <div className={styles.containerItens}>
              {categorias.length > 0 && categorias?.map((item) => (
                <div
                  key={item.id}
                  className={styles.containerItem}
                  style={{
                    backgroundImage: `url(${URL_API_GESTAO}/categoria/imagem/${item.id})`,
                    // Adiciona um estilo para destacar a categoria selecionada (opcional)
                    border: categoriaSelecionada?.id === item.id ? '2px solid #007bff' : 'none',
                  }}
                  onClick={() => selecionarCategoria(item)}
                >
                  <span className={styles.itemText}>{item?.descricao}</span>
                </div>
              ))}
            </div>

            : ""
          }


          <div>
            <div style={{
              marginTop: "20px",
              marginBottom: "8px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              paddingLeft: "16px"
            }}>{categoriaSelecionada?.descricao}</div>


            {produtosLista && produtosLista.length ?
              <div className={styles.produtosWrapper}>
                <div className={styles.produtosContainer}>
                  {produtosLista.length > 0 && produtosLista?.map((item) => (
                    <div
                      key={item.id}
                      className={styles.produtoCard}
                      onClick={() => setProdutoSelecionado(item)}
                    >
                      <img
                        src={`${URL_API_GESTAO}/produto/imagem/${item.id}`}
                        alt={item.titulo}
                        className={styles.produtoImagem}
                      />

                      <div className={styles.produtoInfo}>
                        <h3 className={styles.produtoTitulo}>{item.titulo}</h3>
                        <p className={styles.produtoDescricao}>{item.descricao}</p>
                        <p className={styles.produtoPreco}>{formatarReal(item.preco)}</p>
                      </div>
                    </div>
                  ))}

                  {produtoSelecionado && (
                    <QuantidadeModal
                      produto={produtoSelecionado}
                      onConfirm={handleConfirmar}
                      onClose={() => setProdutoSelecionado(null)}
                    />
                  )}
                </div>
              </div>

              : ""
            }

          </div>
        </>


      </div>
    </div>

  )
}