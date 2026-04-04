const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-2.5-flash";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface GenerateAnswerOptions {
  question: string;
  context: string[];
  conversationHistory?: ChatMessage[];
}

export async function generateAnswer(
  options: GenerateAnswerOptions
): Promise<string> {
  const { question, context, conversationHistory = [] } = options;

  const systemPrompt = `You are a helpful AI tutor that answers questions based on provided course material.

CONTEXT FROM DOCUMENTS:
${context.map((chunk, i) => `[Source ${i + 1}]:\n${chunk}`).join("\n\n---\n\n")}

INSTRUCTIONS:
1. Answer the question using ONLY the information from the context above
2. Synthesize information across multiple sources if needed
3. If the context contains partial information, piece it together to form a complete answer
4. If explaining a concept, use examples from the context when available
5. If you genuinely cannot answer from the context, say so clearly
6. For homework/assignment questions: explain the concept instead of solving directly
7. Be clear, concise, and educational

Now answer the following question based on the context provided.`;

  const contents = [];

  contents.push({
    role: "user",
    parts: [{ text: systemPrompt }],
  });

  contents.push({
    role: "model",
    parts: [{ text: "I understand. I will answer questions based on the provided document context, synthesizing information across sources when needed, and helping students learn concepts rather than just solving homework problems." }],
  });

  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: question }],
  });

  const response = await fetch(
    `${BASE_URL}/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini chat failed: ${response.status} - ${error}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("No response generated from Gemini");
  }

  const answer = data.candidates[0].content?.parts?.[0]?.text;

  if (!answer) {
    throw new Error("Empty response from Gemini");
  }

  return answer;
}

export async function generateAnswerStream(
  options: GenerateAnswerOptions
): Promise<ReadableStream<Uint8Array>> {
  const { question, context, conversationHistory = [] } = options;

  const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided document context.

IMPORTANT RULES:
1. Only answer based on the provided context
2. If the context doesn't contain enough information to answer, say so clearly
3. Be concise but thorough
4. If you quote from the context, be accurate
5. Reference which part of the context your answer comes from when relevant

CONTEXT FROM DOCUMENTS:
${context.map((chunk, i) => `[Source ${i + 1}]:\n${chunk}`).join("\n\n")}`;

  const contents = [];

  contents.push({
    role: "user",
    parts: [{ text: systemPrompt }],
  });

  contents.push({
    role: "model",
    parts: [{ text: "I understand. I will answer questions based only on the provided document context and follow all the rules. Please ask your question." }],
  });

  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: question }],
  });

  const response = await fetch(
    `${BASE_URL}/${MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini stream failed: ${response.status} - ${error}`);
  }

  return response.body!;
}