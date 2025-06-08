import { mergePdfLinks } from "@/helpers/functions";
import { ClientFormData } from "@/types";
import { Consulta, Documento, PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(`${process.env.EMAIL_SERVER_PORT}`),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// decussi e de jesus
// const token = "G16vq2BYHYIaA_dX-cNuZ9j2oqifFjuJ_ohioONV";
// imoveis pro
const token = "IZuBn8VPd4DiRbsjiax40l7FivDcCheuom1btVEQ";

async function processDocumentsPending() {
  const documentsToProcess = await prisma.documento.findMany({
    where: {
      status: "Pending",
    },
    include: {
      consulta: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  documentsToProcess.map(async (document) => {
    let sentData: object = (document.sent_data || {}) as ClientFormData;

    console.log(`Processing document ${document.id}`);

    const formData = document?.consulta?.form_data as any;

    if (formData.tipo_pessoa === "fisica") {
      if (document.integration_url.includes("tribunal/tjsp/primeiro-grau")) {
        sentData = {
          ...sentData,
          parte: formData.nome,
          cpf: formData.cpf,
        };
      } else if (document.integration_url.includes("trf3/certidao-distr")) {
        sentData = {
          ...sentData,
          cpf: formData.cpf,
          nome_mae: formData.nome_mae,
          birthdate: formData.nascimento,
        };
      } else if (document.integration_url.includes("tjsp/pedido-certidao")) {
        sentData = {
          ...sentData,
          nome_completo: formData.nome,
          cpf: formData.cpf,
          nome_mae: formData.nome_mae,
          birthdate: formData.nascimento,
          email_envio: `documentos_${document.consulta_id}@techinfinity.com.br`,
          rg: formData.rg_document,
          genero: formData.gender,
        };
      } else {
        sentData = {
          ...sentData,
          nome: formData.nome,
          cpf: formData.cpf,
        };
      }
    } else if (formData.tipo_pessoa === "juridica") {
      if (document.integration_url.includes("tribunal/tjsp/primeiro-grau")) {
        sentData = {
          ...sentData,
          parte: formData.nome,
          cnpj: formData.cnpj,
        };
      } else if (document.integration_url.includes("tjsp/pedido-certidao")) {
        sentData = {
          ...sentData,
          razao_social: formData.nome,
          cnpj: formData.cnpj,
          nome_mae: formData.nome_mae,
          birthdate: formData.nascimento,
          email_envio: `documentos_${document.consulta_id}@techinfinity.com.br`,
        };
      } else if (document.integration_url.includes("trf3/certidao-distr")) {
        sentData = {
          ...sentData,
          cnpj: formData.cnpj,
          email_envio: `documentos_${document.consulta_id}@techinfinity.com.br`,
        };
      } else if (document.integration_url.includes("tribunal/trt23/ceat")) {
        sentData = {
          ...sentData,
          cnpj: formData.cnpj,
        };
      } else if (document.integration_url.includes("trt2/ceat-digital")) {
        sentData = {
          ...sentData,
          cnpj_raiz: formData.cnpj,
        };
      } else {
        sentData = {
          ...sentData,
          nome: formData.nome,
          cnpj: formData.cnpj,
        };
      }
    } else {
      throw new Error("Invalid person type");
    }

    let response = {} as any;

    try {
      response = await fetch(document.integration_url + `?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sentData),
      });
    } catch (error) {
      response = {
        statusText: (error as any)?.message || error,
      };
    }

    let documentData = {} as any;

    try {
      documentData = await response.json();
    } catch (error) {
      documentData = {
        code: 500,
        message: response?.statusText,
      };
    }

    let status: any =
      ([200, 612].includes(documentData.code) && "Finished") || "Error";

    if (document.integration_url.includes("tjsp/pedido-certidao")) {
      if (documentData?.data[0]?.numero_pedido) {
        status = "Processing";
      }
    }

    await prisma.documento.update({
      where: {
        id: document.id,
      },
      data: {
        response_data: documentData,
        sent_data: sentData || {},
        status,
      },
    });

    console.log(`Document ${document.id} processed`);
  });
}

async function processDocumentsProcessing() {
  const documentsToProcess = await prisma.documento.findMany({
    where: {
      status: "Processing",
    },
    include: {
      consulta: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  documentsToProcess.map(async (document) => {
    let formData = (document.response_data || {}) as any;

    let sentData: any = {};

    console.log(`Processing document ${document.id}`);

    if (document.integration_url.includes("tjsp/pedido-certidao")) {
      sentData = {
        numero_pedido: formData?.data[0].numero_pedido,
        pedido_data: formData?.data[0].pedido_data
          .split("/")
          .reverse()
          .join("-"),
      };
      if ((document.sent_data as ClientFormData)?.cnpj) {
        sentData.cnpj = (document.sent_data as ClientFormData).cnpj;
      } else {
        sentData.cpf = (document.sent_data as ClientFormData).cpf;
      }
    }
    console.log(sentData);

    let response = {} as any;

    console.log(sentData);

    try {
      response = await fetch(
        "https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/obter-certidao" +
          `?token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sentData),
        }
      );
    } catch (error) {
      response = {
        statusText: (error as any)?.message || error,
      };
    }

    let documentData = {} as any;

    try {
      documentData = await response.json();
    } catch (error) {
      documentData = {
        code: 500,
        message: response?.statusText,
      };
    }

    let status: any =
      ([200, 612].includes(documentData.code) && "Finished") || "Error";

    await prisma.documento.update({
      where: {
        id: document.id,
      },
      data: {
        response_data: documentData,
        sent_data: sentData || {},
        status,
      },
    });

    console.log(`Document ${document.id} processed`);
  });
}

async function finishPendingQueries() {
  const pendingQueries = await prisma.consulta.findMany({
    where: {
      status: "Pending",
    },
  });

  pendingQueries.map(async (query) => {
    try {
      const documents = await prisma.documento.findMany({
        where: {
          consulta_id: query.id,
        },
      });

      const allDocumentsProcessed = documents.every(
        (document) =>
          document.status === "Finished" || document.status === "Error"
      );

      if (allDocumentsProcessed) {
        if (await sendPdfToUser(query, documents)) {
          await prisma.consulta.update({
            where: {
              id: query.id,
            },
            data: {
              status: "Finished",
            },
          });
        }

        console.log(`Query ${query.id} updated`);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

async function sendPdfToUser(query: Consulta, documents: Documento[]) {
  const pdfUrls = documents
    .filter(
      (doc) =>
        doc.status === "Finished" &&
        (doc.response_data as any).data[0]?.site_receipt?.endsWith(".pdf")
    )
    .map((doc) => {
      const siteReceipt = (doc.response_data as any).data[0]?.site_receipt;
      return siteReceipt;
    });

  const pdfBuffer = await mergePdfLinks(pdfUrls);

  const clientData = query?.form_data as ClientFormData;
  let emailBody = `Prezado(a) ${clientData.nome},\n\nSegue abaixo o status dos documentos processados:\n\n`;

  const statusTranslations: { [key: string]: string } = {
    Finished: "Finalizado",
  };

  documents.forEach((doc) => {
    const documentName = doc.document_name || "Documento não especificado";
    const status = doc.status || "Status desconhecido";

    const translatedStatus = statusTranslations[status] || status;

    const responseData = doc.response_data as any;
    const errors = responseData?.errors || null;
    const code = responseData?.code || null;

    if (
      status === "Error" ||
      (errors && Array.isArray(errors) && errors.length > 0)
    ) {
      const errorMessages = errors?.join("; ") || "Erro desconhecido";
      emailBody += `- ${documentName} - ${translatedStatus.toUpperCase()} - Motivo: ${errorMessages}\n`;
    } else if (translatedStatus === "Finalizado") {
      emailBody += `- ${documentName} - ${translatedStatus.toUpperCase()}\n`;
    } else {
      emailBody += `- ${documentName} - ${translatedStatus.toUpperCase()} - Motivo: Sem mensagem de erro\n`;
    }
  });

  emailBody += `\nOs documentos prontos estão anexados neste e-mail em formato PDF.\n\nAtenciosamente,\nEquipe`;

  await transporter.sendMail({
    from: process.env.EMAIL_SERVER_USER,
    to: clientData.email,
    subject: `Documentação do cliente ${clientData.nome}`,
    text: emailBody,
    attachments: [
      {
        filename: `Documentos ${clientData.nome}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return true;
}

export async function POST(request: NextRequest) {
  try {
    processDocumentsPending();

    processDocumentsProcessing();

    finishPendingQueries();
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({ message: "Documents processed" });
}
