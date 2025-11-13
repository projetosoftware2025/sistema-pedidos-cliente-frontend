import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import { resetAuth, setUser } from "../../redux/reducers/authReducer";
import { UserInterface } from "../../app/models/interfaces/UserInterface";
import { RootState } from "../../redux/store";
import { tokenService } from "../../app/services/user/loginByTokenUser";
import { ShoppingBag, Menu, MarsStroke, X } from "lucide-react";
import logo from "../../assets/logo.png";
import { setSideBar } from "../../redux/reducers/appReducer";
import { CartItemInterface } from "../../redux/reducers/cartReducer";
import { DeviceType } from "../../app/models/types/DeviceType";

interface HeaderProps {
  device: DeviceType
}

export const HeaderComponent: React.FC<HeaderProps> = ({ device }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state: RootState) => state.app.isSidebarOpen);

  const user: UserInterface = useSelector(
    (state: RootState) => state.auth.user
  );

  const cartProdutos: CartItemInterface[] = useSelector(
    (state: RootState) => state.cart.cartProdutos
  );

  useEffect(() => {
    // const handleStorageChange = () => {
    //   const token = localStorage.getItem("token");
    //   if (token) {
    //     validateToken(token);
    //   }
    // };

    // const validateToken = async (token: string) => {
    //   try {
    //     const response = await tokenService(token);
    //     if (response.status === "error") {
    //       navigate("/login");
    //       return;
    //     }
    //     dispatch(setUser(response.data));
    //   } catch (error) {
    //     console.error("Erro ao validar token:", error);
    //     navigate("/login");
    //   }
    // };

    // window.addEventListener("storage", handleStorageChange);
    // handleStorageChange();

    // return () => {
    //   window.removeEventListener("storage", handleStorageChange);
    // };

    dispatch(setSideBar(false))
  }, [navigate, dispatch]);

  const handleUserOut = () => {
    dispatch(resetAuth());
    localStorage.setItem("token", "");
    navigate("/login");
  };

  return (
    <>
      <div className={styles.header}>
        <div
          className={styles.menuIcon}
          onClick={() => {
            dispatch(setSideBar(true));
          }}
        >
          {isSidebarOpen ? <X size={28} color="white" /> : <Menu size={28} color="white" />}
        </div>

        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo SuculentuS" className={styles.logo} />
        </div>

        {/* {device == "mobile" ? */}
          <div className={styles.cartContainer} onClick={() => {navigate("/carrinho")}}>
            <ShoppingBag size={28} color="white" />
            <div className={styles.cartNumber}>{cartProdutos.length}</div>
          </div>
        {/* : null} */}
      </div>

    </>
  );
};
