"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "@/components/sidebar/sidebar";
import styles from "./personSelection.module.css";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

const PersonSelection = () => {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="d-flex">
        <div className={`flex-grow-1 ${styles.mainSection}`}>
          <div className={styles.overlay}></div>

          <div className={styles.cardContainer}>
            <h3 className="text-center mb-4">
              QUE TIPO DE DOCUMENTO VOCÊ QUER?
            </h3>

            <div className="d-flex justify-content-center gap-4">
              <div className="d-flex flex-column align-items-center">
                <button
                  className={`${styles.btn} ${styles.btnPf}`}
                  onClick={() => router.push("/formulario?tipo=fisica")}
                >
                  <i className="bi bi-person-fill"></i> PF
                </button>
                <p className="mt-2">Pessoa Física (CPF)</p>
              </div>

              <div className="d-flex flex-column align-items-center">
                <button
                  className={`${styles.btn} ${styles.btnPj}`}
                  onClick={() => router.push("/formulario?tipo=juridica")}
                >
                  <i className="bi bi-building"></i> PJ
                </button>
                <p className="mt-2">Pessoa Jurídica (CNPJ)</p>
              </div>
            </div>

            <div className="text-center mt-4">
              <a href="#" className={styles.backLink}>
                VOLTAR
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default PersonSelection;
