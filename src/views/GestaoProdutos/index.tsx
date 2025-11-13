import axios from "axios";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { URL_API_GESTAO } from "../../utils/constants";
import { ItemImageInterface } from "../../app/models/interfaces/ItemImageInterface";
import { ProdutoCadastroInterface } from "../../app/models/interfaces/ProdutoCadastroInterface";


export const GestaoProdutos: React.FC = () => {
    const [produto, setProduto] = useState<ProdutoCadastroInterface>({
        titulo: "",
        descricao: "",
        preco: "",
        categoria: "",
        imagem: null,
    });

    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    // Estado para armazenar as categorias vindas da API
    const [categorias, setCategorias] = useState<ItemImageInterface[]>([])

    // 1. Hook para buscar as categorias (Rodará apenas na montagem)
    useEffect(() => {
        const buscarCategorias = async () => {
            try {
                const response = await axios.get(`${URL_API_GESTAO}/categoria/buscar-categorias`);
                if (response.status === 200) {
                    const data = Array.isArray(response.data) ? response.data : [];
                    setCategorias(data);
                    
                    // Se houver categorias, pré-seleciona a primeira (ou deixa o placeholder)
                    if (data.length > 0) {
                        setProduto(prev => ({ ...prev, categoria: String(data[0].id) }));
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar categorias:", error);
            }
        }

        buscarCategorias();
    }, []) // Array de dependências vazio: só executa uma vez


    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> // Inclui HTMLSelectElement
    ) => {
        const { name, value } = e.target;
        setProduto((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setProduto((prev) => ({ ...prev, imagem: file }));
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
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
        // Enviando o ID da categoria, que é o valor selecionado no <select>
        formData.append("categoria", categoria); 
        if (imagem) formData.append("imagem", imagem);

        setLoading(true);

        try {
            const response = await axios.post(
                `${URL_API_GESTAO}/produto/cadastrar`,
                formData
            );

            alert(response.data);
            // reset...
        } catch (error) {
            console.error("Erro ao cadastrar produto:", error);
            alert("Erro ao cadastrar produto. Tente novamente.");
        } finally {
            setLoading(false);
        }

    };


    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxWidth: "500px",
                margin: "40px auto",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                background: "#f9f9f9",
            }}
        >
            <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
                Cadastro de Produto
            </h2>

            <label>
                Título:
                <input
                    type="text"
                    name="titulo"
                    value={produto.titulo}
                    onChange={handleChange}
                    placeholder="Ex: Tinta Coral 18L"
                    required
                />
            </label>

            <label>
                Descrição:
                <textarea
                    name="descricao"
                    value={produto.descricao}
                    onChange={handleChange}
                    placeholder="Informe os detalhes do produto..."
                    rows={3}
                    required
                />
            </label>

            <label>
                Preço:
                <input
                    type="number"
                    name="preco"
                    step="0.01"
                    value={produto.preco}
                    onChange={handleChange}
                    placeholder="Ex: 199.90"
                    required
                />
            </label>

            {/* AQUI ESTÁ O SELECT CORRIGIDO */}
            <label>
                Categoria:
                <select
                    name="categoria"
                    value={produto.categoria}
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled>
                        Selecione uma Categoria
                    </option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.descricao}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Imagem:
                <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>

            {preview && (
                <img
                    src={preview}
                    alt="Pré-visualização"
                    style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        alignSelf: "center",
                        marginTop: "10px",
                    }}
                />
            )}

            <button
                type="submit"
                disabled={loading}
                style={{
                    backgroundColor: loading ? "#888" : "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                }}
            >
                {loading ? "Cadastrando..." : "Cadastrar Produto"}
            </button>
        </form>
    );
};