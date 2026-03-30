import pdfParse from "pdf-parse";
import { DocumentChunk } from "@/types";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

export function splitTextIntoChunks(
  text: string,
  documentId: string,
  documentName: string
): DocumentChunk[] {
  const cleanedText = text.replace(/\s+/g, " ").trim();
  const chunks: DocumentChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(start + CHUNK_SIZE, cleanedText.length);
    let chunkText = cleanedText.slice(start, end);

    if (end < cleanedText.length) {
      const lastPeriod = chunkText.lastIndexOf(".");
      const lastNewline = chunkText.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > CHUNK_SIZE * 0.3) {
        chunkText = chunkText.slice(0, breakPoint + 1);
      }
    }

    if (chunkText.trim().length > 0) {
      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        content: chunkText.trim(),
        metadata: {
          documentId,
          documentName,
          pageNumber: Math.floor(start / 3000) + 1,
          chunkIndex,
        },
      });
      chunkIndex++;
    }

    const nextStart = start + Math.max(chunkText.length - CHUNK_OVERLAP, 1);
    if (nextStart <= start) {
      break;
    }
    start = nextStart;
  }

  return chunks;
}