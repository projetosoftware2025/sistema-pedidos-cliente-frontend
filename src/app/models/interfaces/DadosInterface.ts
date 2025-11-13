import { PagamentoType } from "../types/PagamentoType";

export interface DadosInterface {
    cliente: string;
    cpf: string;
    telefone: string;
    formaPagamento: PagamentoType;
}