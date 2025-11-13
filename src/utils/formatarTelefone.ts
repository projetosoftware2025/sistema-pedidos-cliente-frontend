export const formatarTelefone = (telefone: string) => {
    if (!telefone) return "Não informado";
    
    const cleaned = telefone.replace(/\D/g, ""); 
    
    if (cleaned.length === 11) {
        return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (cleaned.length === 10) {
        return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    } else {
        return telefone;
    }
};