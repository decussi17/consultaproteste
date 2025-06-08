"use client";

import { useState } from "react";
import styles from "./consultaTable.module.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar/sidebar";

interface Documento {
  id: number;
  document_name: string;
  status: string;
  response_data: any;
}

interface Props {
  documentos: Documento[];
  consultaId: string;
  nomePessoa: string;
}

export default function ConsultaTable({
  documentos,
  consultaId,
  nomePessoa,
}: Props) {
  const [selecionados, setSelecionados] = useState<number[]>(
    documentos.filter((doc) => doc.status === "Finished").map((doc) => doc.id)
  );

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const selecionarTodos = () => {
    const finishedDocs = documentos
      .filter((doc) => doc.status === "Finished")
      .map((doc) => doc.id);
    if (selecionados.length === finishedDocs.length) {
      setSelecionados([]);
    } else {
      setSelecionados(finishedDocs);
    }
  };

  const parseError = (response_data: any, status: string) => {
    if (response_data?.data?.[0]?.numero_pedido && status !== "Finished") {
      return `Pedido: ${response_data?.data[0]?.numero_pedido}, Data: ${response_data?.data[0]?.pedido_data}`;
    }
    if (response_data?.code === 200) return null;
    if (response_data?.errors?.length) {
      return `Código: ${response_data.code} - ${response_data.errors.join(
        ", "
      )}`;
    }
    if (response_data?.code_message) {
      return `Código: ${response_data.code} - ${response_data.code_message}`;
    }
    if (response_data?.message) {
      return `Código: ${response_data.code} - ${response_data.message}`;
    }
    return response_data?.code
      ? `Código: ${response_data.code} - Erro desconhecido`
      : null;
  };

  // Função para detectar se um documento é HTML
  const isHtmlDocument = (url: string): boolean => {
    if (!url) return false;
    const urlLower = url.toLowerCase();
    return (
      urlLower.includes(".html") ||
      urlLower.includes("html") ||
      (!urlLower.includes(".pdf") && !urlLower.endsWith(".pdf"))
    );
  };

  // Função para obter o tipo de documento
  const getDocumentType = (documento: Documento): string => {
    if (documento.status !== "Finished") return "";

    const siteReceipt =
      documento.response_data?.site_receipts?.[0] ||
      documento.response_data?.data?.[0]?.site_receipt;

    if (!siteReceipt) return "";

    return isHtmlDocument(siteReceipt) ? "HTML" : "PDF";
  };

  const urlDownload =
    selecionados.length === 0
      ? "#"
      : `/api/download-pdfs/${consultaId}?ids=${selecionados.join(",")}`;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome do Documento</th>
                  <th>Status</th>
                  <th>Tipo</th>
                  <th>Retorno</th>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        selecionados.length ===
                        documentos.filter((doc) => doc.status === "Finished")
                          .length
                      }
                      onChange={selecionarTodos}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {documentos
                  .sort((a, b) => a.id - b.id)
                  .map((documento, index) => {
                    const erro = parseError(
                      documento.response_data,
                      documento.status
                    );
                    const documentType = getDocumentType(documento);
                    const siteReceipt =
                      documento.response_data?.site_receipts?.[0] ||
                      documento.response_data?.data?.[0]?.site_receipt;

                    return (
                      <tr key={documento.id}>
                        <td>{index + 1}</td>
                        <td>{documento.document_name}</td>
                        <td>{documento.status}</td>

                        <td>
                          <div className={styles.retorno}>
                            {documento.status === "Finished" && siteReceipt && (
                              <a
                                href={siteReceipt}
                                target="_blank"
                                className={styles.btn_1}
                              >
                                Abrir
                              </a>
                            )}
                            {erro && (
                              <span className="text-danger">{erro}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={selecionados.includes(documento.id)}
                            onChange={() => toggleSelecionado(documento.id)}
                            disabled={documento.status === "Error"}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className={styles.buttons}>
            <a href="/consulta" className={styles.btn_2}>
              Voltar para o Histórico de Consultas
            </a>
            <a
              className={`${styles.btn_1} ${
                selecionados.length === 0 ? "disabled" : ""
              }`}
              href={urlDownload}
              target="_blank"
            >
              {selecionados.length === documentos.length
                ? "Download de todos os documentos (PDF)"
                : `Download de ${selecionados.length} documento(s) (PDF)`}
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
