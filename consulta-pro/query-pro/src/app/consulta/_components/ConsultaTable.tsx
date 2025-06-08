"use client";
import React from "react";
import Link from "next/link";
import styles from "./consulta.module.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar/sidebar";

interface ConsultaTableProps {
  consultas: any[];
}

const ConsultaTable = ({ consultas }: ConsultaTableProps) => {
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.tableWrapper}>
            <div className={styles.cardHeader}>
              <h2>HISTÓRICO DE CONSULTAS</h2>
              <Link href="/formulario" className={styles.voltarLink}>
                VOLTAR
              </Link>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data da Consulta</th>
                  <th>Nome do titular</th>
                  <th>Situação</th>
                  <th>Consulta</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((consulta) => (
                  <tr key={consulta.id}>
                    <td>{new Date(consulta.created_at).toLocaleString()}</td>
                    <td>{consulta.form_data?.nome}</td>
                    <td>Finished</td>
                    <td>
                      <Link
                        href={`/consulta/${consulta.id}`}
                        className={styles.viewLink}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultaTable;
