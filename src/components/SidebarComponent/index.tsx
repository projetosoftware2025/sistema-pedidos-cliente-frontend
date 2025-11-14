import React from "react";
import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";
import { DeviceType } from "../../app/models/types/DeviceType";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceType;
}

export const SidebarComponent: React.FC<SidebarProps> = ({ isOpen, onClose, device }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Fundo escuro */}
      {isOpen && (
        <div
          className={`${styles.overlay} ${isOpen ? styles.show : ""}`}
          onClick={
            onClose
          }// fecha ao clicar fora
        />
      )}

      {/* Sidebar lateral */}
      <div
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
        onClick={(e) => e.stopPropagation()} // impede fechar ao clicar dentro
      >
        <ul>
          
            <>
              <li
                onClick={() => {
                  navigate("/");
                  onClose();
                }}
              >
                Início
              </li>
              <li
                onClick={() => {
                  navigate("/meus-pedidos");
                  onClose();
                }}
              >
                Meus pedidos
              </li>
             
            </>
         
        </ul>
      </div>
    </>
  );
};
