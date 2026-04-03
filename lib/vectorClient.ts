import { ChromaClient, Collection } from "chromadb";
import { DocumentChunk } from "@/types";

const COLLECTION_NAME = "rag_documents";

function getClient(): ChromaClient {
  return new ChromaClient({
    path: process.env.CHROMA_URL || "http://localhost:8000",
  });
}

async function getCollection(): Promise<Collection> {
  const client = getClient();
  return await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { "hnsw:space": "cosine" },
  });
}

export async function storeChunks(
  chunks: DocumentChunk[],
  embeddings: number[][]
): Promise<void> {
  const collection = await getCollection();

  const BATCH_SIZE = 100;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + BATCH_SIZE);
    const batchEmbeddings = embeddings.slice(i, i + BATCH_SIZE);

    await collection.add({
      ids: batchChunks.map((c) => c.id),
      documents: batchChunks.map((c) => c.content),
      embeddings: batchEmbeddings,
      metadatas: batchChunks.map((c) => ({
        documentId: c.metadata.documentId,
        documentName: c.metadata.documentName,
        pageNumber: c.metadata.pageNumber,
        chunkIndex: c.metadata.chunkIndex,
      })),
    });
  }
}

export async function queryChunks(
  queryEmbedding: number[],
  topK: number = 5
): Promise<{
  chunks: DocumentChunk[];
  distances: number[];
}> {
  const collection = await getCollection();

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  const chunks: DocumentChunk[] = [];
  const distances: number[] = [];

  if (results.ids[0]) {
    for (let i = 0; i < results.ids[0].length; i++) {
      chunks.push({
        id: results.ids[0][i],
        content: results.documents[0]?.[i] || "",
        metadata: {
          documentId:
            (results.metadatas[0]?.[i]?.documentId as string) || "",
          documentName:
            (results.metadatas[0]?.[i]?.documentName as string) || "",
          pageNumber:
            (results.metadatas[0]?.[i]?.pageNumber as number) || 0,
          chunkIndex:
            (results.metadatas[0]?.[i]?.chunkIndex as number) || 0,
        },
      });
      distances.push(results.distances?.[0]?.[i] || 0);
    }
  }

  return { chunks, distances };
}

export async function deleteDocumentChunks(
  documentId: string
): Promise<void> {
  const collection = await getCollection();
  await collection.delete({
    where: { documentId: documentId },
  });
}

export async function getCollectionInfo(): Promise<{
  name: string;
  count: number;
}> {
  const collection = await getCollection();
  const count = await collection.count();
  return { name: COLLECTION_NAME, count };
}