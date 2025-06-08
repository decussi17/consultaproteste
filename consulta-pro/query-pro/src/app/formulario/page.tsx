"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputMask from "react-input-mask";
import styles from "./formulario.module.css";
import Sidebar from "@/components/sidebar/sidebar";
import { useAuth } from "../context/AuthContext"; // Ajuste o caminho conforme necessário

const Formulario = () => {
  const router = useRouter();
  const [tipoPessoa, setTipoPessoa] = useState<"juridica" | "fisica">("fisica");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    console.log("Form data:", Object.fromEntries(data));

    try {
      setIsLoading(true);
      const result = await fetch("/api/store", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data)),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setIsLoading(false);

      if (result.ok) {
        e.currentTarget?.reset();
        router.push("/consulta");
      } else {
        alert("Erro ao enviar formulário");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>

      <div className={styles.contentArea}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <div className={styles.personType}>
              <i className="fas fa-user"></i>{" "}
              {tipoPessoa === "fisica" ? "PF" : "PJ"}
            </div>
            <div className={styles.headerTitle}>
              {tipoPessoa === "fisica"
                ? "Pessoa Física (CPF)"
                : "Pessoa Jurídica (CNPJ)"}
              <div className={styles.headerControls}>
                <div className={styles.personTypeToggle}>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${
                      tipoPessoa === "fisica" ? styles.active : ""
                    }`}
                    onClick={() => setTipoPessoa("fisica")}
                  >
                    Pessoa Física
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${
                      tipoPessoa === "juridica" ? styles.active : ""
                    }`}
                    onClick={() => setTipoPessoa("juridica")}
                  >
                    Pessoa Jurídica
                  </button>
                </div>
                <button className={styles.backButton}>VOLTAR</button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className={styles.formContent}>
              {/* Hidden field for form submission */}
              <select
                name="tipo_pessoa"
                value={tipoPessoa}
                onChange={(e) => setTipoPessoa(e.target.value as any)}
                className={styles.hiddenField}
              >
                <option value="fisica">Física</option>
                <option value="juridica">Jurídica</option>
              </select>

              {tipoPessoa === "fisica" ? (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="nome">Nome</label>
                      <input
                        type="text"
                        name="nome"
                        className={styles.formControl}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="nascimento">Data de nascimento</label>
                      <input
                        type="date"
                        name="nascimento"
                        className={styles.formControl}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="uf_nascimento">UF de nascimento</label>
                      <select
                        name="uf_nascimento"
                        className={styles.formControl}
                      >
                        <option value="">Selecione</option>
                        {"AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO"
                          .split(", ")
                          .map((uf) => (
                            <option key={uf} value={uf}>
                              {uf}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="cpf">CPF</label>
                      <InputMask
                        mask="999.999.999-99"
                        name="cpf"
                        className={styles.formControl}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="nome_mae">Nome da mãe</label>
                      <input
                        type="text"
                        name="nome_mae"
                        className={styles.formControl}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="rg_document">RG</label>
                      <input
                        type="text"
                        name="rg_document"
                        className={styles.formControl}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="gender">Sexo</label>
                      <select name="gender" className={styles.formControl}>
                        <option value="">Selecione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">
                        E-mail (para receber resultado)
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={styles.formControl}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="cnpj">CNPJ</label>
                      <InputMask
                        mask="99.999.999/9999-99"
                        name="cnpj"
                        className={styles.formControl}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="nome">Razão Social</label>
                      <input
                        type="text"
                        name="nome"
                        className={styles.formControl}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="nome_responsavel">
                        Nome Completo do Responsável
                      </label>
                      <input
                        type="text"
                        name="nome_responsavel"
                        className={styles.formControl}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">
                        E-mail (para receber resultado)
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={styles.formControl}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.formFooter}>
                <button type="submit" className={styles.submitButton}>
                  ENVIAR
                </button>
                {isLoading && (
                  <div className={styles.spinner} role="status"></div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Formulario;
