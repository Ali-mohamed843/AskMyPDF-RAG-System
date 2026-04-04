import { ChromaClient, Collection } from "chromadb";
import { DocumentChunk } from "@/types";

const COLLECTION_NAME = "rag_documents";

let clientInstance: ChromaClient | null = null;

function getClient(): ChromaClient {
  if (!clientInstance) {
    const chromaUrl = process.env.CHROMA_URL || "http://localhost:8000";
    const url = new URL(chromaUrl);

    clientInstance = new ChromaClient({
      host: url.hostname,
      port: parseInt(url.port) || 8000,
      ssl: url.protocol === "https:",
    });
  }
  return clientInstance;
}

async function getCollection(): Promise<Collection> {
  const client = getClient();

  const collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { "hnsw:space": "cosine" },
    embeddingFunction: null as unknown as undefined,
  });

  return collection;
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
    include: ["documents", "metadatas", "distances"],
  });

  const chunks: DocumentChunk[] = [];
  const distances: number[] = [];

  if (results.ids[0]) {
    for (let i = 0; i < results.ids[0].length; i++) {
      const content = results.documents?.[0]?.[i];
      const metadata = results.metadatas?.[0]?.[i];

      if (content && metadata) {
        chunks.push({
          id: results.ids[0][i],
          content: content,
          metadata: {
            documentId: (metadata.documentId as string) || "",
            documentName: (metadata.documentName as string) || "",
            pageNumber: (metadata.pageNumber as number) || 0,
            chunkIndex: (metadata.chunkIndex as number) || 0,
          },
        });
        distances.push(results.distances?.[0]?.[i] || 0);
      }
    }
  }

  return { chunks, distances };
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  const collection = await getCollection();
  await collection.delete({
    where: { documentId: documentId },
  });
}

export async function deleteAllChunks(): Promise<void> {
  const client = getClient();
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log("Collection deleted");
  } catch {
    console.log("Collection did not exist or could not be deleted");
  }
}

export async function getCollectionInfo(): Promise<{
  name: string;
  count: number;
}> {
  const collection = await getCollection();
  const count = await collection.count();
  return { name: COLLECTION_NAME, count };
}