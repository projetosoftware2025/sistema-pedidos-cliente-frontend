import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { HeaderComponent } from "../../components/Header";
import { SidebarComponent } from "../../components/SidebarComponent";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast, ToastContainer } from "react-toastify";
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
import { BarChart3, ClipboardList, Package, Users } from "lucide-react";

export const HomeView = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state: RootState) => state.app.isSidebarOpen);
  const [categotiaSelecionada, setCategoriaSelecionada] = useState<ItemImageInterface>();
  // const [produtosLista, setProdutosLista] = useState<ProdutoInterface[]>([]);
  const [produtosOriginais, setProdutosOriginais] = useState<ProdutoInterface[]>([]);
  const [produtosLista, setProdutosLista] = useState<ProdutoInterface[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoInterface | null>(null);
  const user: UserInterface = useSelector(
    (state: RootState) => state.auth.user
  );
  const [categorias, setCategorias] = useState<ItemImageInterface[]>([])

  const [device, setDevice] = useState<DeviceType>(undefined)

  useEffect(() => {

    const buscarCategorias = async () => {
      try {
        const response = await axios.get(`${URL_API_GESTAO}/categoria/buscar-categorias`);
        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          setCategorias(data);
          setCategoriaSelecionada(data[0]);
        }
      } catch (error) {

      }
    }

    const buscarProdutos = async () => {
      try {
        const produtosRes = await axios.get(`${URL_API_GESTAO}/produto/buscar-produtos`);
        if (produtosRes.status === 200) {
          const produtos = Array.isArray(produtosRes.data) ? produtosRes.data : [];
          setProdutosLista(produtos);
          setProdutosOriginais(produtos)
        }
      } catch (error) {

      }
    }

    if (window.innerWidth >= 768) {
      setDevice("desktop")

    } else {
      setDevice("mobile")
    }
    buscarCategorias()
    buscarProdutos();
  }, [user]);

  const selecionarCategoria = (item: ItemImageInterface) => {
    setCategoriaSelecionada(item);
    const produtosFiltrados = produtosLista?.filter((produto) => {
      return produto.categoriaId == item.id
    })
    console.log("produtos: ", produtosFiltrados)
    setProdutosLista(produtosFiltrados);
  }

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

    // 🧠 se o campo está vazio, mostra todos os produtos da categoria
    if (!termo.trim()) {
      setProdutosLista(
        produtosOriginais.filter(
          (produto) => produto.categoriaId === categotiaSelecionada?.id
        )
      );
      return;
    }

    const resultado = produtosOriginais.filter((item) => {
      const tituloNormalizado = normalizar(item.titulo);
      const descricaoNormalizada = normalizar(item.descricao || "");
      return (
        (item.categoriaId === categotiaSelecionada?.id) &&
        (tituloNormalizado.includes(termo) ||
          descricaoNormalizada.includes(termo))
      );
    });

    setProdutosLista(resultado);
  };


  return (
    <div className={styles.container}>

      <HeaderComponent device={device} />
      <div className={styles.containerBox}>
        <SidebarComponent
          isOpen={isSidebarOpen}
          onClose={() => dispatch(setSideBar(false))}
          device={device}
        />

        {/* {device == "mobile" ?
          <> */}
        {/* <div className={styles.inputGroup}>
          <input
            type="text"
            onFocus={() => { }}
            onChange={(e) => {
              if (e.target.value != "") {
                buscarProduto(e.target.value)
              }

            }}
            placeholder="Buscar produto"
            className={styles.input}
          />
        </div> */}

        {/* {categorias && categorias.length ?
              <div className={styles.containerItens}>
                {categorias.length > 0 && categorias?.map((item) => (
                  <div
                    key={item.id}
                    className={styles.containerItem}
                    style={{ backgroundImage: `url(${URL_API_GESTAO}/categoria/imagem/${item.id})` }}
                    onClick={() => selecionarCategoria(item)}
                  >
                    <span className={styles.itemText}>{item?.descricao}</span>
                  </div>
                ))}
              </div>

              : ""
            } */}


        <div>
          {/* <div style={{
                marginTop: "20px",
                marginBottom: "8px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                paddingLeft: "16px"
              }}>{categotiaSelecionada?.descricao}</div> */}


          {/* {produtosLista && produtosLista.length ?
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
          } */}

          <main className={styles.container}>


            <div className={styles.modulesGrid}>
              <div
                className={styles.moduleCard}
                onClick={() => navigate("/gestao-pedidos")}
              >
                <ClipboardList className={styles.icon} />
                <span>Gestão de Pedidos</span>
              </div>

              {/* <div
                className={styles.moduleCard}
                onClick={() => navigate("/gerenciamento-cadastro")}
              >
                <Users className={styles.icon} />
                <span>Gestão de Cadastro</span>
              </div> */}

              <div
                className={styles.moduleCard}
                onClick={() => navigate("/gestao-cadastros")}
              >
                <Package className={styles.icon} />
                <span>Produtos & Categorias</span>
              </div>

              {/* <div
                className={styles.moduleCard}
                onClick={() => navigate("/relatorios")}
              >
                <BarChart3 className={styles.icon} />
                <span>Relatórios</span>
              </div> */}
            </div>
          </main>

        </div>
        {/* </>

          : "Tela de desktop"} */}
      </div>
    </div>
  );
};
