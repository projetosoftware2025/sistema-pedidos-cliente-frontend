import { createBrowserRouter } from "react-router-dom";
import { HomeView } from "../views/Home";
import { MeusPedidos } from "../views/MeusPedidos";
import { Carrinho } from "../views/Carrinho";
import { DadosPessoais } from "../views/DadosPessoais";
import { RedirectPage } from "../views/RedirectPage";

export const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <HomeView />,
  },
  
  {
    path: "/meus-pedidos",
    element: <MeusPedidos />,
  },
  {
    path: "/carrinho",
    element: <Carrinho />,
  },
  {
    path: "/dados-pessoais",
    element: <DadosPessoais />,
  },
  {
    path: "*",
    element: <RedirectPage />,
  },
]);
