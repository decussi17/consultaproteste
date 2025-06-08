import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { mergePdfLinks } from "@/helpers/functions";
import { ClientFormData } from "@/types";
import puppeteer from "puppeteer";
// Importar fetch para Node.js
import fetch from "node-fetch";

const prisma = new PrismaClient();

// Função para converter HTML em PDF
async function convertHtmlToPdf(htmlUrl: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(htmlUrl, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

// Função para detectar se uma URL é HTML ou PDF
function isHtmlDocument(url: string): boolean {
  const urlLower = url.toLowerCase();
  return (
    urlLower.includes(".html") ||
    urlLower.includes("html") ||
    (!urlLower.includes(".pdf") && !urlLower.endsWith(".pdf"))
  );
}

// Função auxiliar para fazer merge de PDFs incluindo buffers
async function mergePdfLinksAndBuffers(
  inputs: (string | Buffer)[]
): Promise<Buffer> {
  const { PDFDocument } = await import("pdf-lib");

  const mergedPdf = await PDFDocument.create();

  for (const input of inputs) {
    try {
      let pdfUint8Array: Uint8Array;

      if (typeof input === "string") {
        // É uma URL
        const response = await fetch(input);
        if (!response.ok) {
          console.warn(`Falha ao buscar PDF: ${input}`);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        pdfUint8Array = new Uint8Array(arrayBuffer);
      } else {
        // É um Buffer
        pdfUint8Array = new Uint8Array(
          input.buffer,
          input.byteOffset,
          input.byteLength
        );
      }

      const pdf = await PDFDocument.load(pdfUint8Array);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (error) {
      console.error(`Erro ao processar PDF:`, error);
      continue;
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  return Buffer.from(mergedPdfBytes);
}

export async function GET(
  req: Request,
  { params }: { params: { consultaId: string } }
) {
  const { consultaId } = params;
  const { searchParams } = new URL(req.url);
  const idsSelecionados = searchParams.get("ids")?.split(",").map(Number) || [];

  try {
    const consulta = await prisma.consulta.findUnique({
      where: { id: parseInt(consultaId) },
      include: { documentos: true },
    });

    if (!consulta || !consulta.documentos || consulta.documentos.length === 0) {
      return NextResponse.json(
        { error: "Nenhum documento encontrado para a consulta fornecida." },
        { status: 404 }
      );
    }

    const sentData = consulta.form_data as ClientFormData;

    // Mapeamento da ordem desejada com suas possíveis variações
    const ordemDesejadaMap = [
      {
        id: "RF",
        termos: [
          "RF",
          "RECEITA FEDERAL",
          "DÉBITOS RELATIVOS",
          "CRÉDITOS TRIBUTÁRIOS FEDERAIS",
        ],
      },
      { id: "TRT2", termos: ["TRT2", "RECLAMAÇÃO TRABALHISTA"] },
      { id: "TRT15", termos: ["TRT15", "ELETRÔNICA DE AÇÕES TRABALHISTAS"] },
      { id: "CNDT", termos: ["CNDT", "NEGATIVA DE DÉBITOS TRABALHISTAS"] },
      { id: "PJE", termos: ["PJE", "ELETRÔNICOS TRABALHISTAS"] },
      { id: "PROTESTOS", termos: ["PROTESTOS", "CENTRAL DE PROTESTOS"] },
      { id: "MUNICIPAL", termos: ["MUNICIPAL", "TRIBUTOS MUNICIPAIS"] },
      { id: "DIVIDA ATIVA", termos: ["DIVIDA ATIVA", "DÍVIDA ATIVA"] },
      {
        id: "ESTADUAL",
        termos: ["ESTADUAL", "DÉBITOS TRIBUTÁRIOS NÃO INSCRITOS"],
      },
      { id: "JF CIVEL", termos: ["JF CIVEL", "JUSTIÇA FEDERAL CIVEL"] },
      {
        id: "JF CIVEL 2 GRAU",
        termos: ["JF CIVEL 2", "SEGUNDO GRAU", "2 GRAU"],
      },
      {
        id: "JF CRIMINAL",
        termos: ["JF CRIMINAL", "JUSTIÇA FEDERAL CRIMINAL"],
      },
      {
        id: "JF CRIMINAL 2 GRAU",
        termos: ["JF CRIMINAL 2", "CRIMINAL SEGUNDO GRAU"],
      },
      {
        id: "TJ CIVEL",
        termos: ["TJ CIVEL", "DISTRIBUIÇÃO CIVEL EM GERAL", "ATÉ 10 ANOS"],
      },
      {
        id: "TJ INVENTÁRIOS",
        termos: ["TJ INVENTÁRIOS", "INVENTÁRIOS", "ARROLAMENTOS"],
      },
      {
        id: "TJ FALÊNCIAS",
        termos: ["TJ FALÊNCIAS", "FALÊNCIAS", "CONCORDATAS", "RECUPERAÇÕES"],
      },
      {
        id: "TJ CRIMINAL",
        termos: ["TJ CRIMINAL", "CRIMINAL", "AÇÕES CRIMINAIS"],
      },
      {
        id: "PROCESSOS",
        termos: ["PROCESSOS", "TJ CONSULTA", "CONSULTA PROCESSUAL"],
      },
    ];

    // Filtrar os documentos selecionados e disponíveis (incluindo HTML agora)
    const documentosElegiveis = consulta.documentos
      .filter(
        (doc) =>
          doc.status === "Finished" &&
          idsSelecionados.includes(doc.id) &&
          (doc.response_data as any).data?.[0]?.site_receipt
      )
      .map((doc) => {
        const docName = doc.document_name.toUpperCase();
        const siteReceipt = (doc.response_data as any).data[0].site_receipt;

        // Identificar o tipo de documento baseado nos termos de busca
        let tipoDocumentoId = "";

        for (const tipo of ordemDesejadaMap) {
          if (
            tipo.termos.some((termo) => docName.includes(termo.toUpperCase()))
          ) {
            tipoDocumentoId = tipo.id;
            break;
          }
        }

        // Se não encontrou uma correspondência, use um valor alto para colocar no final
        const ordem = tipoDocumentoId
          ? ordemDesejadaMap.findIndex((t) => t.id === tipoDocumentoId)
          : 999;

        return {
          id: doc.id,
          nome: doc.document_name,
          tipoDocumentoId,
          ordem,
          documentUrl: siteReceipt,
          isHtml: isHtmlDocument(siteReceipt),
        };
      });

    // Ordenar documentos conforme a ordem mapeada
    documentosElegiveis.sort((a, b) => a.ordem - b.ordem);

    console.log(`Processando ${documentosElegiveis.length} documentos:`);
    documentosElegiveis.forEach((doc) => {
      console.log(
        `- ${doc.nome}: ${doc.isHtml ? "HTML" : "PDF"} - ${doc.documentUrl}`
      );
    });

    if (documentosElegiveis.length === 0) {
      return NextResponse.json(
        { error: "Nenhum documento selecionado disponível para download." },
        { status: 400 }
      );
    }

    // Processar documentos: converter HTML para PDF quando necessário
    const pdfInputs: (string | Buffer)[] = [];

    for (const doc of documentosElegiveis) {
      try {
        if (doc.isHtml) {
          console.log(`Convertendo HTML para PDF: ${doc.nome}`);
          const pdfBuffer = await convertHtmlToPdf(doc.documentUrl);
          pdfInputs.push(pdfBuffer);
        } else {
          pdfInputs.push(doc.documentUrl);
        }
      } catch (error) {
        console.error(`Erro ao processar documento ${doc.nome}:`, error);
        // Continua com os outros documentos
        continue;
      }
    }

    if (pdfInputs.length === 0) {
      return NextResponse.json(
        { error: "Nenhum documento pôde ser processado para download." },
        { status: 400 }
      );
    }

    // Fazer merge dos PDFs (incluindo os convertidos de HTML)
    const mergedPdfBuffer = await mergePdfLinksAndBuffers(pdfInputs);

    return new NextResponse(mergedPdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Documentos ${sentData.nome}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao unir PDFs:", error);
    return NextResponse.json({ error: "Erro ao unir PDFs" }, { status: 500 });
  }
}
