import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import styles from "./index.module.css";
import { Plus, Edit2, X } from "lucide-react";
import { URL_API_GESTAO } from "../../utils/constants";
import { ProdutoCadastroInterface } from "../../app/models/interfaces/ProdutoCadastroInterface";
import { ItemImageInterface } from "../../app/models/interfaces/ItemImageInterface";
import { SidebarComponent } from "../../components/SidebarComponent";
import { HeaderComponent } from "../../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setSideBar } from "../../redux/reducers/appReducer";

interface ProdutoLocal {
  id: number;
  titulo: string;
  descricao: string;
  preco: string;
  categoria: string;
  imagem: File | null;
}

export const GestaoCadastros: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<"produtos" | "categorias">("produtos");
  const [produtos, setProdutos] = useState<ProdutoLocal[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<ProdutoLocal | null>(null);
  const [produto, setProduto] = useState<ProdutoCadastroInterface>({
    titulo: "",
    descricao: "",
    preco: "",
    categoria: "",
    imagem: null,
  });
  const dispatch = useDispatch();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<ItemImageInterface[]>([]);
  const [confirmar, setConfirmar] = useState<"confirmar" | "recusar" | null>(null);
  const isSidebarOpen = useSelector((state: RootState) => state.app.isSidebarOpen);

  useEffect(() => {
    const buscarCategorias = async () => {
      try {
        const response = await axios.get(`${URL_API_GESTAO}/categoria/buscar-categorias`);
        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          setCategorias(data);
          if (data.length > 0) {
            setProduto(prev => ({ ...prev, categoria: String(data[0].id) }));
          }
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    buscarCategorias();
  }, []);

  const abrirModal = (p?: ProdutoLocal) => {
    if (p) {
      setEditando(p);
      setProduto({
        titulo: p.titulo,
        descricao: p.descricao,
        preco: p.preco,
        categoria: p.categoria,
        imagem: p.imagem,
      });
      if (p.imagem) {
        setPreview(URL.createObjectURL(p.imagem));
      } else {
        setPreview(null);
      }
    } else {
      setEditando(null);
      setProduto({
        titulo: "",
        descricao: "",
        preco: "",
        categoria: categorias[0]?.id ? String(categorias[0].id) : "",
        imagem: null,
      });
      setPreview(null);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduto(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProduto(prev => ({ ...prev, imagem: file }));
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { titulo, descricao, preco, categoria, imagem } = produto;
    if (!titulo || !descricao || !preco || !categoria) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("preco", preco);
    formData.append("categoria", categoria);
    if (imagem) formData.append("imagem", imagem);

    setLoading(true);
    try {
      const response = await axios.post(`${URL_API_GESTAO}/produto/cadastrar`, formData);
      alert(response.data);

      const novoProduto: ProdutoLocal = {
        id: editando ? editando.id : produtos.length + 1,
        titulo,
        descricao,
        preco,
        categoria,
        imagem: imagem || null,
      };

      if (editando) {
        setProdutos(prev => prev.map(p => (p.id === editando.id ? novoProduto : p)));
      } else {
        setProdutos(prev => [...prev, novoProduto]);
      }

      fecharModal();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto. Tente novamente.");
    } finally {
      setLoading(false);
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



      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${abaAtiva === "produtos" ? styles.active : ""}`}
          onClick={() => setAbaAtiva("produtos")}
        >
          Produtos
        </button>
        <button
          className={`${styles.tabButton} ${abaAtiva === "categorias" ? styles.active : ""}`}
        // onClick={() => setAbaAtiva("categorias")}
        >
          Categorias
        </button>
      </div>

      {abaAtiva === "produtos" && (
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <button className={styles.addBtn} onClick={() => abrirModal()}>
              <Plus size={18} /> Novo Produto
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Preço</th>
                  <th>Categoria</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id}>
                    <td>{p.titulo}</td>
                    <td>{p.descricao}</td>
                    <td>R$ {Number(p.preco).toFixed(2).replace(".", ",")}</td>
                    <td>
                      {categorias.find(c => String(c.id) === p.categoria)?.descricao || "-"}
                    </td>
                    <td>
                      <button className={styles.editBtn} onClick={() => abrirModal(p)}>
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {abaAtiva === "categorias" && (
        <div className={styles.content}>
          <p>Gestão de categorias virá aqui...</p>
        </div>
      )}

      {modalAberto && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editando ? "Editar Produto" : "Novo Produto"}</h2>
              <button className={styles.closeBtn} onClick={fecharModal}>
                <X size={22} />
              </button>
            </div>

            <form className={styles.modalBody} onSubmit={handleSubmit}>
              <label>Título:</label>
              <input type="text" name="titulo" value={produto.titulo} onChange={handleChange} required />

              <label>Descrição:</label>
              <textarea name="descricao" value={produto.descricao} onChange={handleChange} rows={3} required />

              <label>Preço:</label>
              <input type="number" name="preco" value={produto.preco} onChange={handleChange} step="0.01" required />

              <label>Categoria:</label>
              <select name="categoria" value={produto.categoria} onChange={handleChange} required>
                <option value="" disabled>Selecione uma Categoria</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.descricao}</option>
                ))}
              </select>

              <label>Imagem:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview && <img src={preview} alt="Pré-visualização" className={styles.previewImg} />}

              <div className={styles.modalFooter}>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? "Salvando..." : editando ? "Salvar Alterações" : "Cadastrar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
