export const formatarReal = (valor: any) => {
  if (valor === null || valor === undefined || isNaN(valor)) return "R$ 0,00";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
