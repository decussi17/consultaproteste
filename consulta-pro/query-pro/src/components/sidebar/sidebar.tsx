/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuth } from "@/app/context/AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./sidebar.module.css";

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Nome de exibição (prefere name se existir, caso contrário usa username)
  const displayName = user?.name || user?.username || "";

  // Função para capitalizar a primeira letra (para o role)
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className={styles.sidebar}>
      <div className="d-flex align-items-center p-3 mb-3">
        <img
          src="/maleprofile.webp"
          alt="Foto de perfil"
          className={styles.profilePic}
        />
        <div className="ms-2">
          <h6 className="m-0">{displayName}</h6>
          <small className="text-muted">
            {user?.role ? capitalize(user.role) : "Carregando..."}
          </small>
        </div>
      </div>
      <hr className="mx-3" />

      <ul className={`nav flex-column ${styles.menuItemsContainer}`}>
        <li className="nav-item">
          <a href="#" className={`nav-link ${styles.menuItem}`}>
            <i className="bi bi-person-circle me-2"></i> Minha conta
          </a>
        </li>
        <li className="nav-item">
          <a
            href={user ? `/consulta?user_id=${user.id}` : "#"}
            className={`nav-link ${styles.menuItem}`}
          >
            <i className="bi bi-search me-2"></i> Minhas pesquisas
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className={`nav-link ${styles.menuItem}`}>
            <i className="bi bi-gear me-2"></i> Configurações
          </a>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${styles.menuItem}`} onClick={logout}>
            <i className="bi bi-box-arrow-left me-2"></i> Sair
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
