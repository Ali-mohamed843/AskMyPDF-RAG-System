import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddingClient";
import { queryChunks } from "@/lib/vectorClient";
import { generateAnswer } from "@/lib/geminiClient";
import { ApiResponse, DocumentChunk } from "@/types";

export interface AskResponse {
  answer: string;
  sources: DocumentChunk[];
  question: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Question is required" },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length < 3) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Question is too short" },
        { status: 400 }
      );
    }

    console.log(`[ASK] Question: "${trimmedQuestion}"`);

    console.log("[1/3] Embedding question...");
    const questionEmbedding = await generateEmbedding(trimmedQuestion);

    console.log("[2/3] Searching for relevant chunks...");
    const { chunks, distances } = await queryChunks(questionEmbedding, 10);

    if (chunks.length === 0) {
      return NextResponse.json<ApiResponse<AskResponse>>({
        success: true,
        data: {
          answer: "I couldn't find any relevant information in the uploaded documents. Please make sure you've uploaded a PDF that contains information related to your question.",
          sources: [],
          question: trimmedQuestion,
        },
      });
    }

    console.log(`  Found ${chunks.length} relevant chunks (distances: ${distances.map(d => d.toFixed(3)).join(", ")})`);

    console.log("[3/3] Generating answer with Gemini...");
    const answer = await generateAnswer({
      question: trimmedQuestion,
      context: chunks.map((c) => c.content),
    });

    console.log("[ASK] Complete!");

    return NextResponse.json<ApiResponse<AskResponse>>({
      success: true,
      data: {
        answer,
        sources: chunks,
        question: trimmedQuestion,
      },
    });
  } catch (error) {
    console.error("Ask error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate answer";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}