import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF, splitTextIntoChunks } from "@/lib/pdfProcessor";
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

    const text = await extractTextFromPDF(buffer);

    if (!text || text.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Could not extract text from PDF" },
        { status: 422 }
      );
    }

    const chunks = splitTextIntoChunks(text, documentId, file.name);

    console.log(
      `Processed "${file.name}": ${text.length} chars → ${chunks.length} chunks`
    );

    return NextResponse.json<
      ApiResponse<{
        documentId: string;
        fileName: string;
        totalChunks: number;
        textLength: number;
        sampleChunk: string;
      }>
    >({
      success: true,
      data: {
        documentId,
        fileName: file.name,
        totalChunks: chunks.length,
        textLength: text.length,
        sampleChunk: chunks[0]?.content.slice(0, 200) || "",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}