import { PDFDocument } from "pdf-lib";

// Função original para merge apenas de URLs
export async function mergePdfLinks(pdfUrls: string[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const url of pdfUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Falha ao buscar PDF: ${url}`);
        continue;
      }

      const pdfBytes = await response.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (error) {
      console.error(`Erro ao processar PDF ${url}:`, error);
      continue;
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  return Buffer.from(mergedPdfBytes);
}

// Função auxiliar para converter Buffer em Uint8Array
function bufferToUint8Array(buffer: Buffer): Uint8Array {
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

// Nova função para merge de URLs e Buffers - versão mais segura
export async function mergePdfLinksAndBuffers(
  inputs: (string | Buffer)[]
): Promise<Buffer> {
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
        pdfUint8Array = bufferToUint8Array(input);
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
