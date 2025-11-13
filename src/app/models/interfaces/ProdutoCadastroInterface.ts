export interface ProdutoCadastroInterface {
    titulo: string;
    descricao: string;
    preco: string;
    categoria: string;
    imagem: File | null;
}