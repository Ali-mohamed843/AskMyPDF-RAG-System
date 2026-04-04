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
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (cleanedText.length === 0) {
    return [];
  }

  if (cleanedText.length <= CHUNK_SIZE) {
    return [
      {
        id: `${documentId}_chunk_0`,
        content: cleanedText,
        metadata: {
          documentId,
          documentName,
          pageNumber: 1,
          chunkIndex: 0,
        },
      },
    ];
  }

  const chunks: DocumentChunk[] = [];
  let position = 0;
  let chunkIndex = 0;

  while (position < cleanedText.length) {
    let end = position + CHUNK_SIZE;

    if (end >= cleanedText.length) {
      end = cleanedText.length;
    } else {
      const searchStart = Math.max(position + CHUNK_SIZE - 200, position);
      const searchRegion = cleanedText.slice(searchStart, end);

      const sentenceEnd = searchRegion.lastIndexOf(". ");
      const paragraphEnd = searchRegion.lastIndexOf("\n\n");
      const newlineEnd = searchRegion.lastIndexOf("\n");

      let breakPoint = -1;

      if (paragraphEnd !== -1) {
        breakPoint = paragraphEnd + 2;
      } else if (sentenceEnd !== -1) {
        breakPoint = sentenceEnd + 2;
      } else if (newlineEnd !== -1) {
        breakPoint = newlineEnd + 1;
      }

      if (breakPoint !== -1) {
        end = searchStart + breakPoint;
      }
    }

    const chunkContent = cleanedText.slice(position, end).trim();

    if (chunkContent.length > 0) {
      const estimatedPage = Math.floor(position / 3000) + 1;

      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        content: chunkContent,
        metadata: {
          documentId,
          documentName,
          pageNumber: estimatedPage,
          chunkIndex,
        },
      });

      chunkIndex++;
    }

    const nextPosition = end - CHUNK_OVERLAP;

    if (nextPosition <= position) {
      position = end;
    } else {
      position = nextPosition;
    }

    if (end >= cleanedText.length) {
      break;
    }
  }

  return chunks;
}