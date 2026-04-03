const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-embedding-001";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedWithRetry(
  url: string,
  body: object,
  maxRetries: number = 5
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) return response;

    if (response.status === 429) {
      const text = await response.text();
      const retryMatch = text.match(/retry in ([\d.]+)s/i);
      const waitSeconds = retryMatch ? parseFloat(retryMatch[1]) + 2 : (attempt + 1) * 15;
      console.log(`  Rate limited. Waiting ${waitSeconds}s (attempt ${attempt + 1}/${maxRetries})...`);
      await sleep(waitSeconds * 1000);
      continue;
    }

    const error = await response.text();
    throw new Error(`Embedding failed: ${response.status} - ${error}`);
  }

  throw new Error("Max retries exceeded");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await embedWithRetry(
    `${BASE_URL}/${MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      model: MODEL,
      content: { parts: [{ text }] },
    }
  );

  const data = await response.json();
  return data.embedding.values;
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const allEmbeddings: number[][] = [];
  const BATCH_SIZE = 20;
  const totalBatches = Math.ceil(texts.length / BATCH_SIZE);

  console.log(`  Total texts: ${texts.length}, batch size: ${BATCH_SIZE}, total batches: ${totalBatches}`);

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      const response = await embedWithRetry(
        `${BASE_URL}/${MODEL}:batchEmbedContents?key=${GEMINI_API_KEY}`,
        {
          requests: batch.map((text) => ({
            model: MODEL,
            content: { parts: [{ text }] },
          })),
        }
      );

      const data = await response.json();
      allEmbeddings.push(
        ...data.embeddings.map((e: { values: number[] }) => e.values)
      );
    } catch {
      console.log(`  Batch ${batchNumber}: batch API failed, falling back to individual requests...`);
      for (const text of batch) {
        const embedding = await generateEmbedding(text);
        allEmbeddings.push(embedding);
        await sleep(200);
      }
    }

    console.log(`  Batch ${batchNumber}/${totalBatches} done (${allEmbeddings.length}/${texts.length} embedded)`);

    if (i + BATCH_SIZE < texts.length) {
      await sleep(15000);
    }
  }

  return allEmbeddings;
}