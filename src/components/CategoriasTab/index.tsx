import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import styles from "./GestaoProdutos.module.css"; // usa o mesmo CSS do modal/produtos
import { Plus, Edit2, X } from "lucide-react";
import { URL_API_GESTAO } from "../../utils/constants";

interface Categoria {
  id: number;
  descricao: string;
  imagem: File | null;
}

export const CategoriasTab: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const buscarCategorias = async () => {
      try {
        const response = await axios.get(`${URL_API_GESTAO}/categoria/buscar-categorias`);
        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          // transformando em Categoria
          setCategorias(data.map((c: any, i: number) => ({
            id: c.id || i + 1,
            descricao: c.descricao,
            imagem: null,
          })));
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    buscarCategorias();
  }, []);

  const abrirModal = (c?: Categoria) => {
    if (c) {
      setEditando(c);
      setDescricao(c.descricao);
      setImagem(c.imagem);
      if (c.imagem) setPreview(URL.createObjectURL(c.imagem));
      else setPreview(null);
    } else {
      setEditando(null);
      setDescricao("");
      setImagem(null);
      setPreview(null);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImagem(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!descricao) {
      alert("Descrição é obrigatória!");
      return;
    }

    const formData = new FormData();
    formData.append("descricao", descricao);
    if (imagem) formData.append("imagem", imagem);

    setLoading(true);
    try {
      const url = editando
        ? `${URL_API_GESTAO}/categoria/editar/${editando.id}`
        : `${URL_API_GESTAO}/categoria/cadastrar`;
      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(response.data);

      const novaCategoria: Categoria = {
        id: editando ? editando.id : categorias.length + 1,
        descricao,
        imagem: imagem || null,
      };

      if (editando) {
        setCategorias(prev => prev.map(c => (c.id === editando.id ? novaCategoria : c)));
      } else {
        setCategorias(prev => [...prev, novaCategoria]);
      }

      fecharModal();
    } catch (error) {
      console.error("Erro ao cadastrar/editar categoria:", error);
      alert("Erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.toolbar}>
        <button className={styles.addBtn} onClick={() => abrirModal()}>
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(c => (
              <tr key={c.id}>
                <td>{c.descricao}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => abrirModal(c)}>
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editando ? "Editar Categoria" : "Nova Categoria"}</h2>
              <button className={styles.closeBtn} onClick={fecharModal}>
                <X size={22} />
              </button>
            </div>

            <form className={styles.modalBody} onSubmit={handleSubmit}>
              <label>Descrição:</label>
              <input
                type="text"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                required
              />

              <label>Imagem:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview && <img src={preview} alt="Preview" className={styles.previewImg} />}

              <div className={styles.modalFooter}>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? "Salvando..." : editando ? "Salvar Alterações" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
