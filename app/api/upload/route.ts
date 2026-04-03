import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF, splitTextIntoChunks } from "@/lib/pdfProcessor";
import { generateEmbeddings } from "@/lib/embeddingClient";
import { storeChunks } from "@/lib/vectorClient";
import { ApiResponse } from "@/types";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "File must be under 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const documentId = crypto.randomUUID();

    console.log(`[1/4] Extracting text from "${file.name}"...`);
    const text = await extractTextFromPDF(buffer);

    if (!text || text.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Could not extract text from PDF" },
        { status: 422 }
      );
    }

    console.log(`[2/4] Splitting into chunks...`);
    const chunks = splitTextIntoChunks(text, documentId, file.name);
    console.log(`  → ${chunks.length} chunks created`);

    console.log(`[3/4] Generating embeddings with Gemini...`);
    const embeddings = await generateEmbeddings(
      chunks.map((c) => c.content)
    );
    console.log(`  → ${embeddings.length} embeddings generated (${embeddings[0]?.length}D)`);

    console.log(`[4/4] Storing in ChromaDB...`);
    await storeChunks(chunks, embeddings);
    console.log(`  → Stored successfully`);

    return NextResponse.json<
      ApiResponse<{
        documentId: string;
        fileName: string;
        totalChunks: number;
        textLength: number;
        embeddingDimension: number;
      }>
    >({
      success: true,
      data: {
        documentId,
        fileName: file.name,
        totalChunks: chunks.length,
        textLength: text.length,
        embeddingDimension: embeddings[0]?.length || 0,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process PDF";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}