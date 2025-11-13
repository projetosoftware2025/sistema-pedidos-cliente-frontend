import axios from "axios";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { URL_API_GESTAO } from "../../utils/constants";
import styles from "../../views/GestaoCadastros/index.module.css";

interface Categoria {
  id: number;
  descricao: string;
}

interface Produto {
  id?: number;
  titulo: string;
  descricao: string;
  preco: string;
  categoria: string;
  imagem?: File | null;
}

export const ProdutosTab: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produto, setProduto] = useState<Produto>({
    titulo: "",
    descricao: "",
    preco: "",
    categoria: "",
    imagem: null,
  });
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [editando, setEditando] = useState<Produto | null>(null);

  const buscarCategorias = async () => {
    const res = await axios.get(`${URL_API_GESTAO}/categoria/buscar-categorias`);
    setCategorias(res.data);
  };

  const buscarProdutos = async () => {
    const res = await axios.get(`${URL_API_GESTAO}/produto/listar`);
    setProdutos(res.data);
  };

  useEffect(() => {
    buscarCategorias();
    buscarProdutos();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduto((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProduto((prev) => ({ ...prev, imagem: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("titulo", produto.titulo);
    formData.append("descricao", produto.descricao);
    formData.append("preco", produto.preco);
    formData.append("categoria", produto.categoria);
    if (produto.imagem) formData.append("imagem", produto.imagem);

    if (editando) {
      await axios.put(`${URL_API_GESTAO}/produto/editar/${editando.id}`, formData);
      setEditando(null);
    } else {
      await axios.post(`${URL_API_GESTAO}/produto/cadastrar`, formData);
    }

    setProduto({ titulo: "", descricao: "", preco: "", categoria: "", imagem: null });
    buscarProdutos();
  };

  return (
    <div>
      <div className={styles.filtros}>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Todas as Categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.descricao}</option>
          ))}
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="ATIVO">Ativos</option>
          <option value="INATIVO">Inativos</option>
        </select>
        <button className={styles.btnBuscar}>Buscar</button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="titulo"
          value={produto.titulo}
          onChange={handleChange}
          placeholder="Título do produto"
          required
        />
        <textarea
          name="descricao"
          value={produto.descricao}
          onChange={handleChange}
          placeholder="Descrição"
          rows={3}
          required
        />
        <input
          type="number"
          name="preco"
          value={produto.preco}
          onChange={handleChange}
          placeholder="Preço"
          step="0.01"
          required
        />
        <select
          name="categoria"
          value={produto.categoria}
          onChange={handleChange}
          required
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.descricao}</option>
          ))}
        </select>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">
          {editando ? "Salvar Alterações" : "Cadastrar Produto"}
        </button>
      </form>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.titulo}</td>
              <td>{p.categoria}</td>
              <td>R$ {p.preco}</td>
              <td>
                <button
                  className={styles.btnEditar}
                  onClick={() => {
                    setEditando(p);
                    setProduto({
                      titulo: p.titulo,
                      descricao: p.descricao,
                      preco: p.preco,
                      categoria: p.categoria,
                      imagem: null,
                    });
                  }}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
